import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyUser } from "../services/usersApi";

export function useVerifyUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => verifyUser(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-user", id] });
    },
  });
}
