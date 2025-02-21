import { BaseAccount } from "./accounts";
import { AdapterProvider } from "./adapters";
import { type DexAiConfig, type IAdapter } from "./types";

export class DexAi {
  account: BaseAccount;
  adapters: AdapterProvider[];

  /**
   * Initializes a new DexAi instance
   *
   * @param config - Configuration options for the DexAi
   * @param config.account - The wallet account to use
   * @param config.adapters - The adapter providers to use
   */
  constructor(config: DexAiConfig) {
    this.account = config.account;
    this.adapters = config.adapters;
  }

  public static async init(config: DexAiConfig): Promise<DexAi> {
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
  public getFunctions(): IAdapter[] {
    const adapters: IAdapter[] = [];

    for (const actionProvider of this.adapters) {
      adapters.push(...actionProvider.getFunctions(this.account));
    }

    return adapters;
  }
}
