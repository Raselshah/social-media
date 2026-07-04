import { handleApiError, successResponse, validationError } from '@/lib/api-response';
import { setAuthCookies, clearAuthCookies, getRefreshTokenFromRequest } from '@/lib/auth';
import { getAuthFromRequest } from '@/lib/auth/session';
import { authService } from '@/services/auth.service';
import { LoginSchema, RegisterSchema } from '@/lib/validation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error.issues.map((e) => e.message).join(', '));
    }

    const { user, accessToken, refreshToken } = await authService.login(validation.data);
    const response = NextResponse.json(
      { success: true, data: user, message: 'Login successful' },
      { status: 200 },
    );
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
