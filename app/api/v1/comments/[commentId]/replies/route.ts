import { handleApiError, successResponse, validationError } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { commentService } from '@/services/comment.service';
import { CreateReplySchema } from '@/lib/validation';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { commentId } = await params;
    const body = await request.json();
    const validation = CreateReplySchema.safeParse({
      content: body.content,
      commentId,
    });

    if (!validation.success) {
      return validationError(validation.error.issues.map((e) => e.message).join(', '));
    }

    const reply = await commentService.createReply(commentId, auth.userId, validation.data);
    return successResponse(reply, 201, 'Reply created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
