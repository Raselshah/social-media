import { CACHE_TTL } from '@/constants/cache';
import { SOCIAL_EVENTS } from '@/constants/events';
import { DEFAULT_PAGE_SIZE } from '@/constants/api';
import { cacheAside, cacheDeletePattern } from '@/lib/redis/cache';
import { feedCacheKey } from '@/lib/redis/keys';
import { publishEvent } from '@/lib/kafka/producer';
import { logger } from '@/lib/logger';
import { postRepository } from '@/repositories/post.repository';
import { PaginatedFeedDto, PostDto } from '@/types/dto/post.dto';
import {
  emptyReactionCounts,
  ReactionType,
  toReactionType,
} from '@/constants/reactions';

type RawPost = Awaited<ReturnType<typeof postRepository.findFeed>>[number];
type RawLike = { userId?: string; type?: string; user: PostDto['likedUsers'][number] };

interface ReactionContext {
  counts?: Record<ReactionType, number>;
  viewerReaction?: ReactionType | null;
}

/** Falls back to tallying the sampled likes when no pre-computed counts are supplied. */
function tallyReactions(likes: RawLike[]): Record<ReactionType, number> {
  return likes.reduce((acc, like) => {
    const type = toReactionType(like.type);
    acc[type] += 1;
    return acc;
  }, emptyReactionCounts());
}

function mapPostToDto(post: RawPost, userId?: string, reactions?: ReactionContext): PostDto {
  const postLikes: RawLike[] = 'postLikes' in post ? post.postLikes : [];
  const sampledViewerLike = userId
    ? postLikes.find((like) => like.userId === userId)
    : undefined;
  const currentUserReaction =
    reactions?.viewerReaction !== undefined
      ? reactions.viewerReaction
      : sampledViewerLike
        ? toReactionType(sampledViewerLike.type)
        : null;

  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    visibility: post.visibility as 'PUBLIC' | 'PRIVATE',
    authorId: post.authorId,
    author: post.author,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    likedByCurrentUser: currentUserReaction !== null,
    likeCount: post._count.postLikes,
    commentCount: post._count.comments,
    likedUsers: postLikes?.map((like) => like.user) ?? [],
    currentUserReaction,
    reactionCounts: reactions?.counts ?? tallyReactions(postLikes),
    comments: post.comments?.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      authorId: c.authorId,
      author: c.author,
    })),
  };
}

function deduplicatePosts(posts: PostDto[]): PostDto[] {
  const seen = new Set<string>();
  return posts.filter((post) => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });
}

export const feedService = {
  async getHomeFeed(params: {
    userId?: string;
    cursor?: string;
    take?: number;
  }): Promise<PaginatedFeedDto<PostDto>> {
    const take = params.take ?? DEFAULT_PAGE_SIZE;
    const cacheKey = feedCacheKey('FEED_HOME', params.userId, params.cursor);

    const result = await cacheAside(cacheKey, CACHE_TTL.FEED, async () => {
      const posts = await postRepository.findFeed(params);
      const hasMore = posts.length > take;
      const data = hasMore ? posts.slice(0, -1) : posts;
      const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

      const postIds = data.map((p) => p.id);
      const [groupedCounts, viewerReactions] = await Promise.all([
        postRepository.getReactionCounts(postIds),
        params.userId
          ? postRepository.getUserReactions(postIds, params.userId)
          : Promise.resolve([]),
      ]);

      const countsByPost = new Map<string, Record<ReactionType, number>>();
      for (const row of groupedCounts) {
        const counts = countsByPost.get(row.postId) ?? emptyReactionCounts();
        counts[toReactionType(row.type)] += row._count._all;
        countsByPost.set(row.postId, counts);
      }

      const viewerByPost = new Map<string, ReactionType>(
        viewerReactions.map((row) => [row.postId, toReactionType(row.type)]),
      );

      return {
        data: data.map((p) =>
          mapPostToDto(p, params.userId, {
            counts: countsByPost.get(p.id) ?? emptyReactionCounts(),
            viewerReaction: params.userId ? (viewerByPost.get(p.id) ?? null) : null,
          }),
        ),
        cursor: nextCursor,
        hasMore,
      };
    });

    return {
      ...result,
      data: deduplicatePosts(result.data),
    };
  },

  async invalidateForPost(postId: string, authorId: string): Promise<void> {
    await Promise.all([
      cacheDeletePattern(`*feed:home:*`),
      cacheDeletePattern(`*feed:user:${authorId}*`),
      cacheDeletePattern(`*feed:trending:*`),
    ]);
    logger.debug('Feed cache invalidated for post', { postId, authorId });
  },

  async invalidateForUser(userId: string): Promise<void> {
    await cacheDeletePattern(`*feed:home:${userId}*`);
    await cacheDeletePattern(`*feed:user:${userId}*`);
  },

  async requestRefresh(userId: string, feedType = 'home'): Promise<void> {
    await publishEvent(SOCIAL_EVENTS.FEED_REFRESH_REQUESTED, { userId, feedType });
  },

  mergeFeeds(existing: PostDto[], incoming: PostDto[]): PostDto[] {
    return deduplicatePosts([...existing, ...incoming]);
  },
};

export { mapPostToDto };
