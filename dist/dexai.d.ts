import { BaseAccount } from "./accounts";
import { AdapterProvider } from "./adapters";
import { DexAiConfig, IAdapter } from "./types";
export declare class DexAi {
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
