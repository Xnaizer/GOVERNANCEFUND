import { useQueryClient } from "@tanstack/react-query";
import { useTxThenSync } from "./useTxThenSync";
import { governanceContract, CHAIN_ID } from "../config/contracts";
import { getProgramDetailAuthed } from "../services/programApi";

export function useWithdraw(programId: number) {
  const qc = useQueryClient();
  const tx = useTxThenSync({ onDone: () => qc.invalidateQueries() }); // withdrawal masuk via webhook OnChainWithdrawalLogged
  const withdraw = (
    amount: string,
    recipientName: string,
    description: string,
  ) =>
    tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: "executePicWithdrawal",
      args: [BigInt(programId), BigInt(amount), recipientName, description],
    });
  return { ...tx, withdraw };
}

export function useFinalizeMilestone(programId: number) {
  const tx = useTxThenSync({
    waitForSync: async () =>
      (await getProgramDetailAuthed(programId)).status !== "DRAWABLE", // → MILESTONE_ACHIEVED / COMPLETED
  });
  const finalize = () =>
    tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: "finalizeMilestone",
      args: [BigInt(programId)],
    });
  return { ...tx, finalize };
}

export function useProposeAppeal(programId: number) {
  const qc = useQueryClient();
  const tx = useTxThenSync({ onDone: () => qc.invalidateQueries() }); // status tetap FROZEN, hanya buka UnfreezeVote
  const propose = () =>
    tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: "proposeUnfreezeAppeal",
      args: [BigInt(programId)],
    });
  return { ...tx, propose };
}
