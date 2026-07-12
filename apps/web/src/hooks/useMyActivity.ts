import { useQuery } from "@tanstack/react-query";
import { fetchPublicUser } from "../services/publicUsersApi";
import { useMe } from "./useAuth";

/**
 * Aktivitas governance milik user yang login (per peran) — reuse profil publik diri sendiri:
 *  ADMIN     → roleVoteBallots (role yang saya vote)
 *  VALIDATOR → unfreezeBallots (banding yang saya vote)
 *  AUDITOR   → freezes (program yang saya bekukan)
 */
export function useMyActivity() {
  const { data: me } = useMe();
  return useQuery({
    queryKey: ["my-activity", me?.id],
    queryFn: () => fetchPublicUser(me!.id),
    enabled: !!me?.id,
    staleTime: 30_000,
  });
}
