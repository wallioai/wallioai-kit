import z, { z as z$1 } from 'zod';
import { Account, TransactionRequest, TransactionReceipt, ReadContractParameters, ReadContractReturnType, WriteContractParameters, Hex, FeeValuesEIP1559 } from 'viem';
import { Chain } from 'viem/chains';
import * as _heyanon_sdk from '@heyanon/sdk';

/**
 * AdapterProvider is the abstract base class for all adapters.
 *
 * @abstract
 */
declare abstract class AdapterProvider<IBaseAccount extends BaseAccount = BaseAccount> {
    /**
     * The name of the adapter provider.
     */
    readonly name: string;
    /**
     * The adapter provider functions to combine.
     */
    readonly adapterFunctions: AdapterProvider<IBaseAccount>[];
    /**
     * The constructor for the adapter provider.
     *
     * @param name - The name of the adapter provider.
     * @param adapterFunctions - The adapter provider functions to combine.
     */
    constructor(name: string, adapterFunctions: AdapterProvider<IBaseAccount>[]);
    /**
     * Gets the functions of the adapter provider bound to the given account.
     *
     * @param account - The base account provider.
     * @returns The functions of the adapter provider.
     */
    getFunctions(account: IBaseAccount): IAdapter[];
}

/**
 * Parameters for the UseFunction decorator
 */
interface UseFunctionDecoratorParams {
    /**
     * The name of the function
     */
    name: string;
    /**
     * The description of the function
     */
    description: string;
    /**
     * The schema of the function
     */
    schema: z.ZodSchema;
}
/**
 * Metadata for Agents adapters
 */
interface AdapterMetadata {
    /**
     * The name of the adapter
     */
    name: string;
    /**
     * The description of the adapter
     */
    description: string;
    /**
     * The schema of the adapter
     */
    schema: z.ZodSchema;
    /**
     * The function to invoke the adapter
     */
    invoke: (...args: any[]) => any;
    /**
     * The wallet provider to use for the adapter
     */
    account: boolean;
}
/**
 * A map of adapter names to their metadata
 */
type StoredAdapterMetadata = Map<string, AdapterMetadata>;

/**
 * Metadata key for the UseFunction decorator
 */
declare const FUNCTION_DECORATOR_KEY: unique symbol;
/**
 * Decorator to embed metadata on class methods to indicate they are adapters accessible to the agent
 *
 * @param params - The parameters for the adapter decorator
 * @returns A decorator function
 *
 * @example
 * ```typescript
 * class CustomAdapterName extends AdapterProvider {
 *   @UseFunction({ name: "my_function", description: "My function", schema: myFunctionSchema })
 *   public myFunction(args: z.infer<typeof myFunctionSchema>) {
 *     // ...
 *   }
 * }
 * ```
 */
declare function UseFunction(params: UseFunctionDecoratorParams): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => object;

/**
 * Input schema for borrowing token on venus
 *
 * The API expects a list of token symbols.
 */
declare const borrowTokenSchema: z$1.ZodObject<{
    chainName: z$1.ZodEnum<[string, ...string[]]>;
    tokenSymbol: z$1.ZodString;
    pool: z$1.ZodEnum<[string, ...string[]]>;
    amount: z$1.ZodString;
}, "strip", z$1.ZodTypeAny, {
    chainName: string;
    tokenSymbol: string;
    pool: string;
    amount: string;
}, {
    chainName: string;
    tokenSymbol: string;
    pool: string;
    amount: string;
}>;

/**
 * VenusAdapterProvider is an adapter provider for interacting with venus protocol.
 * This provider provides the ability for user to supply/borrow/withdraw multiple tokens.
 */
declare class VenusAdapterProvider extends AdapterProvider<BaseAccount> {
    constructor();
    borrow(account: ViemAccount, args: z.infer<typeof borrowTokenSchema>): Promise<_heyanon_sdk.FunctionReturn>;
}

type DexAiConfig = {
    account: BaseAccount;
    adapters: AdapterProvider[];
};

/**
 * IAdapter is the type for all agent's functions.
 * Following DynamicStructuredTool from @langchain/core/tools
 */
type IAdapter<AdapterSchema extends z.ZodSchema = z.ZodSchema> = {
    name: string;
    description: string;
    schema: AdapterSchema;
    invoke: (args: z.infer<AdapterSchema>) => Promise<string>;
};

/**
 * Network is the network that the wallet provider is connected to.
 */
interface Network {
    name?: string;
    /**
     * The protocol family of the network.
     */
    protocolFamily: string;
    chainId?: string;
    currency?: string;
}

declare abstract class BaseAccount {
    constructor();
    /**
     * Gets the address of the wallet.
     *
     * @returns The address of the wallet.
     */
    abstract getAddress(): string;
    /**
     * Get the network of the wallet provider.
     *
     * @returns The network of the wallet provider.
     */
    abstract getNetwork(): Network;
    /**
     * Get the name of the wallet provider.
     *
     * @returns The name of the wallet provider.
     */
    abstract getName(): string;
    /**
     * Get the balance of the native asset of the network.
     *
     * @returns The balance of the native asset of the network.
     */
    abstract getBalance(): Promise<bigint>;
    /**
     * Transfer the native asset of the network.
     *
     * @param to - The destination address.
     * @param value - The amount to transfer in whole units (e.g. ETH)
     * @returns The transaction hash.
     */
    abstract nativeTransfer(to: string, value: string): Promise<string>;
}

type ViemAccountConfig = {
    account: Account;
    rpcUrl?: string;
};
declare abstract class ViemAccount extends BaseAccount {
    private publicClient;
    private walletClient;
    private gasLimitMultiplier;
    private feePerGasMultiplier;
    constructor(walletClient: ViemAccountConfig);
    /**
     * Gets the address of the wallet.
     *
     * @returns The address of the wallet.
     */
    getAddress(): string;
    /**
     * Get the network of the wallet provider.
     *
     * @returns The network of the wallet provider.
     */
    getNetwork(): Network;
    /**
     * Get the name of the wallet provider.
     *
     * @returns The name of the wallet provider.
     */
    getName(): string;
    /**
     * Gets the balance of the wallet.
     *
     * @returns The balance of the wallet.
     */
    getBalance(): Promise<bigint>;
    /**
     * Transfer the native asset of the network.
     *
     * @param to - The destination address.
     * @param value - The amount to transfer in whole units (e.g. ETH)
     * @returns The transaction hash.
     */
    nativeTransfer(to: `0x${string}`, value: string): Promise<`0x${string}`>;
    /**
     * Sends a transaction.
     *
     * @param transaction - The transaction to send.
     * @returns The hash of the transaction.
     */
    sendTransaction(transaction: TransactionRequest & {
        chain?: Chain;
    }): Promise<`0x${string}`>;
    /**
     * Waits for a transaction receipt.
     *
     * @param txHash - The hash of the transaction to wait for.
     * @returns The transaction receipt.
     */
    waitForTransactionReceipt(txHash: `0x${string}`): Promise<TransactionReceipt>;
    /**
     * Reads a contract.
     *
     * @param params - The parameters to read the contract.
     * @returns The response from the contract.
     */
    readContract(params: ReadContractParameters): Promise<ReadContractReturnType>;
    /**
     * Reads a contract.
     *
     * @param params - The parameters to read the contract.
     * @returns The response from the contract.
     */
    writeContract(params: Omit<WriteContractParameters, "account" | "type"> & {
        chain?: Chain;
    }): Promise<Hex>;
    /**
     * Signs a transaction.
     *
     * @param transaction - The transaction to sign.
     * @returns The signed transaction.
     */
    signTransaction(transaction: TransactionRequest): Promise<`0x${string}`>;
    /**
     * Signs a message.
     *
     * @param message - The message to sign.
     * @returns The signed message.
     */
    signMessage(message: string): Promise<`0x${string}`>;
    /**
     * Signs a typed data object.
     *
     * @param typedData - The typed data object to sign.
     * @returns The signed typed data object.
     */
    signTypedData(typedData: any): Promise<`0x${string}`>;
}

/**
 * Scales a gas estimate by a given multiplier.
 *
 * This function converts the gas estimate to a number, applies the multiplier,
 * rounds the result to the nearest integer, and returns it as a bigint.
 *
 * @param feeData - The estimate fee per gas FeeValuesEIP1559
 * @param feeDataMultiplier - The factor by which to scale the maxFeePerGas and maxPriorityFeePerGas estimate.
 * @param gasLimit - The gasLimit for this current transaction.
 * @param gasLimitMultiplier - The factor by which to scale the gasPrice estimate.
 * @returns The adjusted maxFeePerGas, maxPriorityFeePerGas and gasPrice.
 */
declare function getTransactionGas(feeData: FeeValuesEIP1559, feeDataMultiplier: number, gasLimit: bigint, gasLimitMultiplier: number): {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    gasPrice: bigint;
};

type Result<Data> = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    data: Data;
};

declare const validateEvmAccount: <Props extends {
    account: BaseAccount;
}>({ account, }: Props) => Result<{
    account: BaseAccount;
}>;

declare class DexAi {
    account: BaseAccount;
    adapters: AdapterProvider[];
    /**
     * Initializes a new DexAi instance
     *
     * @param config - Configuration options for the DexAi
     * @param config.account - The wallet account to use
     * @param config.adapters - The adapter providers to use
     */
    constructor(config: DexAiConfig);
    static init(config: DexAiConfig): Promise<DexAi>;
    /**
     * Returns the adapters available to the DexAi.
     *
     * @returns An array of adapters
     */
    getFunctions(): IAdapter[];
}

/**
 * Get a chain from the viem chains object
 *
 * @param id - The chain ID
 * @returns The chain
 */
declare const getChain: (id: string) => Chain;
/**
 * Get the network of a chain
 *
 * @param chain - The chain
 * @returns The network
 */
declare const getNetworkInfo: (chain: Chain) => Network;

export { type AdapterMetadata, AdapterProvider, BaseAccount, DexAi, type DexAiConfig, FUNCTION_DECORATOR_KEY, type IAdapter, type Network, type StoredAdapterMetadata, UseFunction, type UseFunctionDecoratorParams, VenusAdapterProvider, ViemAccount, type ViemAccountConfig, getChain, getNetworkInfo, getTransactionGas, validateEvmAccount };
