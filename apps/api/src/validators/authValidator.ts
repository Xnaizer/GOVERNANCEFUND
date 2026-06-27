import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3, "Username min 3 chars").max(30),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password min 8 chars")
});

export type RegisterInput = z.infer<typeof registerSchema>;