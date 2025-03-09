import { z } from "zod";

/**
 * Input schema for signing a message
 */
export const signMessageSchema = z.object({
  message: z.string().describe("The message to be signed"),
});

/**
 * Schema for the get_wallet_info action.
 * This action doesn't require any input parameters, so we use an empty object schema.
 */
export const GetWalletInfoSchema = z.object({});

/**
 * Input schema for native transfer action.
 */
export const NativeTransferSchema = z
  .object({
    to: z.string().describe("The destination address to receive the funds"),
    value: z.string().describe("The amount to transfer in whole units e.g. 1 ETH or 0.00001 ETH"),
  })
  .strip()
  .describe("Instructions for transferring native tokens");
