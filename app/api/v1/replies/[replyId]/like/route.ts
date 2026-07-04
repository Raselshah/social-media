import { handleApiError, successResponse, validationError } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { commentService } from '@/services/comment.service';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ replyId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { replyId } = await params;
    const reaction = await commentService.toggleReplyLike(replyId, auth.userId);
    return successResponse(reaction);
  } catch (error) {
    return handleApiError(error);
  }
}
