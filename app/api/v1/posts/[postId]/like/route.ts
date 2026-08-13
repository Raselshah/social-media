import { handleApiError, successResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { postService } from '@/services/post.service';
import { toReactionType } from '@/constants/reactions';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;
    const body = await request.json().catch(() => null);
    const type = toReactionType((body as { type?: unknown } | null)?.type);
    const reaction = await postService.setReaction(postId, auth.userId, type);
    return successResponse(reaction);
  } catch (error) {
    return handleApiError(error);
  }
}
