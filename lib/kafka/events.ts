import { KAFKA_TOPICS, type SocialEventType } from '@/constants/events';
import { logger } from '@/lib/logger';

export interface SocialEvent<T = Record<string, unknown>> {
  id: string;
  type: SocialEventType;
  payload: T;
  occurredAt: string;
  version: number;
}

export { KAFKA_TOPICS };
export type { SocialEventType };
