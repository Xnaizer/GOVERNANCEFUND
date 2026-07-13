import { redis } from "./redis";

export async function cacheAside<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await redis.get(key);

  if (cached !== null) {
    return JSON.parse(cached) as T;
  }

  const fresh = await fetcher();

  await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);

  return fresh;
}

export async function invalidate(key: string): Promise<void> {
  await redis.del(key);
}

export async function invalidatePattern(pattern: string): Promise<void> {
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100,
    );
    cursor = nextCursor;

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== "0");
}
