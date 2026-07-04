import { handleApiError, successResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { postService } from '@/services/post.service';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;
    const reaction = await postService.toggleLike(postId, auth.userId);
    return successResponse(reaction);
  } catch (error) {
    return handleApiError(error);
  }
}
