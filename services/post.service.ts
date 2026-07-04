import { ApiError } from '@/lib/api-response';
import { SOCIAL_EVENTS } from '@/constants/events';
import { publishEvent } from '@/lib/kafka/producer';
import { postRepository } from '@/repositories/post.repository';
import { feedService, mapPostToDto } from '@/modules/feed/feed.service';
import { cacheInvalidationService } from '@/services/cache-invalidation.service';
import { CreatePostDto, PostDto, ReactionDto } from '@/types/dto/post.dto';

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

  async toggleLike(postId: string, userId: string): Promise<ReactionDto> {
    const post = await postRepository.findById(postId);
    if (!post) throw new ApiError(404, 'Post not found');
    if (post.visibility === 'PRIVATE' && post.authorId !== userId) {
      throw new ApiError(404, 'Post not found');
    }

    const { liked } = await postRepository.toggleLike(postId, userId);

    await publishEvent(liked ? SOCIAL_EVENTS.LIKE_ADDED : SOCIAL_EVENTS.LIKE_REMOVED, {
      postId,
      userId,
      entityType: 'post',
    });

    await cacheInvalidationService.onLikeChanged(postId, post.authorId);

    const likes = await postRepository.getLikes(postId);
    return {
      likedByCurrentUser: likes.some((l) => l.user.id === userId),
      likeCount: likes.length,
      likedUsers: likes.map((l) => l.user),
    };
  },
};
