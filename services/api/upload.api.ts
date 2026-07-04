import { apiClient } from '@/lib/axios/client';
import { ApiSuccessResponse } from '@/lib/api-response';

export const uploadApi = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiSuccessResponse<{ url: string }>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data.url;
  },
};
