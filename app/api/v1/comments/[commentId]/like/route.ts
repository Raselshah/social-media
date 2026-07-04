import { handleApiError, successResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { commentService } from '@/services/comment.service';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { commentId } = await params;
    const reaction = await commentService.toggleCommentLike(commentId, auth.userId);
    return successResponse(reaction);
  } catch (error) {
    return handleApiError(error);
  }
}
