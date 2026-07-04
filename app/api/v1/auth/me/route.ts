import { handleApiError, notFound, successResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { authService } from '@/services/auth.service';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    const user = await authService.getCurrentUser(auth.userId);

    if (!user) {
      return notFound('User not found');
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}
