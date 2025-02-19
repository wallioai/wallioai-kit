import z from "zod";
import { borrowTokenSchema } from "../schemas/borrow.schema";
import { ViemAccount } from "../../../../accounts/viem.account";
import { validateEvmAccount } from "../../../../accounts";
import { validateAndGetTokenDetails } from "../utils";
import { toResult } from "@heyanon/sdk";
import { vComptrollerAbi } from "../abis/vComptrollerAbi";
import { formatUnits, parseUnits } from "viem";
import { ORACLE_ADDRESS } from "../constants";
import { vOrcaleABI } from "../abis/vOracleABI";
import { vBNBAbi } from "../abis/vBNBAbi";
import { getChain } from "../../../../networks";

/**
 * Borrows Token using Venus protocol.
 *
 * @param props - Borrow parameters.
 * @param tools - System tools for blockchain interactions.
 * @returns Borrow result containing the transaction hash.
 */
export async function borrow(
  account: ViemAccount,
  args: z.infer<typeof borrowTokenSchema>
) {
  const { chainName, pool, tokenSymbol, amount } = args;
  const isConnected = validateEvmAccount({ account });
  if (!isConnected.success) {
    return toResult(isConnected.errorMessage, true);
  }

  // Validate chain
  const tokenDetails = validateAndGetTokenDetails({
    chainName,
    pool,
    tokenSymbol: tokenSymbol,
  });
  if (!tokenDetails.success) {
    return toResult(tokenDetails.errorMessage, true);
  }

  try {
    //await notify("Checking the borrow limit of the account...");
    const result = (await account.readContract({
      abi: vComptrollerAbi,
      address: tokenDetails.data.comptroller,
      functionName: "getAccountLiquidity",
      args: [account.getAddress()],
    })) as [bigint, bigint];
    const [, liquidity] = result;

    const borrowLimitInUSD = parseFloat(formatUnits(liquidity, 18));
    if (borrowLimitInUSD <= 0) {
      return toResult(
        "No available liquidity to borrow. Please supply a collateral",
        true
      );
    }

    const oracleAddress = ORACLE_ADDRESS[tokenDetails.data.chainId];
    if (!oracleAddress) {
      return toResult(
        `Oracle not configured for chain ${tokenDetails.data.chainId}`,
        true
      );
    }

    const tokenPriceInUSD = (await account.readContract({
      abi: vOrcaleABI,
      address: oracleAddress,
      functionName: "getUnderlyingPrice",
      args: [tokenDetails.data.tokenAddress],
    })) as bigint;

    if (
      borrowLimitInUSD <
      parseFloat(formatUnits(tokenPriceInUSD!, 18)) * parseFloat(amount)
    ) {
      return toResult("Not enough borrow limit please supply more", true);
    }

    //await notify("Preparing to borrow Token...");
    // Prepare borrow transaction
    const tx = await account.writeContract({
      address: tokenDetails.data.tokenAddress,
      abi: vBNBAbi,
      functionName: "borrow",
      args: [parseUnits(amount, 18)],
      chain: getChain(tokenDetails.data.chainId.toString()),
    });

    return toResult(
      `Successfully borrowed ${amount} ${tokenSymbol}. Transaction Hash: ${tx}`
    );
  } catch (error) {
    return toResult(
      `Failed to borrow token: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      true
    );
  }
}
