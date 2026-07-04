import { handleApiError, successResponse, validationError } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { commentService } from '@/services/comment.service';
import { UpdateReplySchema } from '@/lib/validation';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ replyId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { replyId } = await params;
    const body = await request.json();
    const validation = UpdateReplySchema.safeParse(body);

    if (!validation.success) {
      return validationError(validation.error.issues.map((e) => e.message).join(', '));
    }

    const reply = await commentService.updateReply(replyId, auth.userId, validation.data.content);
    return successResponse(reply);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ replyId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { replyId } = await params;
    await commentService.deleteReply(replyId, auth.userId);
    return successResponse(null, 200, 'Reply deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
