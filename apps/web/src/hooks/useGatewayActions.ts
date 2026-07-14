import { useTxThenSync } from "./useTxThenSync";
import { gatewayContract, CHAIN_ID } from "../config/contracts";
import { fetchRedemptionById } from "../services/redemptionApi";

export function useConfirmRedemption(id: number) {
  const tx = useTxThenSync({
    waitForSync: async () =>
      (await fetchRedemptionById(id)).status === "SETTLED",
  });
  const confirm = () =>
    tx.execute({
      ...gatewayContract,
      chainId: CHAIN_ID,
      functionName: "confirmRedemption",
      args: [BigInt(id)],
    });
  return { ...tx, confirm };
}

export function useCancelRedemption(id: number) {
  const tx = useTxThenSync({
    waitForSync: async () =>
      (await fetchRedemptionById(id)).status === "CANCELLED",
  });
  const cancel = () =>
    tx.execute({
      ...gatewayContract,
      chainId: CHAIN_ID,
      functionName: "cancelRedemption",
      args: [BigInt(id)],
    });
  return { ...tx, cancel };
}
