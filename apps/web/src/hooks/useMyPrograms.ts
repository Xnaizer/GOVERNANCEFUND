import { useQuery } from "@tanstack/react-query";
import { listProgramsAuthed } from "../api/programApi";
import { useMe } from "./useAuth";

export function useMyPrograms() {
  const { data: me } = useMe();
  const wallet = me?.walletAddress?.toLowerCase();
  return useQuery({
    queryKey: ["my-programs", wallet],
    enabled: !!wallet,
    queryFn: async () => {
      const { programs } = await listProgramsAuthed({ limit: 100 });
      return programs.filter((p) => p.picWallet?.toLowerCase() === wallet);
    },
  });
}
