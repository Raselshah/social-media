import { SOCIAL_EVENTS } from '@/constants/events';
import { registerConsumer, CONSUMER_GROUPS } from '@/lib/kafka/consumer';
import { KAFKA_TOPICS, SocialEvent } from '@/lib/kafka/events';
import { cacheInvalidationService } from '@/services/cache-invalidation.service';
import { logger } from '@/lib/logger';

async function handleCacheInvalidation(event: SocialEvent) {
  const { type, payload } = event;

  switch (type) {
    case SOCIAL_EVENTS.POST_CREATED:
      await cacheInvalidationService.onPostCreated(
        String(payload.postId),
        String(payload.authorId),
      );
      break;
    case SOCIAL_EVENTS.POST_UPDATED:
      await cacheInvalidationService.onPostUpdated(
        String(payload.postId),
        String(payload.authorId),
      );
      break;
    case SOCIAL_EVENTS.POST_DELETED:
      await cacheInvalidationService.onPostDeleted(
        String(payload.postId),
        String(payload.authorId),
      );
      break;
    case SOCIAL_EVENTS.COMMENT_CREATED:
      await cacheInvalidationService.onCommentCreated(
        String(payload.postId),
        String(payload.authorId ?? ''),
      );
      break;
    case SOCIAL_EVENTS.COMMENT_DELETED:
      await cacheInvalidationService.onCommentDeleted(String(payload.postId));
      break;
    case SOCIAL_EVENTS.LIKE_ADDED:
    case SOCIAL_EVENTS.LIKE_REMOVED:
      if (payload.postId) {
        await cacheInvalidationService.onLikeChanged(
          String(payload.postId),
          String(payload.authorId ?? payload.userId ?? ''),
        );
      }
      break;
    default:
      logger.debug('No cache invalidation handler', { type });
  }
}

async function handleNotification(event: SocialEvent) {
  logger.info('Notification event processed', {
    type: event.type,
    eventId: event.id,
  });
}

async function handleAnalytics(event: SocialEvent) {
  logger.metric('social_event', 1, { type: event.type, eventId: event.id });
}

export async function startConsumers() {
  if (!process.env.KAFKA_BROKERS) return;

  await registerConsumer({
    groupId: CONSUMER_GROUPS.CACHE,
    topics: [KAFKA_TOPICS.SOCIAL_EVENTS],
    handler: handleCacheInvalidation,
  });

  await registerConsumer({
    groupId: CONSUMER_GROUPS.NOTIFICATIONS,
    topics: [KAFKA_TOPICS.SOCIAL_EVENTS],
    handler: handleNotification,
  });

  await registerConsumer({
    groupId: CONSUMER_GROUPS.ANALYTICS,
    topics: [KAFKA_TOPICS.SOCIAL_EVENTS],
    handler: handleAnalytics,
  });

  logger.info('Kafka consumers started');
}
