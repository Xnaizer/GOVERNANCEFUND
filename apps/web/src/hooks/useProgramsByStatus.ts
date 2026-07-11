import { useQuery } from "@tanstack/react-query";
import { listProgramsAuthed } from "../api/programApi";
import type { ProgramStatus } from "../types/program";

export function useProgramsByStatus(statuses: ProgramStatus[]) {
  return useQuery({
    queryKey: ["programs-by-status", statuses],
    queryFn: async () => {
      const { programs } = await listProgramsAuthed({ limit: 100 });
      return programs.filter((p) => p.isOnChain && statuses.includes(p.status));
    },
  });
}
