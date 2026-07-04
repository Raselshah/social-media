import { feedService } from '@/modules/feed/feed.service';
import { cacheDelete, cacheDeletePattern } from '@/lib/redis/cache';
import { profileCacheKey, userCacheKey } from '@/lib/redis/keys';
import { logger } from '@/lib/logger';

export const cacheInvalidationService = {
  async onPostCreated(postId: string, authorId: string) {
    await feedService.invalidateForPost(postId, authorId);
    await cacheDelete(userCacheKey(authorId));
    logger.debug('Cache invalidated: post created', { postId, authorId });
  },

  async onPostUpdated(postId: string, authorId: string) {
    await feedService.invalidateForPost(postId, authorId);
    logger.debug('Cache invalidated: post updated', { postId, authorId });
  },

  async onPostDeleted(postId: string, authorId: string) {
    await feedService.invalidateForPost(postId, authorId);
    logger.debug('Cache invalidated: post deleted', { postId, authorId });
  },

  async onCommentCreated(postId: string, authorId: string) {
    await feedService.invalidateForPost(postId, authorId);
    logger.debug('Cache invalidated: comment created', { postId });
  },

  async onCommentDeleted(postId: string) {
    await cacheDeletePattern(`*feed:home:*`);
    logger.debug('Cache invalidated: comment deleted', { postId });
  },

  async onLikeChanged(postId: string, authorId: string) {
    await feedService.invalidateForPost(postId, authorId);
    logger.debug('Cache invalidated: like changed', { postId });
  },

  async onUserUpdated(userId: string) {
    await cacheDelete(userCacheKey(userId));
    await cacheDelete(profileCacheKey(userId));
    await feedService.invalidateForUser(userId);
  },
};
