export type Role = "USER" | "ADMIN" | "VALIDATOR" | "AUDITOR" | "PIC";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  reputationScore: number;
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
  profilePictureURL: string | null;
  profileBannerURL: string | null;
  createdAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  nik?: string;
  nip?: string;
  institution?: string;
  position?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  nationality?: string;
  profilePictureURL?: string;
}
