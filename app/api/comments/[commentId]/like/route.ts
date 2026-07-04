import { handleApiError, notFound, successResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { enqueueSocialEvent } from '@/lib/background-jobs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { commentId } = await params;

    const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { id: true } });
    if (!comment) {
      return notFound('Comment not found');
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId: auth.userId, commentId } },
    });

    if (existingLike) {
      await prisma.commentLike.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.commentLike.create({ data: { userId: auth.userId, commentId } });
    }

    await enqueueSocialEvent('comment.reaction.toggled', {
      commentId,
      userId: auth.userId,
      liked: !existingLike,
    });

    const likes = await prisma.commentLike.findMany({
      where: { commentId },
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
