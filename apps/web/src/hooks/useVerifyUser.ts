import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyUser } from "../api/usersApi";

/** Verifikasi identitas user (Web2, ADMIN). Prasyarat sebelum admin bisa Grant PIC. */
export function useVerifyUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => verifyUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}
