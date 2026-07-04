import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  notFound,
  forbidden,
  validationError,
} from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';
import { UpdatePostSchema } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return notFound('Post not found');
    }

    if (post.authorId !== auth.userId) {
      return forbidden('You can only edit your own posts');
    }

    const body = await request.json();
    const validationResult = UpdatePostSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return validationError(errors);
    }

    const { content, visibility } = validationResult.data;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content, visibility },
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
          select: { comments: true, postLikes: true },
        },
      },
    });

    return successResponse(updatedPost, 200, 'Post updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return notFound('Post not found');
    }

    if (post.authorId !== auth.userId) {
      return forbidden('You can only delete your own posts');
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return successResponse(null, 200, 'Post deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
