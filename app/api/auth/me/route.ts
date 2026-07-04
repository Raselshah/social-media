import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, unauthorized, handleApiError } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return unauthorized('User not found');
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}
