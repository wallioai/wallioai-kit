import z, { z as z$1 } from 'zod';
import { PublicClient, WalletClient, TransactionRequest, TransactionReceipt, ReadContractParameters, ReadContractReturnType, WriteContractParameters, Hex, FeeValuesEIP1559 } from 'viem';
import { Chain } from 'viem/chains';
import * as _heyanon_sdk from '@heyanon/sdk';
import { StructuredTool } from '@langchain/core/tools';

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
/**
 * Factory function to create a new VenusAdapterProvider instance.
 * @returns A new instance of VenusAdapterProvider.
 */
declare const venusAdapterProvider: () => VenusAdapterProvider;

/**
 * Input schema for signing a message
 */
declare const signMessageSchema: z$1.ZodObject<{
    message: z$1.ZodString;
}, "strip", z$1.ZodTypeAny, {
    message: string;
}, {
    message: string;
}>;

/**
 * WalletAdapterProvider is an adapter provider for interacting with users wallet.
 * This provider provides the ability for user to carry out operations using their wallet.
 */
declare class WalletAdapterProvider extends AdapterProvider<BaseAccount> {
    constructor();
    signMessage(account: ViemAccount, args: z.infer<typeof signMessageSchema>): Promise<_heyanon_sdk.FunctionReturn>;
}
/**
 * Factory function to create a new WalletAdapterProvider instance.
 * @returns A new instance of WalletAdapterProvider.
 */
declare const walletAdapterProvider: () => WalletAdapterProvider;

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

type Result<Data> = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    data: Data;
};

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

declare class ViemAccount extends BaseAccount {
    publicClient: PublicClient;
    walletClient: WalletClient;
    gasLimitMultiplier: number;
    feePerGasMultiplier: number;
    constructor(client: WalletClient);
    getAddress(): string;
    getNetwork(): Network;
    getName(): string;
    getBalance(): Promise<bigint>;
    nativeTransfer(to: `0x${string}`, value: string): Promise<`0x${string}`>;
    sendTransaction(transaction: TransactionRequest & {
        chain?: Chain;
    }): Promise<`0x${string}`>;
    waitForTransactionReceipt(txHash: `0x${string}`, chain?: Chain): Promise<TransactionReceipt>;
    readContract(params: ReadContractParameters & {
        chain?: Chain;
    }): Promise<ReadContractReturnType>;
    writeContract(params: Omit<WriteContractParameters, "account" | "type"> & {
        chain?: Chain;
    }): Promise<Hex>;
    signTransaction(transaction: TransactionRequest): Promise<`0x${string}`>;
    signMessage(message: string, chain?: Chain): Promise<`0x${string}`>;
    signTypedData(typedData: any, chain?: Chain): Promise<`0x${string}`>;
    private getClient;
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

/**
 * Get Langchain tools from DexAi instance
 *
 * @param agent - The Agent instance
 * @returns An array of Langchain tools
 */
declare function generateLangChainTools(agent: DexAi): Promise<StructuredTool[]>;

export { type AdapterMetadata, AdapterProvider, BaseAccount, DexAi, type DexAiConfig, type IAdapter, type Network, type Result, type StoredAdapterMetadata, UseFunction, type UseFunctionDecoratorParams, ViemAccount, generateLangChainTools, getChain, getNetworkInfo, getTransactionGas, validateEvmAccount, venusAdapterProvider, walletAdapterProvider };
