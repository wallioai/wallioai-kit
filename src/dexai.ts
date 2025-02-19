import { BaseAccount } from "./accounts";
import { DexAiConfig } from "./types";

export class DexAi {
  account: BaseAccount;
  adapters;

  constructor(config: DexAiConfig) {
    this.account = config.account;
    this.adapters = config.adapters;
  }
}
