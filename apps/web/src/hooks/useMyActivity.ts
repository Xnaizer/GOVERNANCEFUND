import { useQuery } from "@tanstack/react-query";
import { fetchPublicUser } from "../services/publicUsersApi";
import { useMe } from "./useAuth";


export function useMyActivity() {
  const { data: me } = useMe();
  return useQuery({
    queryKey: ["my-activity", me?.id],
    queryFn: () => fetchPublicUser(me!.id),
    enabled: !!me?.id,
    staleTime: 30_000,
  });
}
