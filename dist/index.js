import {
  ChainById,
  getChain,
  getChainMap,
  getNetworkInfo
} from "./chunk-DO5TJVOX.js";
import {
  __name,
  __publicField
} from "./chunk-34RL7MW4.js";

// src/dexai.ts
var _DexAi = class _DexAi {
  /**
  * Initializes a new DexAi instance
  *
  * @param config - Configuration options for the DexAi
  * @param config.account - The wallet account to use
  * @param config.adapters - The adapter providers to use
  */
  constructor(config) {
    __publicField(this, "account");
    __publicField(this, "adapters");
    this.account = config.account;
    this.adapters = config.adapters;
  }
  static async init(config) {
    const { account } = config;
    if (!account) {
      throw new Error("provide an account");
    }
    return new _DexAi(config);
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
};
__name(_DexAi, "DexAi");
var DexAi = _DexAi;
export {
  ChainById,
  DexAi,
  getChain,
  getChainMap,
  getNetworkInfo
};
