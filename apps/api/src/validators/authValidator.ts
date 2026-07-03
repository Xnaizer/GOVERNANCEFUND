import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3, "Username min 3 chars").max(30),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password min 8 chars")
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    identifier: z.string().min(1, "Email or username is required"),
    password: z.string().min(1, "Password is required")
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(8, "Password min 8 chars")
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
    name: z.string().min(1).max(120).optional(),
    nik: z.string().regex(/^\d{16}$/, "NIK must be 16 digits").optional(),
    nip: z.string().min(1).max(30).optional(),
    institution: z.string().max(150).optional(),
    position: z.string().max(120).optional(),
    birthPlace: z.string().max(100).optional(),
    birthDate: z.coerce.date().optional(),         
    address: z.string().max(300).optional(),
    phone: z.string().regex(/^[0-9+\-\s]{6,20}$/, "Invalid phone").optional(),
    nationality: z.string().max(60).optional(),
    profilePictureURL: z.string().url().optional()
}).refine((d) => Object.keys(d).length > 0, { message: "At least one field is required" });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
