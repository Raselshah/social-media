export const REACTION_TYPES = ['LIKE', 'HAHA', 'ANGRY'] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];

export const DEFAULT_REACTION: ReactionType = 'LIKE';

export const REACTIONS: Record<
  ReactionType,
  { label: string; emoji: string; textClass: string; bgClass: string }
> = {
  LIKE: { label: 'Like', emoji: '👍', textClass: 'text-[#168bff]', bgClass: 'bg-blue-50/60' },
  HAHA: { label: 'Haha', emoji: '😃', textClass: 'text-amber-500', bgClass: 'bg-amber-50/60' },
  ANGRY: { label: 'Angry', emoji: '😠', textClass: 'text-orange-600', bgClass: 'bg-orange-50/60' },
};

export function isReactionType(value: unknown): value is ReactionType {
  return typeof value === 'string' && (REACTION_TYPES as readonly string[]).includes(value);
}

export function toReactionType(value: unknown): ReactionType {
  return isReactionType(value) ? value : DEFAULT_REACTION;
}

export function emptyReactionCounts(): Record<ReactionType, number> {
  return REACTION_TYPES.reduce(
    (acc, type) => ({ ...acc, [type]: 0 }),
    {} as Record<ReactionType, number>,
  );
}

export function totalReactions(counts: Partial<Record<ReactionType, number>> | undefined): number {
  if (!counts) return 0;
  return REACTION_TYPES.reduce((sum, type) => sum + (counts[type] ?? 0), 0);
}

/** Reaction types ordered by count, highest first — used for the reaction stack. */
export function topReactions(
  counts: Partial<Record<ReactionType, number>> | undefined,
  limit = 3,
): ReactionType[] {
  if (!counts) return [];
  return REACTION_TYPES.filter((type) => (counts[type] ?? 0) > 0)
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
    .slice(0, limit);
}
