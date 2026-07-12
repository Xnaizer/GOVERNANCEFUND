import { useTxThenSync } from "./useTxThenSync";
import { governanceContract, CHAIN_ID } from "../config/contracts";
import { getSignatures } from "../services/signatureApi";
import { getProgramDetailAuthed } from "../services/programApi";

export function useReleaseMilestone(
  programId: number,
  milestoneId: string,
  milestoneIndex: number,
  milestoneBudget: string,
  evidenceHash: string | null,
) {
  const tx = useTxThenSync({
    waitForSync: async () =>
      (await getProgramDetailAuthed(programId)).status === "DRAWABLE",
  });

  const release = async () => {
    if (!evidenceHash) throw new Error("Evidence milestone belum diunggah.");
    const set = await getSignatures(milestoneId);
    if (!set.complete) throw new Error(`Baru ${set.collected}/3 tanda tangan.`);
    const byRole = (r: string) =>
      set.signatures.find((s) => s.signerRole === r)?.signature;
    const admin = byRole("ADMIN"),
      validator = byRole("VALIDATOR"),
      auditor = byRole("AUDITOR");
    if (!admin || !validator || !auditor)
      throw new Error(
        "Raw signature tidak tersedia (cek fix backend getSignatures).",
      );
    return tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: "executeMilestoneRelease",
      args: [
        BigInt(programId),
        BigInt(milestoneIndex),
        BigInt(milestoneBudget),
        evidenceHash as `0x${string}`,
        admin as `0x${string}`,
        validator as `0x${string}`,
        auditor as `0x${string}`,
      ],
    });
  };

  return { ...tx, release };
}
