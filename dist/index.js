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

// src/wallio.ts
import * as dotenv from "dotenv";
dotenv.config();
var _Wallio = class _Wallio {
  /**
  * Initializes a new Wallio instance
  *
  * @param config - Configuration options for the Wallio
  * @param config.account - The wallet account to use
  * @param config.adapters - The adapter providers to use
  */
  constructor(config2) {
    __publicField(this, "account");
    __publicField(this, "adapters");
    this.account = config2.account;
    this.adapters = config2.adapters;
  }
  static async init(config2) {
    const { account } = config2;
    if (!account) {
      throw new Error("provide an account");
    }
    return new _Wallio(config2);
  }
  /**
  * Returns the adapters available to the Wallio.
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
__name(_Wallio, "Wallio");
var Wallio = _Wallio;
export {
  ChainById,
  Wallio,
  getChain,
  getChainMap,
  getNetworkInfo
};
