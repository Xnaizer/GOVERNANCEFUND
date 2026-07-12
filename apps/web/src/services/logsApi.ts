import { api } from "../lib/api";
import type { Pagination } from "../types/common";

interface Envelope<T> { data: T; error: string | null; meta: { pagination?: Pagination }; }

interface LogUserMini { id: string; name: string | null; username: string; walletAddress: string | null; profilePictureURL: string | null; role: string; }

export interface RoleLogRow {
  id: string;
  changeType: string;
  targetWallet: string | null;
  targetRole: string;
  actorWallet: string | null;
  txHash: string | null;
  createdAt: string;
  targetUser: LogUserMini | null;
  actorUser: LogUserMini | null;
}

export async function fetchRoleLogs(params: { page?: number; limit?: number } = {}) {
  const res = await api.get<Envelope<RoleLogRow[]>>("/public/logs/roles", { params: { limit: 20, ...params } });
  return { rows: res.data.data, pagination: res.data.meta.pagination };
}
