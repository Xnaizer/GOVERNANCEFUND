import { useQueryClient } from "@tanstack/react-query";
import { useTxThenSync } from "./useTxThenSync";
import { governanceContract, CHAIN_ID } from "../config/contracts";

export function useVoteProposal(programId: number) {
  const qc = useQueryClient();
  const tx = useTxThenSync({ onDone: () => qc.invalidateQueries() });
  const vote = () =>
    tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: "voteProposal",
      args: [BigInt(programId)],
    });
  return { ...tx, vote };
}
