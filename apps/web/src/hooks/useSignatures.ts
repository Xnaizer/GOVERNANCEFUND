import { useQuery } from "@tanstack/react-query";
import { getSignatures } from "../services/signatureApi";

export function useSignatures(milestoneId: string | undefined) {
  return useQuery({
    queryKey: ["signatures", milestoneId],
    queryFn: () => getSignatures(milestoneId!),
    enabled: !!milestoneId,
  });
}
