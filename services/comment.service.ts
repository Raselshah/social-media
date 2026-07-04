import { ApiError } from '@/lib/api-response';
import { SOCIAL_EVENTS } from '@/constants/events';
import { publishEvent } from '@/lib/kafka/producer';
import { commentRepository, replyRepository } from '@/repositories/comment.repository';
import { postRepository } from '@/repositories/post.repository';
import { cacheInvalidationService } from '@/services/cache-invalidation.service';
import { CommentDto, CreateCommentDto, CreateReplyDto, ReplyDto } from '@/types/dto/comment.dto';
import { ReactionDto } from '@/types/dto/post.dto';

type CommentRow = Awaited<ReturnType<typeof commentRepository.findByPost>>[number];
type ReplyRow = NonNullable<CommentRow['replies_v2']>[number];

function mapReply(reply: ReplyRow, userId?: string): ReplyDto {
  return {
    id: reply.id,
    content: reply.content,
    commentId: reply.commentId,
    authorId: reply.authorId,
    author: reply.author,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
    likedByCurrentUser: Boolean(userId && reply.replyLikes?.some((l) => l.userId === userId)),
    likeCount: reply._count.replyLikes,
    likedUsers: reply.replyLikes?.map((l) => l.user) ?? [],
  };
}

function mapComment(comment: CommentRow, userId?: string): CommentDto {
  return {
    id: comment.id,
    content: comment.content,
    postId: comment.postId,
    authorId: comment.authorId,
    author: comment.author,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    likedByCurrentUser: Boolean(userId && comment.commentLikes?.some((l) => l.userId === userId)),
    likeCount: comment._count.commentLikes,
    likedUsers: comment.commentLikes?.map((l) => l.user) ?? [],
    replies: comment.replies_v2?.map((r) => mapReply(r, userId)),
  };
}

export const commentService = {
  async getComments(postId: string, userId?: string): Promise<CommentDto[]> {
    const comments = await commentRepository.findByPost(postId, userId);
    return comments.map((c) => mapComment(c, userId));
  },

  async createComment(postId: string, authorId: string, input: CreateCommentDto): Promise<CommentDto> {
    const post = await postRepository.findById(postId);
    if (!post) throw new ApiError(404, 'Post not found');

    const comment = await commentRepository.create({
      content: input.content,
      postId,
      authorId,
    });

    await publishEvent(SOCIAL_EVENTS.COMMENT_CREATED, { commentId: comment.id, postId, authorId });
    await cacheInvalidationService.onCommentCreated(postId, post.authorId);

    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      authorId: comment.authorId,
      author: comment.author,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      likedByCurrentUser: false,
      likeCount: 0,
      replies: [],
    };
  },

  async updateComment(commentId: string, userId: string, content: string): Promise<CommentDto> {
    const existing = await commentRepository.findById(commentId);
    if (!existing) throw new ApiError(404, 'Comment not found');
    if (existing.authorId !== userId) throw new ApiError(403, 'Forbidden');

    const comment = await commentRepository.update(commentId, content);
    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      authorId: comment.authorId,
      author: comment.author,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  },

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const existing = await commentRepository.findById(commentId);
    if (!existing) throw new ApiError(404, 'Comment not found');
    if (existing.authorId !== userId) throw new ApiError(403, 'Forbidden');

    await commentRepository.delete(commentId);
    await publishEvent(SOCIAL_EVENTS.COMMENT_DELETED, { commentId, postId: existing.postId, authorId: userId });
    await cacheInvalidationService.onCommentDeleted(existing.postId);
  },

  async toggleCommentLike(commentId: string, userId: string): Promise<ReactionDto> {
    const existing = await commentRepository.findById(commentId);
    if (!existing) throw new ApiError(404, 'Comment not found');

    const { liked } = await commentRepository.toggleLike(commentId, userId);

    await publishEvent(liked ? SOCIAL_EVENTS.LIKE_ADDED : SOCIAL_EVENTS.LIKE_REMOVED, {
      commentId,
      userId,
      entityType: 'comment',
    });

    const likes = await commentRepository.getLikes(commentId);
    return {
      likedByCurrentUser: likes.some((l) => l.user.id === userId),
      likeCount: likes.length,
      likedUsers: likes.map((l) => l.user),
    };
  },

  async createReply(commentId: string, authorId: string, input: CreateReplyDto): Promise<ReplyDto> {
    const comment = await commentRepository.findById(commentId);
    if (!comment) throw new ApiError(404, 'Comment not found');

    const reply = await replyRepository.create({
      content: input.content,
      commentId,
      authorId,
    });

    await publishEvent(SOCIAL_EVENTS.COMMENT_CREATED, {
      replyId: reply.id,
      commentId,
      postId: comment.postId,
      authorId,
    });

    return {
      id: reply.id,
      content: reply.content,
      commentId: reply.commentId,
      authorId: reply.authorId,
      author: reply.author,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      likedByCurrentUser: false,
      likeCount: 0,
    };
  },

  async updateReply(replyId: string, userId: string, content: string): Promise<ReplyDto> {
    const existing = await replyRepository.findById(replyId);
    if (!existing) throw new ApiError(404, 'Reply not found');
    if (existing.authorId !== userId) throw new ApiError(403, 'Forbidden');

    const reply = await replyRepository.update(replyId, content);
    return {
      id: reply.id,
      content: reply.content,
      commentId: reply.commentId,
      authorId: reply.authorId,
      author: reply.author,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
    };
  },

  async deleteReply(replyId: string, userId: string): Promise<void> {
    const existing = await replyRepository.findById(replyId);
    if (!existing) throw new ApiError(404, 'Reply not found');
    if (existing.authorId !== userId) throw new ApiError(403, 'Forbidden');
    await replyRepository.delete(replyId);
  },

  async toggleReplyLike(replyId: string, userId: string): Promise<ReactionDto> {
    const existing = await replyRepository.findById(replyId);
    if (!existing) throw new ApiError(404, 'Reply not found');

    const { liked } = await replyRepository.toggleLike(replyId, userId);

    await publishEvent(liked ? SOCIAL_EVENTS.LIKE_ADDED : SOCIAL_EVENTS.LIKE_REMOVED, {
      replyId,
      userId,
      entityType: 'reply',
    });

    const likes = await replyRepository.getLikes(replyId);
    return {
      likedByCurrentUser: likes.some((l) => l.user.id === userId),
      likeCount: likes.length,
      likedUsers: likes.map((l) => l.user),
    };
  },
};
