import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const createAccessToken = (payload: TokenPayload): string => {
  return jwt.sign({ sub: payload.userId, email: payload.email }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const createRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign({ sub: payload.userId, email: payload.email }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; userId?: string; email?: string };
    if (!decoded.email || (!decoded.sub && !decoded.userId)) {
      return null;
    }
    return { userId: decoded.userId || decoded.sub || '', email: decoded.email };
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; userId?: string; email?: string };
    if (!decoded.email || (!decoded.sub && !decoded.userId)) {
      return null;
    }
    return { userId: decoded.userId || decoded.sub || '', email: decoded.email };
  } catch {
    return null;
  }
};

export const decodeToken = (token: string) => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};
