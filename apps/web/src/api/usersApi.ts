import { api } from "../lib/api";
import type { Role } from "../types/auth";
import type { Pagination } from "../types/common";

interface Envelope<T> { data: T; error: string | null; meta: Record<string, unknown>; }

export interface AdminUser {
  id: string; username: string; email: string; role: Role;
  isActive: boolean; isVerified: boolean; walletAddress: string | null;
  name: string | null; reputationScore: number; profilePictureURL?: string | null; createdAt: string;
}

// Backend userController.list membalas { data: { users, pagination }, error, meta } —
// bukan array langsung. Baca bentuk sebenarnya di sini agar FE tak crash saat .map().
export async function listUsersAdmin(params: { page?: number; limit?: number; role?: Role; isVerified?: boolean } = {}) {
  const res = await api.get<Envelope<{ users: AdminUser[]; pagination?: Pagination }>>("/users", { params });
  const body = res.data.data;
  return { users: body?.users ?? [], pagination: body?.pagination };
}

export async function verifyUser(id: string) {
  const res = await api.patch<Envelope<{ id: string; isVerified: boolean }>>(`/users/${id}/verify`, { isVerified: true });
  return res.data.data;
}
