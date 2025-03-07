import { isAddress, parseUnits, zeroAddress, encodeAbiParameters, Hex, formatEther } from "viem";
import { DLNInternalId, supportedChains } from "./constants";
import { z } from "zod";
import { bridgeTokenSchema } from "./schemas/bridge.schema";
import { CoingeckoChainCategoryId, CoingeckoPlatformId } from "../coingecko/constants";
import { Token } from "../coingecko/type";
import { LRUCache } from "lru-cache";
import { getChain } from "dexai";
import { Chain, ChainById } from "../../../networks/constant";
import { DeBridgeTokenResponse, DeBridgeTokens, PrepareTxResponse } from "./type";

export const validateDLNInputs = ({
  sourceChain,
  destinationChain,
  amount,
  to,
}: z.infer<typeof bridgeTokenSchema>) => {
  const srcChain = supportedChains.find(c => c == sourceChain);
  const dstChain = supportedChains.find(c => c == destinationChain);

  if (!srcChain) {
    return {
      success: false,
      errorMessage: `Unsupport source chain provided ${sourceChain}`,
    };
  }

  if (!dstChain) {
    return {
      success: false,
      errorMessage: `Unsupport destination chain provided ${sourceChain}`,
    };
  }

  if (!isAddress(to)) {
    return {
      success: false,
      errorMessage: `Invalid recievers wallet address`,
    };
  }

  if (parseInt(amount) <= 0) {
    return {
      success: false,
      errorMessage: `Enter a valid token amount to bridge`,
    };
  }

  return {
    success: true,
    data: {
      takeChainId: ChainById[dstChain],
      allowedTakerDst: "0x",
      externalCall: "0x",
      allowedCancelBeneficiarySrc: "0x",
      givePatchAuthoritySrc: "0x",
      referralCode: 31565,
      fromChain: srcChain,
      toChain: dstChain,
    },
  };
};

export const fetchSrcDestTokens = async ({
  toChain,
  fromChain,
}: {
  toChain: Chain;
  fromChain: Chain;
}) => {
  const fromCategory = CoingeckoChainCategoryId[fromChain];
  const toCategory = CoingeckoChainCategoryId[toChain];
  if (!fromCategory || !toCategory) {
    return {
      success: false,
      errorMessage: "Error getting chain category, please try again",
    };
  }

  const debridgeIdSrc = DLNInternalId[fromChain];
  const debridgeIdDst = DLNInternalId[toChain];

  const chainTokeList = (id: string) =>
    `https://dln.debridge.finance/v1.0/token-list?chainId=${id}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const [srcTokens, destTokens] = await Promise.all([
      fetch(chainTokeList(debridgeIdSrc)).then(
        tokens => tokens.json() as Promise<DeBridgeTokenResponse>,
      ),
      fetch(chainTokeList(debridgeIdDst)).then(
        tokens => tokens.json() as Promise<DeBridgeTokenResponse>,
      ),
    ]);
    clearTimeout(timeoutId);

    const srcTokenObject = srcTokens.tokens;
    const mappedSrcTokens = Object.keys(srcTokenObject)
      .map((key, i) => {
        const value = srcTokenObject[key];
        return {
          symbol: value.symbol.toUpperCase(),
          name: value.name,
          address: value.address,
          decimals: value.decimals,
          logoURI: value.logoURI,
        } as DeBridgeTokens;
      })
      .slice(0, 10);

    const dstTokenObject = srcTokens.tokens;
    const mappedDestTokens = Object.keys(dstTokenObject)
      .map((key, i) => {
        const value = dstTokenObject[key];
        return {
          symbol: value.symbol.toUpperCase(),
          name: value.name,
          address: value.address,
          decimals: value.decimals,
          logoURI: value.logoURI,
        } as DeBridgeTokens;
      })
      .slice(0, 10);

    return {
      success: true,
      data: {
        mappedSrcTokens,
        mappedDestTokens,
      },
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      return {
        success: false,
        errorMessage: "Request timed out. Please try again.",
      };
    }
    return {
      success: false,
      errorMessage: `Error fetching token data: ${error.message}`,
    };
  }
};

export const validateSrcDestInput = async (
  args: z.infer<typeof bridgeTokenSchema> & {
    tokensCache: LRUCache<string, Token[]>;
    fromChain: Chain;
    toChain: Chain;
  },
) => {
  const cachedDestToken = args.tokensCache.get(args.destinationChain);
  const destTokenId = cachedDestToken?.find(t => t.address == args.destinationTokenAddress);
  if (!destTokenId) {
    return {
      success: false,
      errorMessage: "Select a destination token",
    };
  }

  const cachedSrcToken = args.tokensCache.get(args.sourceChain);
  const sourceTokenId = cachedSrcToken?.find(t => t.address == args.sourceTokenAddress);

  if (!sourceTokenId) {
    return {
      success: false,
      errorMessage: "Select a source token",
    };
  }

  const url = (id: string) => `https://api.coingecko.com/api/v3/coins/${id}`;
  const [srcToken, destToken] = await Promise.all([
    fetch(url(sourceTokenId.id)).then(tokens => tokens.json()),
    fetch(url(destTokenId.id)).then(tokens => tokens.json()),
  ]);

  if (!srcToken || !destToken) {
    return {
      success: false,
      errorMessage: "Error fetching token data",
    };
  }

  const srcPlatformId = CoingeckoPlatformId[args.fromChain];
  const dstPlatformId = CoingeckoPlatformId[args.toChain];
  const sourceCoinAddress = srcToken.platforms[srcPlatformId];
  const destinationCoinAddress = destToken.platforms[dstPlatformId];

  return {
    success: true,
    data: {
      sourceCoinAddress,
      destinationCoinAddress,
    },
  };
};

export const prepareTransaction = async (
  args: z.infer<typeof bridgeTokenSchema> & {
    tokensCache: LRUCache<string, DeBridgeTokens[]>;
    fromChain: Chain;
    toChain: Chain;
    sender: string;
  },
) => {
  try {
    const chain = getChain(ChainById[args.fromChain].toString());
    const sourceObj = args.tokensCache.get(args.sourceChain);
    const destObj = args.tokensCache.get(args.destinationChain);
    const sourceToken = sourceObj?.find(t => t.address == args.sourceTokenAddress);
    const destToken = destObj?.find(t => t.address == args.destinationTokenAddress);

    if (!sourceToken || !destToken) {
      return {
        success: false,
        errorMessage: "Token not found",
      };
    }

    const orderParam = {
      srcChainId: DLNInternalId[args.fromChain],
      srcChainTokenIn: sourceToken.address,
      dstChainId: DLNInternalId[args.toChain],
      dstChainTokenOut: destToken.address,
      srcChainTokenInAmount: parseUnits(args.amount, sourceToken.decimals),
      srcChainOrderAuthorityAddress: args.sender,
      dstChainTokenOutAmount: "auto",
      prependOperatingExpense: true,
      dstChainOrderAuthorityAddress: args.to,
      dstChainTokenOutRecipient: args.to,
      referralCode: 31565,
    };

    const queryString = new URLSearchParams(orderParam as any).toString();
    const url = `https://dln.debridge.finance/v1.0/dln/order/create-tx?${queryString}`;
    const txResponse = await fetch(url).then(res => res.json());

    const amountInUsd = parseFloat(txResponse.estimation.srcChainTokenIn.approximateUsdValue);
    const estTakeValueInUsd = parseFloat(
      txResponse.estimation.dstChainTokenOut.recommendedApproximateUsdValue,
    );
    const takeAmountInUint = parseInt(txResponse.estimation.dstChainTokenOut.recommendedAmount);

    const protocolFee = txResponse.estimation.costsDetails.find(f => f.type == "DlnProtocolFee");
    const protocolFeeInUsd = protocolFee.payload.feeApproximateUsdValue;
    const baseProtocolFee = formatEther(txResponse.fixFee);

    return {
      success: true,
      data: {
        tx: {
          data: txResponse.tx.data,
          value: txResponse.tx.value,
          to: txResponse.tx.to,
        },
        fees: {
          protocolFee: parseFloat(protocolFeeInUsd.toString()).toFixed(2),
          fixedFee: baseProtocolFee,
          symbol: chain.nativeCurrency.symbol,
        },
        giveTokenAddress: sourceToken.address,
        giveAmount: parseUnits(args.amount, sourceToken.decimals),
        takeTokenAddress: encodeAbiParameters([{ type: "address" }], [destToken.address as Hex]),
        takeAmount: parseUnits(takeAmountInUint.toString(), destToken.decimals),
        receiverDst: encodeAbiParameters([{ type: "address" }], [args.to as Hex]),
        orderAuthorityAddressDst: encodeAbiParameters([{ type: "address" }], [args.to as Hex]),
        amountInUsd,
        estTakeValueInUsd,
        takeAmountInUint,
        destToken,
        sourceToken,
        affiliateFee: "0x",
        permitEnvelope: "0x",
      } as PrepareTxResponse,
    };
  } catch (error: any) {
    return { success: false, errorMessage: error.message };
  }
};
