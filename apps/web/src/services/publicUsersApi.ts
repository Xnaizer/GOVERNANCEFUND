import { api } from "../lib/api";
import type { Pagination } from "../types/common";

interface Envelope<T> { data: T; error: string | null; meta: { pagination?: Pagination }; }

export interface PublicUserRow {
  id: string;
  username: string;
  name: string | null;
  role: string;
  walletAddress: string | null;
  isVerified: boolean;
  reputationScore: number;
  profilePictureURL: string | null;
  institution?: string | null;
  createdAt: string;
}

export interface PublicUserProgram {
  programId: number;
  title: string | null;
  status: string;
  displayTab: string;
  totalBudget: string;
  integrity: string;
  createdAt: string;
}

interface ProgramMini { title: string | null; status: string; totalBudget: string }

export interface RoleVoteBallotItem {
  votedAt: string;
  roleVote: { voteId: number; candidate: string; roleToTarget: string; isDevote: boolean; executed: boolean };
}
export interface UnfreezeBallotItem {
  approve: boolean;
  votedAt: string;
  unfreezeVote: { programId: number; resolved: boolean; program?: ProgramMini | null };
}
export interface FreezeItem {
  programId: number;
  outcome: string;
  reason: string | null;
  frozenAt: string;
  resolvedAt: string | null;
  program?: ProgramMini | null;
}

export interface PublicUserDetail extends PublicUserRow {
  profileBannerURL?: string | null;
  position?: string | null;
  nationality?: string | null;
  programs: PublicUserProgram[];
  roleVoteBallots?: RoleVoteBallotItem[] | null;
  unfreezeBallots?: UnfreezeBallotItem[] | null;
  freezes?: FreezeItem[] | null;
  reputationLogs?: { change: number; reason: string; scoreAfter: number; programId: number | null; createdAt: string }[] | null;
}

export async function fetchPublicUsers(params: { role?: string; sort?: "reputation" | "recent"; page?: number; limit?: number } = {}) {
  const res = await api.get<Envelope<PublicUserRow[]>>("/public/users", { params });
  return { users: res.data.data, pagination: res.data.meta.pagination };
}

export async function fetchPublicUser(id: string) {
  const res = await api.get<Envelope<PublicUserDetail>>(`/public/users/${id}`);
  return res.data.data;
}
