import { handleApiError, successResponse, validationError } from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';
import { mkdir, writeFile } from 'fs/promises';
import { NextRequest } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    getAuthFromRequest(request);
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return validationError('Please select an image.');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = path.extname((file as File).name) || '.png';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return successResponse({ url: `/uploads/${filename}` }, 201, 'Image uploaded successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
