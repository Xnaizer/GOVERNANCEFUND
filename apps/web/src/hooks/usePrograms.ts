import { useQuery } from "@tanstack/react-query";
import { fetchPrograms, fetchProgram, fetchStats } from "../api/explorerApi";
import type { DisplayTab } from "../types/common";

export function usePrograms(tab: DisplayTab, page = 1) {
    return useQuery({
        queryKey: ["programs", tab, page],
        queryFn: () => fetchPrograms({ tab, page, limit: 100 }),
        placeholderData: (prev) => prev
    });
}

export function useProgram(id: number) {
  return useQuery({
    queryKey: ["program", id],
    queryFn: () => fetchProgram(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useStats() {
  return useQuery({ queryKey: ["stats"], queryFn: fetchStats });
}