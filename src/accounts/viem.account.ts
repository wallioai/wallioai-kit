import {
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  type Hex,
  http,
  parseEther,
  type PublicClient,
  type ReadContractParameters,
  type ReadContractReturnType,
  type TransactionReceipt,
  type TransactionRequest,
  type WalletClient,
  type WriteContractParameters,
  zeroAddress,
} from "viem";
import { type Chain } from "viem/chains";
import { BaseAccount } from "./base.account";
import { getChain, getNetworkInfo, prepareChain } from "../networks/evm.network";
import { type Network } from "../networks/type";
import { getTransactionGas } from "./utils/getTransactionGas";
import { ChainById, getRpc } from "../networks/constant";

export class ViemAccount extends BaseAccount {
  publicClient: PublicClient;
  walletClient: WalletClient;
  gasLimitMultiplier: number;
  feePerGasMultiplier: number;
  chainIdToRpc?: Record<string, string[]> = {};

  constructor(client: WalletClient, rpcUrls: Record<string, string[]> = {}) {
    super();
    this.walletClient = client;
    this.chainIdToRpc = rpcUrls;

    this.publicClient = createPublicClient({
      chain: this.walletClient.chain,
      transport: http(this.getRpcUrl(this.walletClient.chain)),
    });

    this.gasLimitMultiplier = Math.max(1.2, 1);
    this.feePerGasMultiplier = Math.max(1, 1);
  }

  getAddress(): string {
    return this.walletClient.account?.address ?? "";
  }

  getNetwork(): Network {
    return getNetworkInfo(this.walletClient.chain!);
  }

  getName(): string {
    return "viem";
  }

  async getBalance(token?: string, accountChain?: Chain): Promise<string> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Account not found");
    }
    const chain = prepareChain(accountChain, this.chainIdToRpc);
    if (token && token !== zeroAddress) {
      const balance = (await this.readContract({
        abi: erc20Abi,
        address: token as Hex,
        functionName: "balanceOf",
        args: [account.address],
        chain,
      })) as unknown as bigint;
      const decimals = (await this.readContract({
        abi: erc20Abi,
        address: token as Hex,
        functionName: "decimals",
        chain,
      })) as unknown as number;
      return formatUnits(balance, decimals);
    }

    let chainPublicClient = this.publicClient;
    if (accountChain) {
      // Update the public client to use the supplied chain for the transaction
      chainPublicClient = this.getClient(accountChain);
    }
    const balance = await chainPublicClient.getBalance({ address: account.address });
    return formatUnits(balance, 18);
  }

  async nativeTransfer(to: `0x${string}`, value: string): Promise<`0x${string}`> {
    const atomicAmount = parseEther(value);

    const hash = await this.sendTransaction({
      to: to,
      value: atomicAmount,
    });
    const receipt = await this.waitForTransactionReceipt(hash);

    if (!receipt) {
      throw new Error("Transaction failed");
    }

    return receipt.transactionHash;
  }

  async sendTransaction(
    transaction: TransactionRequest & { chain?: Chain },
  ): Promise<`0x${string}`> {
    const { account, chain: accountChain } = this.walletClient;
    if (!account) {
      throw new Error("Account not initialized");
    }
    const rawChain = transaction.chain ? transaction.chain : accountChain;
    if (!rawChain) {
      throw new Error("Chain not initialized");
    }
    const chain = prepareChain(rawChain, this.chainIdToRpc);
    let chainPublicClient = this.publicClient;
    if (transaction.chain) {
      // Update the public client to use the supplied chain for the transaction
      chainPublicClient = this.getClient(chain);
    }

    if (!chainPublicClient) {
      throw new Error("Chain not initialized");
    }

    const feeData = await chainPublicClient.estimateFeesPerGas();
    const gasLimit = await chainPublicClient.estimateGas({
      account,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
    });

    const { gasPrice } = getTransactionGas(
      feeData,
      this.feePerGasMultiplier,
      gasLimit,
      this.gasLimitMultiplier,
    );

    return this.walletClient.sendTransaction({
      account,
      chain,
      data: transaction.data,
      to: transaction.to,
      value: transaction.value,
      gasPrice,
      kzg: undefined, // Add this line to fix the missing 'kzg' property
    });
  }

  async waitForTransactionReceipt(
    txHash: `0x${string}`,
    chain?: Chain,
  ): Promise<TransactionReceipt> {
    const chainToUse = chain ?? this.walletClient.chain;
    const client = this.getClient(chainToUse);
    return await client.waitForTransactionReceipt({ hash: txHash });
  }

  async readContract(
    params: ReadContractParameters & { chain?: Chain },
  ): Promise<ReadContractReturnType> {
    const chainToUse = params.chain ?? this.walletClient.chain;
    const client = this.getClient(chainToUse);
    return client.readContract(params);
  }

  async writeContract(
    params: Omit<WriteContractParameters, "account" | "type"> & {
      chain?: Chain;
    },
  ): Promise<Hex> {
    const { account, chain: accountChain } = this.walletClient;
    if (!account) {
      throw new Error("Account not initialized");
    }

    const chain = params.chain ?? accountChain;
    const { address, abi, functionName, args, value } = params;
    const encodedData = encodeFunctionData({
      abi,
      functionName,
      args,
    });

    const hash = await this.sendTransaction({
      to: address,
      data: encodedData,
      ...(value && { value }),
      chain,
    });
    const receipt = await this.waitForTransactionReceipt(hash);

    if (!receipt) {
      throw new Error("Transaction failed");
    }

    return receipt.transactionHash;
  }

  async signTransaction(transaction: TransactionRequest): Promise<`0x${string}`> {
    const txParams = {
      account: this.walletClient.account!,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      chain: prepareChain(this.walletClient.chain, this.chainIdToRpc),
    };

    return this.walletClient.signTransaction(txParams);
  }

  async signMessage(message: string, chain?: Chain): Promise<`0x${string}`> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Account not initialized");
    }

    // Save the current chain before updating it
    const originalChain = this.walletClient.chain;

    // Temporarily set the chain if a new one is provided
    if (chain) {
      this.walletClient.chain = prepareChain(chain, this.chainIdToRpc);
    }

    try {
      return this.walletClient.signMessage({ account, message });
    } finally {
      // Restore the original chain after the operation
      if (chain) {
        this.walletClient.chain = originalChain;
      }
    }
  }

  async signTypedData(typedData: any, chain?: Chain): Promise<`0x${string}`> {
    // Save the current chain before updating it
    const originalChain = this.walletClient.chain;

    // Temporarily set the chain if a new one is provided
    if (chain) {
      this.walletClient.chain = prepareChain(chain, this.chainIdToRpc);
    }

    try {
      return this.walletClient.signTypedData({
        account: this.walletClient.account!,
        domain: typedData.domain!,
        types: typedData.types!,
        primaryType: typedData.primaryType!,
        message: typedData.message!,
      });
    } finally {
      // Restore the original chain after the operation
      if (chain) {
        this.walletClient.chain = originalChain;
      }
    }
  }

  private getClient(chain?: Chain): PublicClient {
    if (!chain) {
      throw new Error("Chain not initialized");
    }
    return createPublicClient({
      chain,
      transport: http(this.getRpcUrl(chain)),
    });
  }

  private getRpcUrl(chain?: Chain): string {
    if (!chain) {
      throw new Error("Chain not initialized");
    }

    const chainId = chain.id.toString();
    const rpcUrls = this.chainIdToRpc?.[chainId] ?? [];
    return getRpc(rpcUrls) ?? "";
  }
}
