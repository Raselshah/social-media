import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const successResponse = <T>(
  data: T,
  status = 200,
  message?: string
) => {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiSuccessResponse<T>,
    { status }
  );
};

export const errorResponse = (
  message: string,
  status = 500,
  error?: string
) => {
  return NextResponse.json(
    {
      error: error || 'Internal Server Error',
      message,
      status,
    } as ApiErrorResponse,
    { status }
  );
};

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.status);
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 500, error.name);
  }

  return errorResponse('An unexpected error occurred', 500);
};

// Specific error responses
export const unauthorized = (message = 'Unauthorized') =>
  errorResponse(message, 401, 'Unauthorized');

export const forbidden = (message = 'Forbidden') =>
  errorResponse(message, 403, 'Forbidden');

export const notFound = (message = 'Not found') =>
  errorResponse(message, 404, 'Not Found');

export const badRequest = (message = 'Bad request') =>
  errorResponse(message, 400, 'Bad Request');

export const conflict = (message = 'Resource already exists') =>
  errorResponse(message, 409, 'Conflict');

export const validationError = (message: string) =>
  errorResponse(message, 400, 'Validation Error');
