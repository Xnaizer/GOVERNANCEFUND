import { api } from "../lib/api";

interface Envelope<T> {
  data: T;
  error: string | null;
  meta: Record<string, unknown>;
}

async function uploadImage(path: string, file: File) {
  const fd = new FormData();

  fd.append("file", file);

  const res = await api.post<Envelope<{ url: string; publicId: string }>>(
    path,
    fd,
  );

  return res.data.data;
}

export const uploadWithdrawalReceipt = (withdrawalId: string, file: File) =>
  uploadImage(`/uploads/withdrawal/${withdrawalId}/receipt`, file);

export interface ProgramImageResult {
  id: string;
  url: string;
}

export async function uploadProgramImage(programId: number, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post<Envelope<ProgramImageResult>>(
    `/uploads/program/${programId}/image`,
    fd,
  );
  return res.data.data;
}

export async function replaceProgramImage(
  programId: number,
  imageId: string,
  file: File,
) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.put<Envelope<ProgramImageResult>>(
    `/uploads/program/${programId}/image/${imageId}`,
    fd,
  );
  return res.data.data;
}

export async function deleteProgramImage(programId: number, imageId: string) {
  const res = await api.delete<Envelope<{ deleted: boolean }>>(
    `/uploads/program/${programId}/image/${imageId}`,
  );
  return res.data.data;
}

export const uploadUserAvatar = (file: File) =>
  uploadImage("/uploads/user/avatar", file);

export const uploadUserBanner = (file: File) =>
  uploadImage("/uploads/user/banner", file);

export async function uploadMilestoneEvidence(milestoneId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post<
    Envelope<{ cid: string; gatewayUrl: string; evidenceHash: string }>
  >(`/uploads/milestone/${milestoneId}/evidence`, fd);
  return res.data.data;
}