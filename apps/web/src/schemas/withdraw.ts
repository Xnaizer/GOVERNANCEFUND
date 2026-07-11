import { z } from "zod";

export const withdrawSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+$/, "Masukkan nominal Rupiah (angka saja)")
    .refine((v) => { try { return BigInt(v) > 0n; } catch { return false; } }, "Nominal harus lebih dari 0"),
  recipientName: z.string().min(1, "Wajib").max(200),
  description: z.string().min(1, "Wajib").max(500),
});
export type WithdrawForm = z.infer<typeof withdrawSchema>;
