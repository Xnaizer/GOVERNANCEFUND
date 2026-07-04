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
    UPSTASH_REDIS_URL: z.string().min(1, "UPSTASH_REDIS_URL is required"),
    SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
    SMTP_PORT: z.coerce.number().default(2525),
    SMTP_USER: z.string().min(1, "SMTP_USER is required"),
    SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
    EMAIL_FROM: z.string().default("GovernanceFund <noreply@governancefund.dev>"),
    FRONTEND_URL: z.string().min(1, "http://localhost:3000"),
    ALCHEMY_BASE_SEPOLIA_RPC_URL: z.string().url("Invalid Alchemy RPC URL"),
    ALCHEMY_WEBHOOK_SECRET: z.string().min(1, "ALCHEMY_WEBHOOK_SECRET is required"),
    QUEUE_ADMIN_USER: z.string().default("admin"),
    QUEUE_ADMIN_PASS: z.string().min(1, "QUEUE_ADMIN_PASS is required"),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    SENTRY_DSN: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if(!parsed.success) {
    console.error("Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;