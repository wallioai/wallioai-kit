import { FeeValuesEIP1559 } from "viem";

/**
 * Scales a gas estimate by a given multiplier.
 *
 * This function converts the gas estimate to a number, applies the multiplier,
 * rounds the result to the nearest integer, and returns it as a bigint.
 *
 * @param feeData - The estimate fee per gas FeeValuesEIP1559
 * @param feeDataMultiplier - The factor by which to scale the maxFeePerGas and maxPriorityFeePerGas estimate.
 * @param gasLimit - The gasLimit for this current transaction.
 * @param gasLimitMultiplier - The factor by which to scale the gasPrice estimate.
 * @returns The adjusted maxFeePerGas, maxPriorityFeePerGas and gasPrice.
 */
export function getTransactionGas(
  feeData: FeeValuesEIP1559,
  feeDataMultiplier: number,
  gasLimit: bigint,
  gasLimitMultiplier: number,
) {
  const maxFeePerGas = BigInt(Math.round(Number(feeData.maxFeePerGas) * feeDataMultiplier));
  const maxPriorityFeePerGas = BigInt(
    Math.round(Number(feeData.maxPriorityFeePerGas) * feeDataMultiplier),
  );
  const gasPrice = BigInt(Math.round(Number(gasLimit) * gasLimitMultiplier));

  return { maxFeePerGas, maxPriorityFeePerGas, gasPrice };
}
