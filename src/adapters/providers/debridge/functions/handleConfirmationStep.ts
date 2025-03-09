import { z } from "zod";
import { bridgeTokenSchema } from "../schemas/bridge.schema";
import { PrepareTxResponse } from "../type";
import { toResult } from "@heyanon/sdk";
import { BridgeStep } from "../dln";

/**
 * Handles confirm order confirmation step
 * @param preparedData
 * @param args
 * @param wasExpired
 * @returns a confirmation message
 */
export function handleConfirmationStep(
  preparedData: PrepareTxResponse,
  args: z.infer<typeof bridgeTokenSchema>,
  wasExpired: boolean,
  updateStep: (isExpired: boolean, step: BridgeStep) => void,
) {
  updateStep(false, "execution");
  const expiryMessage = wasExpired
    ? "⚠️ Your previous transaction has expired. Please review and confirm the updated transaction details."
    : "Note: This transaction will expire in 30 seconds if not confirmed.";

  return toResult(
    `
        Strictly display this entire confirmation message to user:

        ${wasExpired ? expiryMessage : ""}

        Confirm the transaction details below to proceed with bridging.

        Transaction Details:
        Send: 
         - Amount: ${args.amount} ${preparedData.sourceToken.symbol.toUpperCase()}
         - Usd Value: ${preparedData.amountInUsd} USD
         - Token: ${preparedData.sourceToken.address}
         - Network: ${args.sourceChain}
        Recieve: 
         - Amount: ${preparedData.takeAmountInUint} ${preparedData.destToken.symbol.toUpperCase()}
         - Usd Value: ${preparedData.estTakeValueInUsd} USD
         - Token: ${preparedData.destToken.address}
         - Recipient: ${args.to}
         - Network: ${args.destinationChain}
        Fees: 
         - Protocol Fee: ${preparedData.fees.fixedFee} ${preparedData.fees.symbol} + ${preparedData.fees.protocolFee} USD
            
        ${!wasExpired ? expiryMessage : ""}
      `,
    false,
  );
}
