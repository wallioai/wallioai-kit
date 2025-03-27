import { z } from "zod";
import { bridgeTokenSchema } from "../schemas/bridge.schema";
import { LRUCache } from "lru-cache";
import { type DeBridgeTokens, type PrepareTxResponse } from "../type";
import { Chain, ChainById } from "../../../../networks/constant";
import { getChain } from "../../../../networks/evm.network";
import { DLNInternalId } from "../constants";
import { encodeAbiParameters, formatEther, formatUnits, type Hex, parseUnits } from "viem";

type PrepareTransactionType = z.infer<typeof bridgeTokenSchema> & {
  tokensCache: LRUCache<string, DeBridgeTokens[]>;
  fromChain: Chain;
  toChain: Chain;
  sender: string;
};
export async function prepareTransaction(args: PrepareTransactionType) {
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
      affiliateFeePercent: 0.5,
      affiliateFeeRecipient: process.env.AFFILIATE_ADDRESS,
      referralCode: process.env.REFERRAL_CODE,
    };

    const queryString = new URLSearchParams(orderParam as any).toString();
    const url = `https://dln.debridge.finance/v1.0/dln/order/create-tx?${queryString}`;
    const txResponse = await fetch(url).then(res => res.json());

    const amountInUsd = txResponse.estimation.srcChainTokenIn.approximateUsdValue;
    const estTakeValueInUsd = txResponse.estimation.dstChainTokenOut.recommendedApproximateUsdValue;
    const takeAmountInUint = formatUnits(
      txResponse.estimation.dstChainTokenOut.recommendedAmount,
      txResponse.estimation.dstChainTokenOut.decimals,
    );

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
    console.log(error);
    return { success: false, errorMessage: error.message };
  }
}

function determineTransaction(
  args: PrepareTransactionType & { fromToken: string; fromTokenDecimal: number; toToken: string },
) {
  const isSameChain = args.fromChain.toLowerCase() == args.toChain.toLowerCase();
  let param;
  if (isSameChain) {
    return {
      srcChainId: DLNInternalId[args.fromChain],
      srcChainTokenIn: args.fromToken,
      dstChainId: DLNInternalId[args.fromChain],
      dstChainTokenOut: args.fromToken,
      srcChainTokenInAmount: parseUnits(args.amount, args.fromTokenDecimal),
    }
  } else {
    return {
      srcChainId: DLNInternalId[args.fromChain],
      srcChainTokenIn: args.fromToken,
      dstChainId: DLNInternalId[args.toChain],
      dstChainTokenOut: args.toToken,
      srcChainTokenInAmount: parseUnits(args.amount, args.fromTokenDecimal),
      srcChainOrderAuthorityAddress: args.sender,
      dstChainTokenOutAmount: "auto",
      prependOperatingExpense: true,
      dstChainOrderAuthorityAddress: args.to,
      dstChainTokenOutRecipient: args.to,
      affiliateFeePercent: 0.5,
      affiliateFeeRecipient: process.env.AFFILIATE_ADDRESS,
      referralCode: process.env.REFERRAL_CODE,
    };
  }
}
