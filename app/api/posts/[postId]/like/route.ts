import { handleApiError, notFound, successResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { enqueueSocialEvent } from '@/lib/background-jobs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, visibility: true, authorId: true },
    });

    if (!post) {
      return notFound('Post not found');
    }

    if (post.visibility === 'PRIVATE' && post.authorId !== auth.userId) {
      return notFound('Post not found');
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: auth.userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.postLike.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.postLike.create({ data: { userId: auth.userId, postId } });
    }

    await enqueueSocialEvent('post.reaction.toggled', {
      postId,
      userId: auth.userId,
      liked: !existingLike,
    });

    const likes = await prisma.postLike.findMany({
      where: { postId },
      select: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    const likedByCurrentUser = likes.some((like) => like.user.id === auth.userId);

    return successResponse({
      likedByCurrentUser,
      likeCount: likes.length,
      likedUsers: likes.map((like) => like.user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
