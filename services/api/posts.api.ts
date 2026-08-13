import { apiClient } from '@/lib/axios/client';
import { ApiSuccessResponse } from '@/lib/api-response';
import {
  CreatePostDto,
  PaginatedFeedDto,
  PostDto,
  PostReactionDto,
} from '@/types/dto/post.dto';
import { DEFAULT_REACTION, ReactionType } from '@/constants/reactions';

export const postsApi = {
  getFeed(params?: { cursor?: string }) {
    return apiClient.get<ApiSuccessResponse<PaginatedFeedDto<PostDto>>>('/posts', { params });
  },

  create(data: CreatePostDto) {
    return apiClient.post<ApiSuccessResponse<PostDto>>('/posts', data);
  },

  update(postId: string, data: Partial<CreatePostDto>) {
    return apiClient.patch<ApiSuccessResponse<PostDto>>(`/posts/${postId}`, data);
  },

  delete(postId: string) {
    return apiClient.delete<ApiSuccessResponse<null>>(`/posts/${postId}`);
  },

  react(postId: string, type: ReactionType = DEFAULT_REACTION) {
    return apiClient.post<ApiSuccessResponse<PostReactionDto>>(`/posts/${postId}/like`, { type });
  },

  toggleLike(postId: string) {
    return postsApi.react(postId, DEFAULT_REACTION);
  },
};
