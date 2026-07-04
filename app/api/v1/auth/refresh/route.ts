import { handleApiError, successResponse, unauthorized } from '@/lib/api-response';
import { clearAuthCookies, getRefreshTokenFromRequest, setAuthCookies } from '@/lib/auth';
import { authService } from '@/services/auth.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromRequest(request);
    if (!refreshToken) {
      return unauthorized('No refresh token found');
    }

    const tokens = await authService.refresh(refreshToken);
    const response = NextResponse.json(
      { success: true, data: null, message: 'Token refreshed' },
      { status: 200 },
    );
    setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
