import { apiClient } from '@/lib/axios/client';
import { ApiSuccessResponse } from '@/lib/api-response';
import {
  CreatePostDto,
  PaginatedFeedDto,
  PostDto,
  ReactionDto,
} from '@/types/dto/post.dto';

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

  toggleLike(postId: string) {
    return apiClient.post<ApiSuccessResponse<ReactionDto>>(`/posts/${postId}/like`);
  },
};
