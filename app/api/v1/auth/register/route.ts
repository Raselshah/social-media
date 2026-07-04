import { handleApiError, successResponse, validationError } from '@/lib/api-response';
import { setAuthCookies } from '@/lib/auth';
import { authService } from '@/services/auth.service';
import { RegisterSchema } from '@/lib/validation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error.issues.map((e) => e.message).join(', '));
    }

    const { user, accessToken, refreshToken } = await authService.register(validation.data);
    const response = NextResponse.json(
      { success: true, data: user, message: 'Registration successful' },
      { status: 201 },
    );
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
