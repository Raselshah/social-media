import { KAFKA_TOPICS, SocialEvent, SocialEventType } from '@/lib/kafka/events';
import { getProducer } from '@/lib/kafka/client';
import { logger } from '@/lib/logger';

const processedEvents = new Set<string>();
const MAX_DEDUP_SIZE = 10_000;

function isDuplicate(eventId: string): boolean {
  if (processedEvents.has(eventId)) return true;
  processedEvents.add(eventId);
  if (processedEvents.size > MAX_DEDUP_SIZE) {
    const first = processedEvents.values().next().value;
    if (first) processedEvents.delete(first);
  }
  return false;
}

export function createEvent<T extends Record<string, unknown>>(
  type: SocialEventType,
  payload: T,
): SocialEvent<T> {
  return {
    id: crypto.randomUUID(),
    type,
    payload,
    occurredAt: new Date().toISOString(),
    version: 1,
  };
}

export async function publishEvent<T extends Record<string, unknown>>(
  type: SocialEventType,
  payload: T,
  topic: string = KAFKA_TOPICS.SOCIAL_EVENTS,
): Promise<void> {
  const event = createEvent(type, payload);

  const kafkaProducer = await getProducer();
  if (!kafkaProducer) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Event published (local)', { type, eventId: event.id });
    }
    return;
  }

  try {
    await kafkaProducer.send({
      topic,
      messages: [
        {
          key: event.id,
          value: JSON.stringify(event),
          headers: { eventType: type },
        },
      ],
    });
    logger.debug('Event published to Kafka', { type, eventId: event.id, topic });
  } catch (err) {
    logger.error('Kafka publish failed', {
      type,
      eventId: event.id,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function publishToDlq(
  originalEvent: SocialEvent,
  error: string,
): Promise<void> {
  await publishEvent(
    originalEvent.type,
    { ...originalEvent.payload, _dlqError: error, _originalEventId: originalEvent.id },
    KAFKA_TOPICS.DLQ,
  );
}

export async function handleEventIdempotently(
  event: SocialEvent,
  handler: (event: SocialEvent) => Promise<void>,
): Promise<boolean> {
  if (isDuplicate(event.id)) {
    logger.debug('Duplicate event skipped', { eventId: event.id, type: event.type });
    return false;
  }

  await handler(event);
  return true;
}
