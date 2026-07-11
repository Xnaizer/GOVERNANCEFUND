import { api } from "../lib/api";
import type { Pagination } from "../types/common";

interface Envelope<T> { data: T; error: string | null; meta: { pagination?: Pagination }; }

export interface VoteUserMini {
  id: string; name: string | null; username: string;
  walletAddress: string | null; profilePictureURL: string | null; role: string;
}

export interface RoleVoteRow {
  voteId: number; candidate: string; roleToTarget: string;
  voteCount: number; isDevote: boolean; executed: boolean;
  candidateUser?: VoteUserMini | null;
}

export async function fetchRoleVotes() {
  const res = await api.get<Envelope<RoleVoteRow[]>>("/public/votes", { params: { limit: 50 } });
  return res.data.data;
}

export async function fetchRoleVote(voteId: number) {
  const res = await api.get<Envelope<RoleVoteRow & { ballots?: { voterId: string; votedAt: string }[] }>>(`/public/votes/${voteId}`);
  return res.data.data;
}

export interface UnfreezeVoteRow {
  id: string; programId: number; picWallet: string;
  approveVotes: number; rejectVotes: number;
  appealStartedAt: string | null; resolved: boolean; createdAt: string;
  _count?: { ballots: number };
}

export async function fetchUnfreezeVotes() {
  const res = await api.get<Envelope<UnfreezeVoteRow[]>>("/public/unfreeze-votes", { params: { limit: 50 } });
  return res.data.data;
}
