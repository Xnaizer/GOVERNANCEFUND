import { useQuery } from "@tanstack/react-query";
import {
  fetchRedemptions,
  fetchRedemptionStats,
} from "../services/redemptionApi";
import type { RedemptionStatus } from "../types/redemption";

export function useRedemptions(status?: RedemptionStatus, page = 1, limit = 12) {
  return useQuery({
    queryKey: ["redemptions", status ?? "all", page, limit],
    queryFn: () => fetchRedemptions({ status, page, limit }),
    placeholderData: (prev) => prev,
  });
}

export function useRedemptionStats() {
  return useQuery({
    queryKey: ["redemption-stats"],
    queryFn: fetchRedemptionStats,
  });
}
