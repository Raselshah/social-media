import { NextRequest } from 'next/server';
import { ApiError } from '@/lib/api-response';
import { verifyAccessToken, TokenPayload } from '@/lib/auth/tokens';

export type AuthContext = {
  userId: string;
  email: string;
};

export function getAuthFromRequest(request: NextRequest): AuthContext {
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    throw new ApiError(401, 'No authentication token found');
  }

  try {
    const payload = verifyAccessToken(token) as TokenPayload;
    if (!payload.sub || !payload.email) {
      throw new ApiError(401, 'Invalid token payload');
    }
    return { userId: payload.sub, email: payload.email };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired token');
  }
}

export function getOptionalAuthFromRequest(request: NextRequest): AuthContext | null {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return null;

  try {
    const payload = verifyAccessToken(token) as TokenPayload;
    if (!payload.sub || !payload.email) return null;
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
