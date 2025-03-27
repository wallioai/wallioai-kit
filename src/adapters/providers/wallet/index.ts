import { z } from "zod";
import { BaseAccount } from "../../../accounts/base.account";
import { ViemAccount } from "../../../accounts/viem.account";
import { AdapterProvider } from "../../adapter";
import { UseFunction } from "../../decorator";
import { signMessageSchema } from "./schemas";
import { toResult } from "@heyanon/sdk";
import { GetWalletInfoSchema, NativeTransferSchema } from "./schemas/wallet.schema";
import { type Hex } from "viem";

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
  async signMessage(account: ViemAccount, args: z.infer<typeof signMessageSchema>) {
    if (!args.message) {
      return toResult("There is no message to sign", true);
    }
    const signature = await account.signMessage(args.message);
    return toResult(`Message successfully signed. Signature Hash: ${signature}`);
  }

  @UseFunction({
    name: "get_wallet_info",
    description: `
      Get users wallet information

      - If chain or token is not specified, it will return the balance of the native token of the wallet.
    `,
    schema: GetWalletInfoSchema,
  })
  async getWalletInfo(account: ViemAccount, args: z.infer<typeof GetWalletInfoSchema>) {
    const address = account.getAddress();
    const network = account.getNetwork();
    const balance = await account.getBalance();
    const name = account.getName();

    return [
      "Wallet Details:",
      `- Provider: ${name}`,
      `- Address: ${address}`,
      "- Network:",
      `  * Protocol Family: ${network.protocolFamily}`,
      `  * Network ID: ${network.name || "N/A"}`,
      `  * Chain ID: ${network.chainId || "N/A"}`,
      `- Native Balance: ${balance.toString()} ${network.currency}`,
    ].join("\n");
  }

  @UseFunction({
    name: "native_transfer",
    description: "Transfer navtive token from users wallet",
    schema: NativeTransferSchema,
  })
  async transfer(account: ViemAccount, args: z.infer<typeof NativeTransferSchema>) {
    try {
      const result = await account.nativeTransfer(args.to as Hex, args.value);
      return [`Transferred ${args.value} sent to ${args.to}`, `Transaction Hash: ${result}`].join(
        "\n",
      );
    } catch (error) {
      return "Error initiating transfer";
    }
  }
}

/**
 * Factory function to create a new WalletAdapterProvider instance.
 * @returns A new instance of WalletAdapterProvider.
 */
export const walletAdapterProvider = () => new WalletAdapterProvider();
