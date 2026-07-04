import { KAFKA_TOPICS, SocialEvent } from '@/lib/kafka/events';
import { createConsumer } from '@/lib/kafka/client';
import { handleEventIdempotently, publishToDlq } from '@/lib/kafka/producer';
import { logger } from '@/lib/logger';

export type EventHandler = (event: SocialEvent) => Promise<void>;

interface ConsumerRegistration {
  groupId: string;
  topics: string[];
  handler: EventHandler;
}

const MAX_RETRIES = 3;

async function processWithRetry(
  event: SocialEvent,
  handler: EventHandler,
  attempt = 1,
): Promise<void> {
  try {
    await handleEventIdempotently(event, handler);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (attempt < MAX_RETRIES) {
      logger.warn('Event handler retry', { eventId: event.id, attempt, error: message });
      await new Promise((r) => setTimeout(r, attempt * 1000));
      return processWithRetry(event, handler, attempt + 1);
    }
    logger.error('Event handler failed — sending to DLQ', { eventId: event.id, error: message });
    await publishToDlq(event, message);
  }
}

export async function registerConsumer(registration: ConsumerRegistration): Promise<void> {
  const consumer = await createConsumer(registration.groupId);
  if (!consumer) {
    logger.warn('Kafka consumer not started — no brokers configured', {
      groupId: registration.groupId,
    });
    return;
  }

  await consumer.subscribe({ topics: registration.topics, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString()) as SocialEvent;
        await processWithRetry(event, registration.handler);
      } catch (err) {
        logger.error('Failed to parse Kafka message', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
  });
}

export const CONSUMER_GROUPS = {
  NOTIFICATIONS: 'socialmedia-notifications',
  FEED: 'socialmedia-feed',
  ANALYTICS: 'socialmedia-analytics',
  SEARCH: 'socialmedia-search',
  CACHE: 'socialmedia-cache',
} as const;

export const DEFAULT_CONSUMER_TOPICS = [KAFKA_TOPICS.SOCIAL_EVENTS];
