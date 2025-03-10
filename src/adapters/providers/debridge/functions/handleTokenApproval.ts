import { encodeFunctionData, erc20Abi, type Hex } from "viem";
import { ViemAccount } from "../../../../accounts/viem.account";
import { Chain, ChainById } from "../../../../networks/constant";
import { getChain } from "../../../../networks/evm.network";
import { DLN, evmDLNContracts } from "../constants";

export async function handleTokenApproval(
  account: ViemAccount,
  tokenAddress: Hex,
  amount: bigint,
  fromChain: Chain,
) {
  const chain = getChain(ChainById[fromChain].toString());
  const allowance = (await account.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account.getAddress(), evmDLNContracts[DLN.SOURCE] as Hex],
    chain,
  })) as bigint;

  if (allowance < amount) {
    const approvalHash = await account.sendTransaction({
      to: tokenAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [evmDLNContracts[DLN.SOURCE] as Hex, amount],
      }),
      chain,
    });
    await account.waitForTransactionReceipt(approvalHash);
  }
}
