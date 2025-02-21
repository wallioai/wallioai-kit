import { z } from "zod";

/**
 * Input schema for signing a message
 */
export const signMessageSchema = z.object({
  message: z.string().describe("The message to be signed"),
});
