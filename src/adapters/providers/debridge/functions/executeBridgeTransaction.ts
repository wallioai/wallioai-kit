import { z } from "zod";
import { ViemAccount } from "../../../../accounts/viem.account";
import { Chain, ChainById } from "../../../../networks/constant";
import { PrepareTxResponse, ValidateChainResponse } from "../type";
import { bridgeTokenSchema } from "../schemas/bridge.schema";
import { DLN, evmDLNContracts } from "../constants";
import { encodeAbiParameters, encodeFunctionData, Hex, zeroAddress } from "viem";
import { getChain } from "../../../../networks/evm.network";
import { toResult } from "@heyanon/sdk";
import { dlnSourceAbi } from "../abis/dlnSource";
import { handleTokenApproval } from "./handleTokenApproval";

export async function executeTransaction(
  account: ViemAccount,
  preparedData: PrepareTxResponse,
  validatedData: ValidateChainResponse,
  fromChain: Chain,
  args: z.infer<typeof bridgeTokenSchema>,
  txTimeout: NodeJS.Timeout | null,
  clearTxTimeout: () => void,
  resetBridgeState: (withArg: z.infer<typeof bridgeTokenSchema>) => void,
) {
  // Clear the timeout since we're proceeding
  if (txTimeout) {
    clearTxTimeout();
  }

  // Get protocol fee
  const protocolFee = (await account.readContract({
    address: evmDLNContracts[DLN.SOURCE] as Hex,
    abi: dlnSourceAbi,
    functionName: "globalFixedNativeFee",
    chain: getChain(ChainById[fromChain].toString()),
  })) as bigint;

  // Encode transaction data
  const encodedData = encodeFunctionData({
    abi: dlnSourceAbi,
    functionName: "createOrder",
    args: [
      {
        giveTokenAddress: preparedData.giveTokenAddress as Hex,
        giveAmount: preparedData.giveAmount,
        takeTokenAddress: preparedData.takeTokenAddress,
        takeAmount: preparedData.takeAmount,
        takeChainId: validatedData.takeChainId as unknown as bigint,
        receiverDst: preparedData.receiverDst,
        givePatchAuthoritySrc: account.getAddress() as Hex,
        orderAuthorityAddressDst: preparedData.orderAuthorityAddressDst,
        allowedTakerDst: validatedData.allowedTakerDst as Hex,
        externalCall: validatedData.externalCall as Hex,
        allowedCancelBeneficiarySrc: encodeAbiParameters(
          [{ type: "address" }],
          [account.getAddress() as Hex],
        ),
      },
      preparedData.affiliateFee as Hex,
      validatedData.referralCode,
      preparedData.permitEnvelope as Hex,
    ],
  });

  // Handle token approval if needed
  const isNative = preparedData.giveTokenAddress === zeroAddress;
  if (!isNative) {
    await handleTokenApproval(
      account,
      preparedData.giveTokenAddress,
      preparedData.giveAmount,
      fromChain,
    );
  }

  // Send the bridge transaction
  await account.sendTransaction({
    data: encodedData,
    to: evmDLNContracts[DLN.SOURCE] as Hex,
    value: protocolFee,
    chain: getChain(ChainById[fromChain].toString()),
  });

  // Reset bridge state after successful transaction
  resetBridgeState(args);
  return toResult("Bridge transaction submitted successfully", false);
}
