/**
 * @deprecated Use Kafka via @/lib/kafka/producer instead.
 * Kept for backward compatibility with legacy API routes.
 */
import { SOCIAL_EVENTS, type SocialEventType } from '@/constants/events';
import { publishEvent } from '@/lib/kafka/producer';

type LegacyEventMap = {
  'post.created': typeof SOCIAL_EVENTS.POST_CREATED;
  'post.reaction.toggled': typeof SOCIAL_EVENTS.LIKE_ADDED;
  'comment.created': typeof SOCIAL_EVENTS.COMMENT_CREATED;
  'comment.reaction.toggled': typeof SOCIAL_EVENTS.LIKE_ADDED;
  'reply.created': typeof SOCIAL_EVENTS.COMMENT_CREATED;
  'reply.reaction.toggled': typeof SOCIAL_EVENTS.LIKE_ADDED;
};

const legacyMapping: LegacyEventMap = {
  'post.created': SOCIAL_EVENTS.POST_CREATED,
  'post.reaction.toggled': SOCIAL_EVENTS.LIKE_ADDED,
  'comment.created': SOCIAL_EVENTS.COMMENT_CREATED,
  'comment.reaction.toggled': SOCIAL_EVENTS.LIKE_ADDED,
  'reply.created': SOCIAL_EVENTS.COMMENT_CREATED,
  'reply.reaction.toggled': SOCIAL_EVENTS.LIKE_ADDED,
};

type LegacyEventName = keyof LegacyEventMap;
type SocialEventPayload = Record<string, string | number | boolean | null | undefined>;

export async function enqueueSocialEvent(
  name: LegacyEventName,
  payload: SocialEventPayload,
) {
  const mappedType = legacyMapping[name] as SocialEventType;
  await publishEvent(mappedType, payload as Record<string, unknown>);
}
