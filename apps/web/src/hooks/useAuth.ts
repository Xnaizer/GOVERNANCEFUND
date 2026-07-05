import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../api/authApi";
import type { AuthUser } from "../types/auth";

export function useMe() {
  return useQuery<AuthUser | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch {
        return null; // 401 = belum login
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => qc.setQueryData(["me"], null),
  });
}

export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}
