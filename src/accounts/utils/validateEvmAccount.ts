import { Result } from "../../types/result.type";
import { BaseAccount } from "../base.account";

export const validateEvmAccount = <Props extends { account: BaseAccount }>({
  account,
}: Props): Result<{ account: BaseAccount }> => {
  if (!account) return { success: false, errorMessage: "Wallet not connected" };
  return {
    success: true,
    data: {
      account,
    },
  };
};
