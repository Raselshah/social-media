import { apiClient } from '@/lib/axios/client';
import { ApiSuccessResponse } from '@/lib/api-response';
import { UserDto, LoginDto, RegisterDto } from '@/types/dto/auth.dto';

export const authApi = {
  me() {
    return apiClient.get<ApiSuccessResponse<UserDto>>('/auth/me');
  },

  login(data: LoginDto) {
    return apiClient.post<ApiSuccessResponse<UserDto>>('/auth/login', data);
  },

  register(data: RegisterDto) {
    return apiClient.post<ApiSuccessResponse<UserDto>>('/auth/register', data);
  },

  logout() {
    return apiClient.post<ApiSuccessResponse<null>>('/auth/logout');
  },

  logoutAllDevices() {
    return apiClient.post<ApiSuccessResponse<null>>('/auth/logout-all');
  },

  refresh() {
    return apiClient.post<ApiSuccessResponse<null>>('/auth/refresh');
  },
};
