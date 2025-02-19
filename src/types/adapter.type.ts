import z from "zod";

/**
 * IAdapter is the type for all agent's functions.
 * Following DynamicStructuredTool from @langchain/core/tools
 */
export type IAdapter<AdapterSchema extends z.ZodSchema = z.ZodSchema> = {
  name: string;
  description: string;
  schema: AdapterSchema;
  invoke: (args: z.infer<AdapterSchema>) => Promise<string>;
};
