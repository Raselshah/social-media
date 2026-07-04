import { incrementCounter } from '@/lib/redis/cache';
import { rateLimitKey } from '@/lib/redis/keys';
import { CACHE_TTL } from '@/constants/cache';
import { ApiError } from '@/lib/api-response';

export async function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
): Promise<void> {
  const key = rateLimitKey(identifier, action);
  const count = await incrementCounter(key, CACHE_TTL.RATE_LIMIT);

  if (count > maxRequests) {
    throw new ApiError(429, 'Too many requests. Please try again later.');
  }
}
