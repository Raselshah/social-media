export {
  signAccessToken,
  verifyAccessToken,
  createRefreshTokenValue,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  parseCookies,
  ACCESS_TOKEN_TTL,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/auth/tokens';

export type { AuthUser, TokenPayload } from '@/lib/auth/tokens';

export { getAuthFromRequest, getOptionalAuthFromRequest } from '@/lib/auth/session';
export type { AuthContext } from '@/lib/auth/session';
export { getCurrentUserFromRequest } from '@/lib/auth/middleware';

import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Backward-compatible aliases
export { createRefreshTokenValue as createRefreshToken } from '@/lib/auth/tokens';
export { signAccessToken as createAccessToken } from '@/lib/auth/tokens';
