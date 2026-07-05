export type Role = "USER" | "ADMIN" | "VALIDATOR" | "AUDITOR" | "PIC";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;   // email terverifikasi
  isVerified: boolean; // identitas diverifikasi admin → akses dashboard
  reputationScore: number;
  walletAddress: string | null;
  name: string | null;
  institution: string | null;
  position: string | null;
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
