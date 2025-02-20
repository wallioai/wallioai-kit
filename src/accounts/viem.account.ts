import {
  Account,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  Hex,
  http,
  parseEther,
  PublicClient,
  ReadContractParameters,
  ReadContractReturnType,
  TransactionReceipt,
  TransactionRequest,
  WalletClient,
  WriteContractParameters,
} from "viem";
import { Chain } from "viem/chains";
import { BaseAccount } from "./base.account";
import { getNetworkInfo } from "../networks";
import { Network } from "../types";
import { getTransactionGas } from "./utils";

export type ViemAccountConfig = {
  account: Account;
  rpcUrl?: string;
};

export class ViemAccount extends BaseAccount {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private gasLimitMultiplier: number;
  private feePerGasMultiplier: number;

  constructor(walletClient: ViemAccountConfig) {
    super();
    this.walletClient = createWalletClient({
      account: walletClient.account,
      transport: http(walletClient.rpcUrl ?? ""),
    });
    this.publicClient = createPublicClient({
      chain: this.walletClient.chain,
      transport: http(walletClient.rpcUrl ?? ""),
    });

    this.gasLimitMultiplier = Math.max(1.2, 1);
    this.feePerGasMultiplier = Math.max(1, 1);
  }

  /**
   * Gets the address of the wallet.
   *
   * @returns The address of the wallet.
   */
  getAddress(): string {
    return this.walletClient.account?.address ?? "";
  }

  /**
   * Get the network of the wallet provider.
   *
   * @returns The network of the wallet provider.
   */
  getNetwork(): Network {
    return getNetworkInfo(this.walletClient.chain!);
  }

  /**
   * Get the name of the wallet provider.
   *
   * @returns The name of the wallet provider.
   */
  getName(): string {
    return "viem";
  }

  /**
   * Gets the balance of the wallet.
   *
   * @returns The balance of the wallet.
   */
  async getBalance(): Promise<bigint> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Account not found");
    }
    return this.publicClient.getBalance({ address: account.address });
  }

  /**
   * Transfer the native asset of the network.
   *
   * @param to - The destination address.
   * @param value - The amount to transfer in whole units (e.g. ETH)
   * @returns The transaction hash.
   */
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

  /**
   * Sends a transaction.
   *
   * @param transaction - The transaction to send.
   * @returns The hash of the transaction.
   */
  async sendTransaction(
    transaction: TransactionRequest & { chain?: Chain },
  ): Promise<`0x${string}`> {
    const { account, chain: accountChain } = this.walletClient;
    if (!account) {
      throw new Error("Account not initialized");
    }
    // Use the provided chain from params or fall back to the current wallet's chain
    const chain = transaction.chain ?? accountChain;
    if (!chain) {
      throw new Error("Chain not initialized");
    }

    let chainPublicClient = this.publicClient;
    if (transaction.chain) {
      chainPublicClient = createPublicClient({
        chain: transaction.chain, // Dynamically use the chain passed to the transaction
        transport: http(""),
      });
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
    });
  }

  /**
   * Waits for a transaction receipt.
   *
   * @param txHash - The hash of the transaction to wait for.
   * @returns The transaction receipt.
   */
  async waitForTransactionReceipt(txHash: `0x${string}`): Promise<TransactionReceipt> {
    return await this.publicClient.waitForTransactionReceipt({ hash: txHash });
  }

  /**
   * Reads a contract.
   *
   * @param params - The parameters to read the contract.
   * @returns The response from the contract.
   */
  async readContract(params: ReadContractParameters): Promise<ReadContractReturnType> {
    return this.publicClient.readContract(params);
  }

  /**
   * Reads a contract.
   *
   * @param params - The parameters to read the contract.
   * @returns The response from the contract.
   */
  async writeContract(
    params: Omit<WriteContractParameters, "account" | "type"> & {
      chain?: Chain;
    },
  ): Promise<Hex> {
    const { account, chain: accountChain } = this.walletClient;
    if (!account) {
      throw new Error("Account not initialized");
    }

    // Use the provided chain from params or fall back to the current wallet's chain
    const chain = params.chain ?? accountChain;
    if (!chain) {
      throw new Error("Chain not initialized");
    }

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

  /**
   * Signs a transaction.
   *
   * @param transaction - The transaction to sign.
   * @returns The signed transaction.
   */
  async signTransaction(transaction: TransactionRequest): Promise<`0x${string}`> {
    const txParams = {
      account: this.walletClient.account!,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      chain: this.walletClient.chain,
    };

    return this.walletClient.signTransaction(txParams);
  }

  /**
   * Signs a message.
   *
   * @param message - The message to sign.
   * @returns The signed message.
   */
  async signMessage(message: string): Promise<`0x${string}`> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Account not initialized");
    }
    return this.walletClient.signMessage({ account, message });
  }

  /**
   * Signs a typed data object.
   *
   * @param typedData - The typed data object to sign.
   * @returns The signed typed data object.
   */
  async signTypedData(typedData: any): Promise<`0x${string}`> {
    return this.walletClient.signTypedData({
      account: this.walletClient.account!,
      domain: typedData.domain!,
      types: typedData.types!,
      primaryType: typedData.primaryType!,
      message: typedData.message!,
    });
  }
}
