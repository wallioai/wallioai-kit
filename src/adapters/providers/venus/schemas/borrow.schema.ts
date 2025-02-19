import { z } from "zod";
import { EVM } from "@heyanon/sdk";
import { supportedChains, supportedPools } from "../constants";

const { getChainName } = EVM.utils;

/**
 * Input schema for borrowing token on venus
 *
 * The API expects a list of token symbols.
 */
export const borrowTokenSchema = z.object({
  chainName: z
    .enum(supportedChains.map(getChainName) as [string, ...string[]])
    .describe("Chain name where to execute the transaction"),
  tokenSymbol: z
    .string()
    .describe("The token symbol that is involved in the transaction."),
  pool: z
    .enum(supportedPools as [string, ...string[]])
    .describe("The Pool in which the transaction will be executed."),
  amount: z.string().describe("Amount of tokens in decimal format"),
});
