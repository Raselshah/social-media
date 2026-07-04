import {
    handleApiError,
    notFound,
    successResponse,
    validationError,
} from '@/lib/api-response';
import { getAuthFromRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { CreateCommentSchema } from '@/lib/validation';
import { NextRequest } from 'next/server';
import { enqueueSocialEvent } from '@/lib/background-jobs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, visibility: true, authorId: true },
    });

    if (!post) {
      return notFound('Post not found');
    }

    if (post.visibility === 'PRIVATE' && post.authorId !== auth.userId) {
      return notFound('Post not found');
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        content: true,
        postId: true,
        authorId: true,
        createdAt: true,
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        commentLikes: {
          take: 12,
          orderBy: { createdAt: 'desc' },
          select: {
            userId: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        replies_v2: {
          orderBy: { createdAt: 'asc' },
          take: 20,
          select: {
            id: true,
            content: true,
            commentId: true,
            authorId: true,
            createdAt: true,
            author: {
              select: { id: true, firstName: true, lastName: true },
            },
            replyLikes: {
              take: 12,
              orderBy: { createdAt: 'desc' },
              select: {
                userId: true,
                user: { select: { id: true, firstName: true, lastName: true } },
              },
            },
            _count: {
              select: { replyLikes: true },
            },
          },
        },
        _count: {
          select: { commentLikes: true },
        },
      },
    });

    return successResponse(
      comments.map((comment) => ({
        ...comment,
        likeCount: comment._count.commentLikes,
        likedByCurrentUser: comment.commentLikes.some((like) => like.userId === auth.userId),
        likedUsers: comment.commentLikes.map((like) => like.user),
        replies: comment.replies_v2.map((reply) => ({
          ...reply,
          likeCount: reply._count.replyLikes,
          likedByCurrentUser: reply.replyLikes.some((like) => like.userId === auth.userId),
          likedUsers: reply.replyLikes.map((like) => like.user),
          replyLikes: undefined,
        })),
        replies_v2: undefined,
        commentLikes: undefined,
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, visibility: true, authorId: true },
    });

    if (!post) {
      return notFound('Post not found');
    }

    if (post.visibility === 'PRIVATE' && post.authorId !== auth.userId) {
      return notFound('Post not found');
    }

    const body = await request.json();
    const validationResult = CreateCommentSchema.safeParse({
      content: body.content,
      postId,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return validationError(errors);
    }

    const { content } = validationResult.data;

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: auth.userId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { commentLikes: true },
        },
      },
    });

    await enqueueSocialEvent('comment.created', {
      postId,
      commentId: comment.id,
      authorId: auth.userId,
    });

    return successResponse(
      {
        ...comment,
        likeCount: comment._count.commentLikes,
        likedByCurrentUser: false,
        likedUsers: [],
        replies: [],
      },
      201,
      'Comment created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
