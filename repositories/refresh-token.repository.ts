import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/auth/tokens';

export const refreshTokenRepository = {
  create(userId: string, tokenValue: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(tokenValue),
        userId,
        expiresAt,
      },
    });
  },

  findValid(tokenValue: string) {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash: hashToken(tokenValue),
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  revoke(tokenValue: string) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(tokenValue) },
      data: { revoked: true },
    });
  },

  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  },

  revokeAllExcept(userId: string, currentTokenValue: string) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
        NOT: { tokenHash: hashToken(currentTokenValue) },
      },
      data: { revoked: true },
    });
  },
};
