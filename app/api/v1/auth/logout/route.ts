import { handleApiError } from '@/lib/api-response';
import { clearAuthCookies, getRefreshTokenFromRequest } from '@/lib/auth';
import { getOptionalAuthFromRequest } from '@/lib/auth/session';
import { authService } from '@/services/auth.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromRequest(request);
    const auth = getOptionalAuthFromRequest(request);

    await authService.logout(refreshToken ?? undefined, auth?.userId);

    const response = NextResponse.json(
      { success: true, data: null, message: 'Logged out successfully' },
      { status: 200 },
    );
    clearAuthCookies(response);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
