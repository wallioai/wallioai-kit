import { zeroAddress } from "viem";
import { Chain } from "../../../../networks/constant";
import { supportedChains } from "../constants";
import { LRUCache } from "lru-cache";
import { DeBridgeTokens } from "../type";
import { z } from "zod";
import { bridgeTokenSchema } from "../schemas/bridge.schema";
import { handleTokenListingStep } from "./handleTokenListingStep";

describe("handleTokenListingStep", () => {
  let tokensCache: LRUCache<string, DeBridgeTokens[]>;
  let args: z.infer<typeof bridgeTokenSchema>;
  let fromChain: Chain | undefined;
  let toChain: Chain | undefined;

  beforeEach(async () => {
    tokensCache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60,
      updateAgeOnGet: true,
    });
    args = {
      sourceChain: "bsc",
      sourceTokenAddress: zeroAddress,
      sourceTokenSymbol: "BNB",
      destinationChain: "sonic",
      destinationTokenAddress: zeroAddress,
      destinationTokenSymbol: "USDC",
      to: "0x691889F5944126906F0051c5ca087e975BADABb3",
      amount: "2",
      intent: "NATIVE-TO-ERC20",
      isConfirmed: false,
    };

    fromChain = supportedChains.find(c => c == args.sourceChain);
    toChain = supportedChains.find(c => c == args.destinationChain);
  });

  it("should return an error if the token is not found", async () => {
    if (!fromChain || !toChain) throw new Error("Chain not found");

    const result = await handleTokenListingStep(
      args,
      fromChain,
      toChain,
      tokensCache,
      () => {},
      () => {},
    );

    console.log(result);
  });
});
