import { z } from "zod";
import { ViemAccount } from "../../../../accounts/viem.account";
import { Chain, ChainById } from "../../../../networks/constant";
import { type PrepareTxResponse, type ValidateChainResponse } from "../type";
import { bridgeTokenSchema } from "../schemas/bridge.schema";
import { DLN, evmDLNContracts } from "../constants";
import {
  encodeAbiParameters,
  encodeFunctionData,
  formatEther,
  type Hex,
  parseEther,
  zeroAddress,
} from "viem";
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
  try {
    // Clear the timeout since we're proceeding
    if (txTimeout) {
      clearTxTimeout();
    }

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

    const formatToUnit = formatEther(preparedData.tx.value);
    const value = parseEther(formatToUnit);
    const chain = getChain(ChainById[fromChain].toString());

    // Send the bridge transaction
    const tx = await account.sendTransaction({
      data: preparedData.tx.data,
      to: preparedData.tx.to as Hex,
      value,
      chain,
    });

    const msg = `
      You have successfully bridged ${formatToUnit} ${chain.nativeCurrency.symbol}. \n
      Transaction ID: [${tx}]('https://${chain.blockExplorers?.default.url}/tx/${tx}')
    `;
    resetBridgeState(args);
    return toResult(msg, false);
  } catch (error) {
    return "error trying to bridge transaction";
  }
}
