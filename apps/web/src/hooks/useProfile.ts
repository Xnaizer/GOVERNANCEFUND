import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../services/authApi";
import { type UpdateProfileInput } from "../types/auth";
import { uploadUserAvatar, uploadUserBanner } from "../services/uploadApi";

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user) => qc.setQueryData(["me"], user),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadUserAvatar(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useUploadBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadUserBanner(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}
