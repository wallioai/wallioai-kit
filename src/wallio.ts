import { BaseAccount } from "./accounts/base.account";
import { AdapterProvider } from "./adapters";
import { type WallioConfig } from "./type";
import { type IAdapter } from "./adapters/type";
import * as dotenv from "dotenv";

dotenv.config();

export class Wallio {
  account: BaseAccount;
  adapters: AdapterProvider[];

  /**
   * Initializes a new Wallio instance
   *
   * @param config - Configuration options for the Wallio
   * @param config.account - The wallet account to use
   * @param config.adapters - The adapter providers to use
   */
  constructor(config: WallioConfig) {
    this.account = config.account;
    this.adapters = config.adapters;
  }

  public static async init(config: WallioConfig): Promise<Wallio> {
    const { account } = config;
    if (!account) {
      throw new Error("provide an account");
    }
    return new Wallio(config);
  }

  /**
   * Returns the adapters available to the Wallio.
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
