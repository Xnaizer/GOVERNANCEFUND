import { api } from "../lib/api";
import type { Role } from "../types/auth";
import type { Pagination } from "../types/common";

interface Envelope<T> {
  data: T;
  error: string | null;
  meta: Record<string, unknown>;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  walletAddress: string | null;
  name: string | null;
  reputationScore: number;
  profilePictureURL?: string | null;
  createdAt: string;
}


export async function listUsersAdmin(
  params: {
    page?: number;
    limit?: number;
    role?: Role;
    isVerified?: boolean;
  } = {},
) {
  const res = await api.get<
    Envelope<{ users: AdminUser[]; pagination?: Pagination }>
  >("/users", { params });
  const body = res.data.data;
  return { users: body?.users ?? [], pagination: body?.pagination };
}

export interface AdminUserDetail {
  id: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  walletAddress: string | null;
  name: string | null;
  nik: string | null;
  nip: string | null;
  institution: string | null;
  position: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  address: string | null;
  phone: string | null;
  nationality: string | null;
  reputationScore: number;
  profilePictureURL: string | null;
  profileBannerURL: string | null;
  createdAt: string;
  programsCount: number;
  missingFields: string[];
  isProfileComplete: boolean;
}

export async function getAdminUser(id: string) {
  const res = await api.get<Envelope<AdminUserDetail>>(`/users/${id}`);
  return res.data.data;
}

export async function verifyUser(id: string) {
  const res = await api.patch<Envelope<{ id: string; isVerified: boolean }>>(
    `/users/${id}/verify`,
    { isVerified: true },
  );
  return res.data.data;
}
