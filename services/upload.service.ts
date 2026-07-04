import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { SOCIAL_EVENTS } from '@/constants/events';
import { publishEvent } from '@/lib/kafka/producer';

export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string }> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = path.extname(file.name) || '.png';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;

    await publishEvent(SOCIAL_EVENTS.MEDIA_UPLOADED, { url, filename });

    return { url };
  },
};
