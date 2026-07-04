import { CACHE_TTL } from '@/constants/cache';
import { cacheAside, cacheGet, cacheSet } from '@/lib/redis/cache';
import { feedCacheKey } from '@/lib/redis/keys';
import { logger } from '@/lib/logger';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAt: string;
}

const MOCK_JOBS: JobListing[] = [
  { id: 'job-1', title: 'Senior Software Engineer', company: 'TechCorp', location: 'Remote', postedAt: new Date().toISOString() },
  { id: 'job-2', title: 'Product Designer', company: 'DesignHub', location: 'New York', postedAt: new Date().toISOString() },
];

export const jobFeedService = {
  async getJobFeed(userId?: string, cursor?: string) {
    const cacheKey = feedCacheKey('FEED_JOB', userId, cursor);

    return cacheAside(cacheKey, CACHE_TTL.JOB, async () => ({
      data: MOCK_JOBS,
      cursor: undefined,
      hasMore: false,
    }));
  },

  async getRecommendedJobs(userId: string) {
    const cacheKey = `v1:job:recommended:${userId}`;
    return cacheAside(cacheKey, CACHE_TTL.JOB, async () => MOCK_JOBS.slice(0, 3));
  },

  async getSavedJobs(userId: string) {
    const cacheKey = `v1:job:saved:${userId}`;
    const cached = await cacheGet<JobListing[]>(cacheKey);
    return cached ?? [];
  },

  async saveJob(userId: string, jobId: string) {
    const saved = await this.getSavedJobs(userId);
    if (!saved.find((j) => j.id === jobId)) {
      const job = MOCK_JOBS.find((j) => j.id === jobId);
      if (job) {
        await cacheSet(`v1:job:saved:${userId}`, [...saved, job], CACHE_TTL.JOB);
      }
    }
  },

  async invalidateJobCache(userId?: string) {
    logger.debug('Job cache invalidated', { userId });
  },
};
