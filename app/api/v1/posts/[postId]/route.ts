import { handleApiError, successResponse, validationError } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { postService } from '@/services/post.service';
import { UpdatePostSchema } from '@/lib/validation';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;
    const body = await request.json();
    const validation = UpdatePostSchema.safeParse(body);

    if (!validation.success) {
      return validationError(validation.error.issues.map((e) => e.message).join(', '));
    }

    const post = await postService.updatePost(postId, auth.userId, validation.data);
    return successResponse(post, 200, 'Post updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;
    await postService.deletePost(postId, auth.userId);
    return successResponse(null, 200, 'Post deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
