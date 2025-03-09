import { z } from "zod";
import { tool, Tool } from "ai";
import { Wallio } from "../../wallio";
import { type IAdapter } from "../../adapters/type";

/**
 * Get Ai tools from Wallio instance
 *
 * @param agent - The Agent instance
 * @returns An object of Tools
 */
export async function generateAiTools(agent: Wallio): Promise<Record<string, Tool>> {
  const adapter: IAdapter[] = agent.getFunctions();
  return adapter.reduce(
    (adapter, func) => {
      adapter[func.name] = tool({
        description: func.description,
        parameters: func.schema,
        execute: async (args: z.output<typeof func.schema>) => {
          return await func.invoke(args);
        },
      });
      return adapter;
    },
    {} as Record<string, Tool>,
  );
}
