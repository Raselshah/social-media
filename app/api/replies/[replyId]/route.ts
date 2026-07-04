import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  forbidden,
  notFound,
  validationError,
} from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';
import { UpdateReplySchema } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { replyId } = await params;

    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
      select: { authorId: true },
    });

    if (!reply) {
      return notFound('Reply not found');
    }

    if (reply.authorId !== auth.userId) {
      return forbidden('You can only edit your own replies');
    }

    const body = await request.json();
    const validationResult = UpdateReplySchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return validationError(errors);
    }

    const { content } = validationResult.data;

    const updatedReply = await prisma.reply.update({
      where: { id: replyId },
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
          select: { replyLikes: true },
        },
      },
    });

    return successResponse(updatedReply, 200, 'Reply updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { replyId } = await params;

    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
      select: { authorId: true },
    });

    if (!reply) {
      return notFound('Reply not found');
    }

    if (reply.authorId !== auth.userId) {
      return forbidden('You can only delete your own replies');
    }

    await prisma.reply.delete({
      where: { id: replyId },
    });

    return successResponse(null, 200, 'Reply deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
