import z from "zod";
import { BaseAccount, ViemAccount } from "../../../accounts";
import { AdapterProvider } from "../../adapter";
import { UseFunction } from "../../decorator";
import { signMessageSchema } from "./schemas";
import { signMessage } from "./functions/signMessage";

/**
 * WalletAdapterProvider is an adapter provider for interacting with users wallet.
 * This provider provides the ability for user to carry out operations using their wallet.
 */
export class WalletAdapterProvider extends AdapterProvider<BaseAccount> {
  constructor() {
    super("wallet", []);
  }

  @UseFunction({
    name: "sign_message",
    description: "Sign a message using user wallet",
    schema: signMessageSchema,
  })
  signMessage(account: ViemAccount, args: z.infer<typeof signMessageSchema>) {
    return signMessage(account, args);
  }
}

/**
 * Factory function to create a new WalletAdapterProvider instance.
 * @returns A new instance of WalletAdapterProvider.
 */
export const walletAdapterProvider = () => new WalletAdapterProvider();
