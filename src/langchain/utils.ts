import { z } from "zod";
import { StructuredTool, tool } from "@langchain/core/tools";
import { DexAi } from "../dexai";
import { IAdapter } from "../types";

/**
 * Get Langchain tools from DexAi instance
 *
 * @param agent - The Agent instance
 * @returns An array of Langchain tools
 */
export async function generateLangChainTools(agent: DexAi): Promise<StructuredTool[]> {
  const adapter: IAdapter[] = agent.getFunctions();
  return adapter.map(action =>
    tool(
      async (arg: z.output<typeof action.schema>) => {
        const result = await action.invoke(arg);
        return result;
      },
      {
        name: action.name,
        description: action.description,
        schema: action.schema,
      },
    ),
  );
}
