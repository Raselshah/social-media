import { cookies } from 'next/headers';

export const TOKEN_COOKIE_NAME = 'accessToken';
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60, // 1 hour
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

export const setAuthCookies = async (accessToken: string, refreshToken: string) => {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, accessToken, COOKIE_OPTIONS);
  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
};

export const getAuthToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE_NAME)?.value;
};

export const getRefreshToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
};
