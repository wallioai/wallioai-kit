import { z } from "zod";
import { bridgeTokenSchema } from "../schemas/bridge.schema";
import { Chain } from "../../../../networks/constant";
import { fetchSrcDestTokens } from "../utils";
import { LRUCache } from "lru-cache";
import { DeBridgeTokens } from "../type";
import { BridgeStep } from "../dln";
import { toResult } from "@heyanon/sdk";

/**
 * Handle the token listing step of the bridging process
 * @param args
 * @param fromChain
 * @param toChain
 * @param tokenCache
 * @param updateCache
 * @param updateStep
 * @returns
 */
export async function handleTokenListingStep(
  args: z.infer<typeof bridgeTokenSchema>,
  fromChain: Chain,
  toChain: Chain,
  tokenCache: LRUCache<string, DeBridgeTokens[]>,
  updateCache: (srcTokens?: DeBridgeTokens[], dstTokens?: DeBridgeTokens[]) => void,
  updateStep: (step: BridgeStep) => void,
) {
  // Check cache first
  let srcTokens = tokenCache.get(args.sourceChain);
  let destTokens = tokenCache.get(args.destinationChain);

  if (!srcTokens || !destTokens) {
    const fetchedTokens = await fetchSrcDestTokens({
      fromChain,
      toChain,
    });

    if (!fetchedTokens.success)
      return {
        success: fetchedTokens.success,
        data: fetchedTokens.errorMessage,
      };

    // Cache the fetched tokens
    srcTokens = fetchedTokens?.data?.mappedSrcTokens;
    destTokens = fetchedTokens?.data?.mappedDestTokens;

    updateCache(srcTokens, destTokens);
  }

  // Move to next step
  updateStep("confirmation");

  // Format token lists for display
  const sourceTokens = srcTokens
    ?.map((t: DeBridgeTokens, i) => `${i + 1}. ${t.symbol.toUpperCase()} - ${t.address}`)
    .join("\n");

  const destinationTokens = destTokens
    ?.map((t: DeBridgeTokens, i) => `${i + 1}. ${t.symbol.toUpperCase()} - ${t.address}`)
    .join("\n");

  return toResult(
    `
      Stricly display below token data for user to select source and destination tokens 
      from the list below which they want to bridge.

      - Source Tokens:
      ${sourceTokens}

      - Destination Tokens:
      ${destinationTokens}

      If the token you want to bridge to isn't on the list, kindly paste the token address.
    `,
    false,
  );
}
