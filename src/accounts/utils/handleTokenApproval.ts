import { encodeFunctionData, erc20Abi, type Hex } from "viem";
import { ViemAccount } from "../viem.account";
import { Chain, ChainById } from "../../networks/constant";
import { getChain } from "../../networks/evm.network";

export async function handleTokenApproval(
  account: ViemAccount,
  tokenAddress: Hex,
  spender: Hex,
  amount: bigint,
  fromChain: Chain,
) {
  const chain = getChain(ChainById[fromChain].toString());
  const allowance = (await account.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account.getAddress(), spender],
    chain,
  })) as bigint;

  if (allowance < amount) {
    const approvalHash = await account.sendTransaction({
      to: tokenAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, amount],
      }),
      chain,
    });
    return await account.waitForTransactionReceipt(approvalHash);
  }
}
