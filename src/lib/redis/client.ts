import Redis from "ioredis";

let redis: Redis | null = null;

/** Lazy Redis connection with graceful fallback when unavailable */
export function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
    redis.on("error", (err) => {
      console.warn("[Redis]", err.message);
    });
    return redis;
  } catch {
    return null;
  }
}

export async function redisGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    await client.connect().catch(() => {});
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.connect().catch(() => {});
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  } catch {
    /* cache miss is acceptable */
  }
}
