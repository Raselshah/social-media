import { ApiErrorResponse, ApiSuccessResponse } from '@/lib/api-response';

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }

  static fromResponse(response: ApiErrorResponse): ApiClientError {
    return new ApiClientError(response.status, response.message, response.error);
  }
}

export function isApiSuccess<T>(data: unknown): data is ApiSuccessResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    (data as ApiSuccessResponse<T>).success === true
  );
}

export function mapAxiosError(error: unknown): ApiClientError {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: ApiErrorResponse; status?: number } };
    const data = axiosError.response?.data;
    if (data?.message) {
      return ApiClientError.fromResponse(data);
    }
    return new ApiClientError(axiosError.response?.status || 500, 'Request failed');
  }
  if (error instanceof Error) {
    return new ApiClientError(500, error.message);
  }
  return new ApiClientError(500, 'An unexpected error occurred');
}
