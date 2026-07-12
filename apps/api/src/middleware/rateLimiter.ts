import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../lib/redis";

function makeStore(prefix: string) {
  return new RedisStore({
    sendCommand: (...args: string[]) => redis.call(args[0] as string, ...args.slice(1)) as Promise<any>,
    prefix: `ratelimit:${prefix}`,
  });
}

function limitMessage(message: string) {
  return { data: null, error: message, meta: {} };
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("auth"),
  message: limitMessage("Too many authentication attempts, try again later"),
});

export const mutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("mutation"),
  message: limitMessage("Too many requests, try again later"),
});

// readLimiter kena di SEMUA route publik/list (paling sering) → pakai store default in-memory
// agar tak menembak Redis 2–3x per request. Cukup untuk 1 instance Railway (akademik).
// Rate-limit Redis dipertahankan untuk auth/mutation/signature (volume rendah, sensitif keamanan).
export const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage("Too many requests, try again later"),
});

export const signatureLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("signature"),
  message: limitMessage("Too many signature submissions, try again later"),
});