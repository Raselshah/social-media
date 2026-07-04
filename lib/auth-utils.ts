import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { ApiError } from './api-response';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export interface TokenPayload {
  sub: string;
  email: string;
}

export const getAuthFromRequest = (request: NextRequest) => {
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    throw new ApiError(401, 'No authentication token found');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (!payload.sub || !payload.email) {
      throw new ApiError(401, 'Invalid token payload');
    }
    return { userId: payload.sub, email: payload.email };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired token');
  }
};

export const getOptionalAuthFromRequest = (request: NextRequest) => {
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (!payload.sub || !payload.email) {
      return null;
    }
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
};
