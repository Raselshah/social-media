import { getRedis } from '@/lib/redis/client';
import { logger } from '@/lib/logger';

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.warn('Cache get failed', { key, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.warn('Cache set failed', { key, error: err instanceof Error ? err.message : String(err) });
  }
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (err) {
    logger.warn('Cache delete failed', { key, error: err instanceof Error ? err.message : String(err) });
  }
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    logger.warn('Cache pattern delete failed', {
      pattern,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function cacheAside<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    logger.debug('Cache hit', { key });
    return cached;
  }

  logger.debug('Cache miss', { key });
  const value = await fetcher();
  await cacheSet(key, value, ttlSeconds);
  return value;
}

export async function incrementCounter(key: string, ttlSeconds: number): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, ttlSeconds);
    }
    return count;
  } catch {
    return 0;
  }
}
