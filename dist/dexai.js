"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexAi = void 0;
class DexAi {
    /**
     * Initializes a new DexAi instance
     *
     * @param config - Configuration options for the DexAi
     * @param config.account - The wallet account to use
     * @param config.adapters - The adapter providers to use
     */
    constructor(config) {
        this.account = config.account;
        this.adapters = config.adapters;
    }
    static async init(config) {
        const { account } = config;
        if (!account) {
            throw new Error("provide an account");
        }
        return new DexAi(config);
    }
    /**
     * Returns the adapters available to the DexAi.
     *
     * @returns An array of adapters
     */
    getFunctions() {
        const adapters = [];
        for (const actionProvider of this.adapters) {
            adapters.push(...actionProvider.getFunctions(this.account));
        }
        return adapters;
    }
}
exports.DexAi = DexAi;
