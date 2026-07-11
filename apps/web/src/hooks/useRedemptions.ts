import { useQuery } from "@tanstack/react-query";
import { fetchRedemptions, fetchRedemptionStats } from "../api/redemptionApi";
import type { RedemptionStatus } from "../types/redemption";

export function useRedemptions(status?: RedemptionStatus) {
  return useQuery({
    queryKey: ["redemptions", status ?? "all"],
    queryFn: () => fetchRedemptions(status ? { status } : undefined),
  });
}

export function useRedemptionStats() {
  return useQuery({
    queryKey: ["redemption-stats"],
    queryFn: fetchRedemptionStats,
  });
}
