import { useQuery } from "@tanstack/react-query";
import { listProgramsAuthed } from "../services/programApi";
import type { ProgramStatus } from "../types/program";

export function useProgramsByStatus(statuses: ProgramStatus[]) {
  const status = statuses.join(",");
  return useQuery({
    queryKey: ["programs-by-status", status],
    queryFn: async () => {
      const { programs } = await listProgramsAuthed({ status, limit: 60 });
      return programs.filter((p) => p.isOnChain && statuses.includes(p.status));
    },
  });
}
