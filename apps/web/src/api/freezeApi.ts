import { api } from "../lib/api";

export interface FreezeEvidenceBody {
  reason: string;
  description?: string;
  evidenceUrl?: string;
}

/** Auditor melampirkan alasan/bukti pembekuan (Web2) ke FreezeOutcome. */
export async function submitFreezeEvidence(programId: number, body: FreezeEvidenceBody) {
  const res = await api.post(`/programs/${programId}/freeze-evidence`, body);
  return res.data.data;
}
