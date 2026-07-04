import { CACHE_PREFIX, CACHE_VERSION } from '@/constants/cache';

export function buildCacheKey(prefix: string, ...parts: (string | number | undefined)[]): string {
  const segments = [CACHE_VERSION, prefix, ...parts.filter(Boolean)];
  return segments.join(':');
}

export function feedCacheKey(
  feedType: keyof typeof CACHE_PREFIX,
  userId?: string,
  cursor?: string,
): string {
  const prefix = CACHE_PREFIX[feedType];
  return buildCacheKey(prefix, userId ?? 'anonymous', cursor ?? 'initial');
}

export function userCacheKey(userId: string): string {
  return buildCacheKey(CACHE_PREFIX.USER, userId);
}

export function profileCacheKey(userId: string): string {
  return buildCacheKey(CACHE_PREFIX.PROFILE, userId);
}

export function sessionCacheKey(sessionId: string): string {
  return buildCacheKey(CACHE_PREFIX.SESSION, sessionId);
}

export function notificationCountKey(userId: string): string {
  return buildCacheKey(CACHE_PREFIX.NOTIFICATION_COUNT, userId);
}

export function rateLimitKey(identifier: string, action: string): string {
  return buildCacheKey(CACHE_PREFIX.RATE_LIMIT, action, identifier);
}
