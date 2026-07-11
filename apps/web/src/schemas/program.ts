import { z } from "zod";

// Rupiah disimpan sebagai string angka (integer, tanpa titik/koma). Harus > 0.
const rupiah = z
  .string()
  .regex(/^\d+$/, "Masukkan nominal Rupiah (angka saja, tanpa titik/koma)")
  .refine((v) => { try { return BigInt(v) > 0n; } catch { return false; } }, "Nominal harus lebih dari 0");

const milestone = z.object({
  title: z.string().min(1, "Wajib").max(200),
  description: z.string().max(2000).optional(),
  milestoneBudget: rupiah,
});

export const createProgramSchema = z.object({
  title: z.string().min(1, "Wajib").max(200),
  description: z.string().min(1, "Wajib").max(2000),
  totalBudget: rupiah,
  province: z.string().min(1, "Wajib").max(100),
  regency: z.string().min(1, "Wajib").max(100),
  district: z.string().max(100).optional(),
  locationAddress: z.string().min(1, "Wajib").max(300),
  executorName: z.string().min(1, "Wajib").max(200),
  executorRegistration: z.string().min(1, "Wajib").max(100),
  category: z.string().min(1, "Wajib").max(100),
  institutionName: z.string().min(1, "Wajib").max(200),
  fiscalYear: z.coerce
    .number({ invalid_type_error: "Tahun anggaran wajib diisi" })
    .int("Tahun anggaran tidak valid")
    .min(2000, "Tahun anggaran minimal 2000")
    .max(2100, "Tahun anggaran maksimal 2100"),
  plannedStartDate: z.string().optional(),
  plannedEndDate: z.string().optional(),
  milestones: z.array(milestone).min(1, "Minimal 1 milestone"),
}).refine(
  (d) => d.milestones.reduce((a, m) => a + BigInt(m.milestoneBudget || "0"), 0n) === BigInt(d.totalBudget || "0"),
  { message: "Jumlah budget milestone harus = totalBudget", path: ["totalBudget"] },
);

export type CreateProgramForm = z.infer<typeof createProgramSchema>;
