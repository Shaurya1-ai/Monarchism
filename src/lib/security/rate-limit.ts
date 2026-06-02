import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import { getRedis } from "@/lib/redis/client";

const limiters = new Map<string, RateLimiterMemory | RateLimiterRedis>();

export type RateLimitPreset = "auth" | "api" | "strict";

const PRESETS: Record<
  RateLimitPreset,
  { points: number; duration: number }
> = {
  auth: { points: 5, duration: 60 },
  api: { points: 100, duration: 60 },
  strict: { points: 3, duration: 300 },
};

function getLimiter(preset: RateLimitPreset) {
  const key = `rl:${preset}`;
  if (limiters.has(key)) return limiters.get(key)!;

  const { points, duration } = PRESETS[preset];
  const redis = getRedis();

  const limiter = redis
    ? new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: key,
        points,
        duration,
      })
    : new RateLimiterMemory({ points, duration });

  limiters.set(key, limiter);
  return limiter;
}

/** Returns true if request should be blocked */
export async function isRateLimited(
  identifier: string,
  preset: RateLimitPreset = "api"
): Promise<boolean> {
  try {
    const limiter = getLimiter(preset);
    await limiter.consume(identifier);
    return false;
  } catch {
    return true;
  }
}
