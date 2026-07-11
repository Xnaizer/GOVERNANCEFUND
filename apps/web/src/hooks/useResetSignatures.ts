import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetSignatures } from "../api/signatureApi";

/** Reset seluruh set tanda tangan milestone (PIC, hanya saat milestone PLANNED). */
export function useResetSignatures(programId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: string) => resetSignatures(milestoneId),
    onSuccess: (_d, milestoneId) => {
      qc.invalidateQueries({ queryKey: ["signatures", milestoneId] });
      qc.invalidateQueries({ queryKey: ["program-authed", programId] });
    },
  });
}
