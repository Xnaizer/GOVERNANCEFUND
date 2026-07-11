import { useQueryClient } from "@tanstack/react-query";
import { useTxThenSync } from "./useTxThenSync";
import { governanceContract, CHAIN_ID } from "../config/contracts";

export function useVoteUnfreeze(programId: number) {
  const qc = useQueryClient();
  const tx = useTxThenSync({ onDone: () => qc.invalidateQueries() });
  const vote = (approve: boolean) =>
    tx.execute({ ...governanceContract, chainId: CHAIN_ID, functionName: "voteUnfreezeAppeal", args: [BigInt(programId), approve] });
  return { ...tx, vote };
}
