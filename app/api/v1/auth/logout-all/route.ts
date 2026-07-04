import { handleApiError, successResponse } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { authService } from '@/services/auth.service';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    await authService.logoutAllDevices(auth.userId);
    return successResponse(null, 200, 'Logged out from all devices');
  } catch (error) {
    return handleApiError(error);
  }
}
