import {
  forbidden,
  handleApiError,
  notFound,
  successResponse,
  validationError,
} from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { UpdateCommentSchema } from '@/lib/validation';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) {
      return notFound('Comment not found');
    }

    if (comment.authorId !== auth.userId) {
      return forbidden('You can only edit your own comments');
    }

    const body = await request.json();
    const validationResult = UpdateCommentSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return validationError(errors);
    }

    const { content } = validationResult.data;

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: { replies_v2: true, commentLikes: true },
        },
      },
    });

    return successResponse(updatedComment, 200, 'Comment updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) {
      return notFound('Comment not found');
    }

    if (comment.authorId !== auth.userId) {
      return forbidden('You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return successResponse(null, 200, 'Comment deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
