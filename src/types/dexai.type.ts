import { BaseAccount } from "../accounts";
import { AdapterProvider } from "../adapters";

export type DexAiConfig = {
  account: BaseAccount;
  adapters: AdapterProvider[];
};
