import {
    handleApiError,
    successResponse,
    validationError,
} from '@/lib/api-response';
import { getAuthFromRequest, getOptionalAuthFromRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { CreatePostSchema } from '@/lib/validation';
import { NextRequest } from 'next/server';
import { enqueueSocialEvent } from '@/lib/background-jobs';

type PostWithFeedState = {
  id: string;
  content: string;
  imageUrl: string | null;
  visibility: string;
  createdAt: Date;
  authorId: string;
  author: { id: string; firstName: string; lastName: string };
  _count: { comments: number; postLikes: number };
  postLikes?: { userId?: string; user: { id: string; firstName: string; lastName: string } }[];
};

export async function GET(request: NextRequest) {
  try {
    const user = getOptionalAuthFromRequest(request);
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const take = 10;

    const posts = await prisma.post.findMany({
      where: user
        ? {
            OR: [{ visibility: 'PUBLIC' }, { authorId: user.userId }],
          }
        : { visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        content: true,
        imageUrl: true,
        visibility: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
            select: { comments: true, postLikes: true },
        },
        postLikes: {
          take: 12,
          orderBy: { createdAt: 'desc' },
          select: {
            userId: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        comments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            authorId: true,
            author: {
              select: { id: true, firstName: true, lastName: true },
            },
            _count: {
              select: { commentLikes: true },
            },
            ...(user && {
              commentLikes: {
                where: { userId: user.userId },
                select: { id: true },
              },
            }),
          },
        },
      },
    });

    const hasMore = posts.length > take;
    const data = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

    return successResponse({
      data: (data as PostWithFeedState[]).map((post) => ({
        ...post,
        likedByCurrentUser: Boolean(
          user && post.postLikes?.some((like) => like.userId === user.userId)
        ),
        likeCount: post._count.postLikes,
        commentCount: post._count.comments,
        likedUsers: post.postLikes?.map((like) => like.user) ?? [],
        postLikes: undefined,
      })),
      cursor: nextCursor,
      hasMore,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    const body = await request.json();

    const validationResult = CreatePostSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return validationError(errors);
    }

    const { content, imageUrl, visibility } = validationResult.data;

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || null,
        visibility,
        authorId: auth.userId,
      },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        visibility: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { comments: true, postLikes: true },
        },
      },
    });

    await enqueueSocialEvent('post.created', {
      postId: post.id,
      authorId: auth.userId,
      visibility,
    });

    return successResponse(
      {
        ...post,
        likedByCurrentUser: false,
        likeCount: post._count.postLikes,
        commentCount: post._count.comments,
        likedUsers: [],
      },
      201,
      'Post created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
