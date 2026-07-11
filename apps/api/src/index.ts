import "./instrument";
import { env } from "./config/env";
import { app } from "./app";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";
import { startWorkers, stopWorkers } from "./workers";

function logFatal(label: string, err: unknown) {
    if (env.NODE_ENV === "production") {
        logger.fatal(`${label}: ${(err as Error)?.message ?? "unknown error"}`);
    } else {
        logger.fatal({ err }, label);
    }
}

process.on("uncaughtException", (err) => {
    logFatal("Uncaught exception", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    logFatal("Unhandled rejection", reason);
    process.exit(1);
});

async function main() {

    await prisma.$connect();
    console.log("[SERVER] Database connected");

    const server = app.listen(env.PORT, () => {
        console.log(`[SERVER] Server is running on http://localhost:${env.PORT}`);
    });

    if (env.ENABLE_WORKERS) {
        await startWorkers();
        console.log("[SERVER] Worker start listening...");
    } else {
        console.log("[SERVER] Workers DISABLED (ENABLE_WORKERS=false) — hemat kuota Redis");
    }

    const shutdown = async (signal: string) => {
        console.log(`\n[SERVER] ${signal} received. Shutting down gracefully...`);

        server.close(async () => {
            await prisma.$disconnect();
            console.log("[SERVER] Database disconnected");
            redis.disconnect();
            console.log("[SERVER] Redis disconnected");
            await stopWorkers();
            console.log("[SERVER] Worker offline");
            process.exit(0);
        });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
    logFatal("[SERVER] Failed to start server", err);
    process.exit(1);
});