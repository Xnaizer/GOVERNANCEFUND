import { api } from "../lib/api";
import type { Pagination } from "../types/common";
import type { RedemptionRow, RedemptionStats } from "../types/redemption";

interface Envelope<T> { data: T; error: string | null; meta: { pagination?: Pagination }; }

export async function fetchRedemptions(params: { status?: string; page?: number; limit?: number } = {}) {
  const res = await api.get<Envelope<RedemptionRow[]>>("/gateway/redemptions", {
    params: { limit: 12, ...params },
  });
  return { rows: res.data.data, pagination: res.data.meta.pagination };
}

export async function fetchRedemptionById(id: number) {
  const res = await api.get<Envelope<RedemptionRow>>(`/gateway/redemptions/${id}`);
  return res.data.data;
}

export async function fetchRedemptionsByPic(wallet: string) {
  const res = await api.get<Envelope<RedemptionRow[]>>(`/gateway/redemptions/pic/${wallet}`);
  return res.data.data;
}

export async function fetchRedemptionStats() {
  const res = await api.get<Envelope<RedemptionStats>>("/gateway/stats");
  return res.data.data;
}
