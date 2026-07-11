import { z } from "zod";

const opt = z.string().optional();

export const profileSchema = z.object({
  name: z.string().max(120).optional(),
  nik: z.union([z.literal(""), z.string().regex(/^\d{16}$/, "NIK harus 16 digit")]).optional(),
  nip: z.string().max(30).optional(),
  institution: opt,
  position: opt,
  birthPlace: opt,
  birthDate: opt, 
  address: opt,
  phone: z.union([z.literal(""), z.string().regex(/^[0-9+\-\s]{6,20}$/, "Telepon tidak valid")]).optional(),
  nationality: opt,
});

export type ProfileForm = z.infer<typeof profileSchema>;
