import { handleApiError, successResponse, validationError } from '@/lib/api-response';
import { getAuthFromRequest, getOptionalAuthFromRequest } from '@/lib/auth/session';
import { postService } from '@/services/post.service';
import { CreatePostSchema } from '@/lib/validation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = getOptionalAuthFromRequest(request);
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;

    const feed = await postService.getFeed({
      userId: auth?.userId,
      cursor,
    });

    return successResponse(feed);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    const body = await request.json();
    const validation = CreatePostSchema.safeParse(body);

    if (!validation.success) {
      return validationError(validation.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '));
    }

    const post = await postService.createPost(auth.userId, validation.data);
    return successResponse(post, 201, 'Post created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
