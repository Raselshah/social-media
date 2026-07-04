import { apiClient } from '@/lib/axios/client';
import { ApiSuccessResponse } from '@/lib/api-response';
import { CommentDto, CreateCommentDto, CreateReplyDto, ReplyDto } from '@/types/dto/comment.dto';
import { ReactionDto } from '@/types/dto/post.dto';

export const commentsApi = {
  getByPost(postId: string) {
    return apiClient.get<ApiSuccessResponse<CommentDto[]>>(`/posts/${postId}/comments`);
  },

  create(postId: string, data: CreateCommentDto) {
    return apiClient.post<ApiSuccessResponse<CommentDto>>(`/posts/${postId}/comments`, data);
  },

  update(commentId: string, content: string) {
    return apiClient.patch<ApiSuccessResponse<CommentDto>>(`/comments/${commentId}`, { content });
  },

  delete(commentId: string) {
    return apiClient.delete<ApiSuccessResponse<null>>(`/comments/${commentId}`);
  },

  toggleLike(commentId: string) {
    return apiClient.post<ApiSuccessResponse<ReactionDto>>(`/comments/${commentId}/like`);
  },

  createReply(commentId: string, data: CreateReplyDto) {
    return apiClient.post<ApiSuccessResponse<ReplyDto>>(`/comments/${commentId}/replies`, data);
  },

  updateReply(replyId: string, content: string) {
    return apiClient.patch<ApiSuccessResponse<ReplyDto>>(`/replies/${replyId}`, { content });
  },

  deleteReply(replyId: string) {
    return apiClient.delete<ApiSuccessResponse<null>>(`/replies/${replyId}`);
  },

  toggleReplyLike(replyId: string) {
    return apiClient.post<ApiSuccessResponse<ReactionDto>>(`/replies/${replyId}/like`);
  },
};
