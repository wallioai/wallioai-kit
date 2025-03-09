import { BaseAccount } from "./accounts/base.account";
import { AdapterProvider } from "./adapters/adapter";

export type WallioConfig = {
  account: BaseAccount;
  adapters: AdapterProvider[];
};

export type Result<Data> =
  | {
      success: false;
      errorMessage: string;
    }
  | {
      success: true;
      data: Data;
    };
