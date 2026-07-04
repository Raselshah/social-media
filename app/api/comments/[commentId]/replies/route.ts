import {
    handleApiError,
    notFound,
    successResponse,
    validationError,
} from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { CreateReplySchema } from '@/lib/validation';
import { NextRequest } from 'next/server';
import { enqueueSocialEvent } from '@/lib/background-jobs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        post: { select: { visibility: true, authorId: true } },
      },
    });

    if (!comment) {
      return notFound('Comment not found');
    }

    if (comment.post.visibility === 'PRIVATE' && comment.post.authorId !== auth.userId) {
      return notFound('Comment not found');
    }

    const body = await request.json();
    const validationResult = CreateReplySchema.safeParse({
      content: body.content,
      commentId,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return validationError(errors);
    }

    const { content } = validationResult.data;

    const reply = await prisma.reply.create({
      data: {
        content,
        commentId,
        authorId: auth.userId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { replyLikes: true },
        },
      },
    });

    await enqueueSocialEvent('reply.created', {
      commentId,
      replyId: reply.id,
      authorId: auth.userId,
    });

    return successResponse(
      { ...reply, likeCount: reply._count.replyLikes, likedByCurrentUser: false, likedUsers: [] },
      201,
      'Reply created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
