export type DisplayTab = "ACTIVE" | "FINISHED" | "FLAGGED" | "FRAUD";
export type Integrity = "VERIFIED" | "HASH_MISMATCH" | "ORPHAN";
export type SignerRole = "ADMIN" | "VALIDATOR" | "AUDITOR";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicStats {
  total: number;
  byTab: { active: number; finished: number; flagged: number; fraud: number };
}
