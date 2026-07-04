import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-response';
import { clearAuthCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      // Revoke the refresh token
      const tokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true },
      });
    }

    // Create response and clear cookies
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    clearAuthCookies(response);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
