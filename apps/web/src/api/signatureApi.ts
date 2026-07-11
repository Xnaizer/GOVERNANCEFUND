import { api } from "../lib/api";
import type { SignerRole } from "../types/common";

interface Envelope<T> { data: T; error: string | null; meta: Record<string, unknown>; }

export interface SignatureRow { id: string; signerWallet: string; signerRole: SignerRole; signature?: string; signedAt: string; }
export interface SignatureSet { milestoneId: string; signatures: SignatureRow[]; collected: number; required: number; complete: boolean; }

export async function submitSignature(payload: {
  milestoneId: string; milestoneIndex: number; milestoneBudget: string; evidenceHash: string;
  signature: string; signerRole: SignerRole;
}) {
  const res = await api.post<Envelope<unknown>>("/signatures", payload);
  return res.data.data;
}

export async function getSignatures(milestoneId: string) {
  const res = await api.get<Envelope<SignatureSet>>(`/signatures/${milestoneId}`);
  return res.data.data;
}

export async function resetSignatures(milestoneId: string) {
  const res = await api.delete<Envelope<unknown>>(`/signatures/${milestoneId}`);
  return res.data.data;
}
