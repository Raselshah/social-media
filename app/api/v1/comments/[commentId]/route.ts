import { handleApiError, successResponse, validationError } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { commentService } from '@/services/comment.service';
import { UpdateCommentSchema } from '@/lib/validation';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { commentId } = await params;
    const body = await request.json();
    const validation = UpdateCommentSchema.safeParse(body);

    if (!validation.success) {
      return validationError(validation.error.issues.map((e) => e.message).join(', '));
    }

    const comment = await commentService.updateComment(commentId, auth.userId, validation.data.content);
    return successResponse(comment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { commentId } = await params;
    await commentService.deleteComment(commentId, auth.userId);
    return successResponse(null, 200, 'Comment deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
