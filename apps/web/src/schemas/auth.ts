import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(30),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});
export type RegisterForm = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email atau username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});
export type LoginForm = z.infer<typeof loginSchema>;
