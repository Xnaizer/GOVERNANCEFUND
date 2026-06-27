import { env } from "./config/env";
import { app } from "./app";
import { prisma } from "./lib/prisma";

async function main() {

    await prisma.$connect();
    console.log("[SERVER] Database connected");

    const server = app.listen(env.PORT, () => {
        console.log(`[SERVER] Server is running on http://localhost:${env.PORT}`);
    });

    const shutdown = async (signal: string) => {
        console.log(`\n[SERVER] ${signal} received. Shutting down gracefully...`);

        server.close(async () => {
            await prisma.$disconnect();
            console.log("[SERVER] Database disconnected");
            process.exit(0);
        });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
    console.error("[SERVER] Failed to start server: ", err);
    process.exit(1);
});