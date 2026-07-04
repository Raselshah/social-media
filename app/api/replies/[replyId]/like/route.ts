import { handleApiError, notFound, successResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { enqueueSocialEvent } from '@/lib/background-jobs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { replyId } = await params;

    const reply = await prisma.reply.findUnique({ where: { id: replyId }, select: { id: true } });
    if (!reply) {
      return notFound('Reply not found');
    }

    const existingLike = await prisma.replyLike.findUnique({
      where: { userId_replyId: { userId: auth.userId, replyId } },
    });

    if (existingLike) {
      await prisma.replyLike.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.replyLike.create({ data: { userId: auth.userId, replyId } });
    }

    await enqueueSocialEvent('reply.reaction.toggled', {
      replyId,
      userId: auth.userId,
      liked: !existingLike,
    });

    const likes = await prisma.replyLike.findMany({
      where: { replyId },
      select: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    return successResponse({
      likedByCurrentUser: likes.some((like) => like.user.id === auth.userId),
      likeCount: likes.length,
      likedUsers: likes.map((like) => like.user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
