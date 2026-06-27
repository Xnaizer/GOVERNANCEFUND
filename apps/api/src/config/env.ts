import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();


const envSchema = z.object({
    NODE_ENV: z.enum(['development', "production", "test"]).default("development"),
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
    JWT_EXPIRES_IN: z.string().default("1d"),
    UPSTASH_REDIS_URL: z.string().min(1, "UPSTASH_REDIS_URL is required")
});

const parsed = envSchema.safeParse(process.env);

if(!parsed.success) {
    console.error("Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;