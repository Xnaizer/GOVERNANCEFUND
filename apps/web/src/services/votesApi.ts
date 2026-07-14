import { api } from "../lib/api";
import type { Pagination } from "../types/common";

interface Envelope<T> {
  data: T;
  error: string | null;
  meta: { pagination?: Pagination };
}

export interface VoteUserMini {
  id: string;
  name: string | null;
  username: string;
  walletAddress: string | null;
  profilePictureURL: string | null;
  role: string;
}

export interface RoleVoteRow {
  voteId: number;
  candidate: string;
  roleToTarget: string;
  voteCount: number;
  isDevote: boolean;
  executed: boolean;
  candidateUser?: VoteUserMini | null;
}

export async function fetchRoleVotes(
  params: { page?: number; limit?: number } = {},
) {
  const res = await api.get<Envelope<RoleVoteRow[]>>("/public/votes", {
    params: { limit: 12, ...params },
  });
  return { rows: res.data.data, pagination: res.data.meta.pagination };
}

export interface VoteBallot {
  votedAt: string;
  voter: VoteUserMini | null;
}

export type RoleVoteDetail = RoleVoteRow & { ballots?: VoteBallot[] };

export async function fetchRoleVote(voteId: number) {
  const res = await api.get<Envelope<RoleVoteDetail>>(
    `/public/votes/${voteId}`,
  );
  return res.data.data;
}

export interface UnfreezeVoteRow {
  id: string;
  programId: number;
  picWallet: string;
  approveVotes: number;
  rejectVotes: number;
  appealStartedAt: string | null;
  resolved: boolean;
  createdAt: string;
  _count?: { ballots: number };
}

export async function fetchUnfreezeVotes(
  params: { page?: number; limit?: number } = {},
) {
  const res = await api.get<Envelope<UnfreezeVoteRow[]>>(
    "/public/unfreeze-votes",
    { params: { limit: 12, ...params } },
  );
  return { rows: res.data.data, pagination: res.data.meta.pagination };
}
