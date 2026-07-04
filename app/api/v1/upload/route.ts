import { handleApiError, successResponse, validationError } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth/session';
import { uploadService } from '@/services/upload.service';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    getAuthFromRequest(request);
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return validationError('Please select an image.');
    }

    const result = await uploadService.uploadImage(file as File);
    return successResponse(result, 201, 'Image uploaded successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
