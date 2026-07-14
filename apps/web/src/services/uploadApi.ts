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

export const uploadUserAvatar = (file: File) =>
  uploadImage("/uploads/user/avatar", file);

export const uploadUserBanner = (file: File) =>
  uploadImage("/uploads/user/banner", file);

/** Unggah dokumen bukti milestone → IPFS + SHA-256 (di-anchor on-chain). Hanya saat PLANNED. */
export async function uploadMilestoneEvidence(milestoneId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post<
    Envelope<{ cid: string; gatewayUrl: string; evidenceHash: string }>
  >(`/uploads/milestone/${milestoneId}/evidence`, fd);
  return res.data.data;
}
