import { useTxThenSync } from "./useTxThenSync";
import { governanceContract, CHAIN_ID } from "../config/contracts";
import {
  getOnchainPayload,
  getProgramDetailAuthed,
} from "../services/programApi";

export function useSubmitProposal(programId: number) {
  const tx = useTxThenSync({
    waitForSync: async () =>
      (await getProgramDetailAuthed(programId)).isOnChain === true,
  });

  const submit = async () => {
    const [payload, detail] = await Promise.all([
      getOnchainPayload(programId),
      getProgramDetailAuthed(programId),
    ]);
    return tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: "submitProposal",
      args: [
        BigInt(payload.programId),
        payload.programHash as `0x${string}`,
        BigInt(detail.totalBudget),
        BigInt(payload.milestoneCount),
      ],
    });
  };

  return { ...tx, submit };
}
