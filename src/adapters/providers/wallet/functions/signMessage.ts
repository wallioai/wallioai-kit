import { z } from "zod";
import { ViemAccount } from "../../../../accounts";
import { signMessageSchema } from "../schemas";
import { toResult } from "@heyanon/sdk";

/**
 * Signs a message using users walet
 *
 * @param account - Account of the user
 * @param args - Arguments are type of signMessgeSchema
 * @returns Signed message hash.
 */
export async function signMessage(account: ViemAccount, args: z.infer<typeof signMessageSchema>) {
  if (!args.message) {
    return toResult("There is no message to sign", true);
  }
  const signature = await account.signMessage(args.message);
  return toResult(`Message successfully signed. Signature Hash: ${signature}`);
}
