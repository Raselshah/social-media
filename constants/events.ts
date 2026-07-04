export const SOCIAL_EVENTS = {
  POST_CREATED: 'PostCreated',
  POST_UPDATED: 'PostUpdated',
  POST_DELETED: 'PostDeleted',
  COMMENT_CREATED: 'CommentCreated',
  COMMENT_DELETED: 'CommentDeleted',
  LIKE_ADDED: 'LikeAdded',
  LIKE_REMOVED: 'LikeRemoved',
  USER_FOLLOWED: 'UserFollowed',
  USER_UNFOLLOWED: 'UserUnfollowed',
  JOB_CREATED: 'JobCreated',
  JOB_APPLIED: 'JobApplied',
  MESSAGE_SENT: 'MessageSent',
  NOTIFICATION_CREATED: 'NotificationCreated',
  MEDIA_UPLOADED: 'MediaUploaded',
  FEED_REFRESH_REQUESTED: 'FeedRefreshRequested',
  RECOMMENDATION_REQUESTED: 'RecommendationRequested',
  SEARCH_INDEXED: 'SearchIndexed',
  ANALYTICS_TRACKED: 'AnalyticsTracked',
} as const;

export type SocialEventType = (typeof SOCIAL_EVENTS)[keyof typeof SOCIAL_EVENTS];

export const KAFKA_TOPICS = {
  SOCIAL_EVENTS: 'social.events',
  NOTIFICATIONS: 'social.notifications',
  FEED_UPDATES: 'social.feed-updates',
  ANALYTICS: 'social.analytics',
  SEARCH: 'social.search',
  DLQ: 'social.dlq',
} as const;
