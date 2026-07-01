import { z } from "zod";

export const verifyUserSchema = z.object({
    isVerified: z.boolean()
});

export type VerifyUserInput = z.infer<typeof verifyUserSchema>;

export const listUserQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    role: z.enum(["USER","ADMIN","VALIDATOR","AUDITOR","PIC"]).optional(),
    isVerified: z.enum(["true", "false"]).optional()
       .transform(v => v === undefined ? undefined : v === "true")
});

export type ListUserQueryInput = z.infer<typeof listUserQuerySchema>;