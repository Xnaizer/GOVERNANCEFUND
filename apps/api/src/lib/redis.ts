import IORedis from "ioredis";
import { env } from "../config/env";
import { logger } from "./logger";

function redactRedisUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = "***";
    if (u.username) u.username = "***";
    return u.toString();
  } catch {
    return "<invalid redis url>";
  }
}

function createRedis(): IORedis {
  try {
    return new IORedis(env.UPSTASH_REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  } catch (err) {
    logger.fatal(
      `[SERVER] Failed to init Redis (${redactRedisUrl(
        env.UPSTASH_REDIS_URL,
      )}): ${(err as Error).message}`,
    );
    process.exit(1);
  }
}

export const redis = createRedis();

redis.on("connect", () => {
  console.log("[SERVER] Connected to Upstash Redis");
});

redis.on("error", (err) => {
  console.error("[SERVER] Upstash Connection error: ", err.message);
});
