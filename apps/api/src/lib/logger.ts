import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
    level: env.LOG_LEVEL,
    base: { service: "governancefund-api" },
    redact: {
        paths: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.passwordHash", "*.signature"],
        remove: true
    },
    transport: env.NODE_ENV === "development" ? { 
        target: "pino-pretty",
        options: {
            colorize: true, 
            translateTime: "SYS:standard", 
            ignore: "pid,hostname" 
        }
    } : undefined
});