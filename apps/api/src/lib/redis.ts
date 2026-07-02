import IORedis from "ioredis";
import { env } from "../config/env";

export const redis = new IORedis(env.UPSTASH_REDIS_URL, {
    maxRetriesPerRequest: null
});

redis.on("connect", () => {
    console.log("[SERVER] Connected to Upstash Redis");
});

redis.on("error", (err) => {
    console.error("[SERVER] Upstash Connection error: ", err.message);
});