import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSignTypedData } from "wagmi";
import { EIP712_DOMAIN, EIP712_TYPES } from "@repo/shared";
import { submitSignature } from "../services/signatureApi";
import { useWalletGuard } from "./useWalletGuard";
import type { SignerRole } from "../types/common";

interface SignArgs {
  milestoneId: string;
  programId: number;
  milestoneIndex: number;
  milestoneBudget: string;
  evidenceHash: string;
  signerRole: SignerRole;
}

export function useSignMilestone() {
  const { signTypedDataAsync } = useSignTypedData();
  const guard = useWalletGuard();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: SignArgs) => {
      // Preflight sama seperti aksi tulis: connect + wallet sesuai + jaringan benar.
      await guard.ensureReady();
      const signature = await signTypedDataAsync({
        domain: EIP712_DOMAIN,
        types: EIP712_TYPES,
        primaryType: "MilestoneApproval",
        message: {
          programId: BigInt(a.programId),
          milestoneIndex: BigInt(a.milestoneIndex),
          milestoneBudget: BigInt(a.milestoneBudget),
          evidenceHash: a.evidenceHash as `0x${string}`,
        },
      });
      return submitSignature({
        milestoneId: a.milestoneId,
        milestoneIndex: a.milestoneIndex,
        milestoneBudget: a.milestoneBudget,
        evidenceHash: a.evidenceHash,
        signature,
        signerRole: a.signerRole,
      });
    },
    onSuccess: (_d, a) =>
      qc.invalidateQueries({ queryKey: ["signatures", a.milestoneId] }),
  });
}
