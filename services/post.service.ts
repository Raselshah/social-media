import { ApiError } from '@/lib/api-response';
import { SOCIAL_EVENTS } from '@/constants/events';
import { publishEvent } from '@/lib/kafka/producer';
import { postRepository } from '@/repositories/post.repository';
import { feedService, mapPostToDto } from '@/modules/feed/feed.service';
import { cacheInvalidationService } from '@/services/cache-invalidation.service';
import { CreatePostDto, PostDto, PostReactionDto } from '@/types/dto/post.dto';
import {
  DEFAULT_REACTION,
  emptyReactionCounts,
  ReactionType,
  toReactionType,
} from '@/constants/reactions';

export const postService = {
  async getFeed(params: { userId?: string; cursor?: string; take?: number }) {
    return feedService.getHomeFeed(params);
  },

  async createPost(authorId: string, input: CreatePostDto): Promise<PostDto> {
    const post = await postRepository.create({
      content: input.content,
      imageUrl: input.imageUrl || null,
      visibility: input.visibility,
      authorId,
    });

    await publishEvent(SOCIAL_EVENTS.POST_CREATED, {
      postId: post.id,
      authorId,
      visibility: input.visibility,
    });

    await cacheInvalidationService.onPostCreated(post.id, authorId);

    return {
      ...mapPostToDto({ ...post, postLikes: [], comments: [] }, authorId),
      likedByCurrentUser: false,
      likeCount: post._count.postLikes,
      commentCount: post._count.comments,
      likedUsers: [],
    };
  },

  async updatePost(
    postId: string,
    userId: string,
    data: { content?: string; visibility?: string; imageUrl?: string | null },
  ): Promise<PostDto> {
    const existing = await postRepository.findById(postId);
    if (!existing) throw new ApiError(404, 'Post not found');
    if (existing.authorId !== userId) throw new ApiError(403, 'Forbidden');

    const post = await postRepository.update(postId, data);

    await publishEvent(SOCIAL_EVENTS.POST_UPDATED, { postId, authorId: userId });
    await cacheInvalidationService.onPostUpdated(postId, userId);

    return mapPostToDto({ ...post, postLikes: [], comments: [] }, userId);
  },

  async deletePost(postId: string, userId: string): Promise<void> {
    const existing = await postRepository.findById(postId);
    if (!existing) throw new ApiError(404, 'Post not found');
    if (existing.authorId !== userId) throw new ApiError(403, 'Forbidden');

    await postRepository.delete(postId);
    await publishEvent(SOCIAL_EVENTS.POST_DELETED, { postId, authorId: userId });
    await cacheInvalidationService.onPostDeleted(postId, userId);
  },

  /** Sets (or clears, when re-picked) the viewer's reaction on a post. */
  async setReaction(
    postId: string,
    userId: string,
    type: ReactionType,
  ): Promise<PostReactionDto> {
    const post = await postRepository.findById(postId);
    if (!post) throw new ApiError(404, 'Post not found');
    if (post.visibility === 'PRIVATE' && post.authorId !== userId) {
      throw new ApiError(404, 'Post not found');
    }

    const { reaction } = await postRepository.setReaction(postId, userId, type);

    await publishEvent(reaction ? SOCIAL_EVENTS.LIKE_ADDED : SOCIAL_EVENTS.LIKE_REMOVED, {
      postId,
      userId,
      entityType: 'post',
      reaction,
    });

    await cacheInvalidationService.onLikeChanged(postId, post.authorId);

    const likes = await postRepository.getLikes(postId);
    const reactionCounts = likes.reduce((acc, like) => {
      acc[toReactionType(like.type)] += 1;
      return acc;
    }, emptyReactionCounts());

    return {
      likedByCurrentUser: reaction !== null,
      likeCount: likes.length,
      likedUsers: likes.map((l) => l.user),
      currentUserReaction: reaction,
      reactionCounts,
    };
  },

  async toggleLike(postId: string, userId: string): Promise<PostReactionDto> {
    return postService.setReaction(postId, userId, DEFAULT_REACTION);
  },
};
