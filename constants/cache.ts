export const CACHE_VERSION = 'v1';

export const CACHE_TTL = {
  FEED: 300,
  USER: 600,
  PROFILE: 900,
  SESSION: 86400,
  NOTIFICATION_COUNT: 60,
  SEARCH: 300,
  JOB: 600,
  TRENDING: 120,
  RATE_LIMIT: 60,
  OTP: 300,
} as const;

export const CACHE_PREFIX = {
  FEED_HOME: 'feed:home',
  FEED_FOLLOWING: 'feed:following',
  FEED_TRENDING: 'feed:trending',
  FEED_USER: 'feed:user',
  FEED_JOB: 'feed:job',
  FEED_COMPANY: 'feed:company',
  USER: 'user',
  PROFILE: 'profile',
  SESSION: 'session',
  NOTIFICATION_COUNT: 'notification:count',
  SEARCH: 'search',
  JOB: 'job',
  TRENDING: 'trending',
  OTP: 'otp',
  RATE_LIMIT: 'ratelimit',
} as const;

export type FeedCacheType = keyof typeof CACHE_PREFIX;
