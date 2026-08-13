import { handleApiError, notFound, successResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { enqueueSocialEvent } from '@/lib/background-jobs';
import { emptyReactionCounts, toReactionType } from '@/constants/reactions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;
    const body = await request.json().catch(() => null);
    const type = toReactionType((body as { type?: unknown } | null)?.type);

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
      select: { id: true, type: true },
    });

    let currentUserReaction: ReturnType<typeof toReactionType> | null = type;

    if (existingLike?.type === type) {
      await prisma.postLike.delete({ where: { id: existingLike.id } });
      currentUserReaction = null;
    } else if (existingLike) {
      await prisma.postLike.update({ where: { id: existingLike.id }, data: { type } });
    } else {
      await prisma.postLike.create({ data: { userId: auth.userId, postId, type } });
    }

    await enqueueSocialEvent('post.reaction.toggled', {
      postId,
      userId: auth.userId,
      liked: currentUserReaction !== null,
      reaction: currentUserReaction,
    });

    const likes = await prisma.postLike.findMany({
      where: { postId },
      select: {
        type: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const reactionCounts = likes.reduce((acc, like) => {
      acc[toReactionType(like.type)] += 1;
      return acc;
    }, emptyReactionCounts());

    return successResponse({
      likedByCurrentUser: currentUserReaction !== null,
      likeCount: likes.length,
      likedUsers: likes.map((like) => like.user),
      currentUserReaction,
      reactionCounts,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
