import { prisma } from '@/lib/prisma';
import { verifyAccessToken, getAccessTokenFromRequest } from '@/lib/auth/tokens';

export async function getCurrentUserFromRequest(request: Request) {
  const token = getAccessTokenFromRequest(request);

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
