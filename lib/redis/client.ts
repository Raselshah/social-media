import Redis from 'ioredis';
import { logger } from '@/lib/logger';

let redis: Redis | null = null;
let redisAvailable = false;

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn('REDIS_URL not configured — caching disabled');
    return null;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: true,
  });

  client.on('connect', () => {
    redisAvailable = true;
    logger.info('Redis connected');
  });

  client.on('error', (err) => {
    redisAvailable = false;
    logger.error('Redis error', { error: err.message });
  });

  return client;
}

export function getRedis(): Redis | null {
  if (!redis) {
    redis = createRedisClient();
  }
  return redis;
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

export async function connectRedis(): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    if (client.status === 'wait') {
      await client.connect();
    }
    redisAvailable = true;
    return true;
  } catch (err) {
    redisAvailable = false;
    logger.error('Redis connection failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
