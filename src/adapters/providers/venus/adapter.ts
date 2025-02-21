import z from "zod";
import { BaseAccount, ViemAccount } from "../../../accounts";
import { AdapterProvider } from "../../adapter";
import { UseFunction } from "../../decorator";
import { borrowTokenSchema } from "./schemas";
import { borrow } from "./functions/borrow";

/**
 * VenusAdapterProvider is an adapter provider for interacting with venus protocol.
 * This provider provides the ability for user to supply/borrow/withdraw multiple tokens.
 */
export class VenusAdapterProvider extends AdapterProvider<BaseAccount> {
  constructor() {
    super("venus", []);
  }

  @UseFunction({
    name: "borrow",
    description: "Borrow a token from venus lending protocol on a particular chain.",
    schema: borrowTokenSchema,
  })
  borrow(account: ViemAccount, args: z.infer<typeof borrowTokenSchema>) {
    return borrow(account, args);
  }
}

/**
 * Factory function to create a new VenusAdapterProvider instance.
 * @returns A new instance of AlchemyTokenPricesActionProvider.
 */
export const venusAdapterProvider = () => new VenusAdapterProvider();