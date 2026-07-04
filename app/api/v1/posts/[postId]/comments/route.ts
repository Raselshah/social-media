import { handleApiError, notFound, successResponse, validationError } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { commentService } from '@/services/comment.service';
import { postRepository } from '@/repositories/post.repository';
import { CreateCommentSchema } from '@/lib/validation';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;

    const post = await postRepository.findById(postId);
    if (!post || (post.visibility === 'PRIVATE' && post.authorId !== auth.userId)) {
      return notFound('Post not found');
    }

    const comments = await commentService.getComments(postId, auth.userId);
    return successResponse(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;
    const body = await request.json();

    const validation = CreateCommentSchema.safeParse({ content: body.content, postId });
    if (!validation.success) {
      return validationError(validation.error.issues.map((e) => e.message).join(', '));
    }

    const comment = await commentService.createComment(postId, auth.userId, {
      content: validation.data.content,
    });

    return successResponse(comment, 201, 'Comment created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
