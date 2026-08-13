import { prisma } from '@/lib/prisma';
import { DEFAULT_PAGE_SIZE } from '@/constants/api';
import { ReactionType } from '@/constants/reactions';

const postSelect = {
  id: true,
  content: true,
  imageUrl: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  author: {
    select: { id: true, firstName: true, lastName: true },
  },
  _count: {
    select: { comments: true, postLikes: true },
  },
  postLikes: {
    take: 12,
    orderBy: { createdAt: 'desc' as const },
    select: {
      userId: true,
      type: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  comments: {
    take: 5,
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      content: true,
      createdAt: true,
      authorId: true,
      author: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { commentLikes: true } },
    },
  },
};

export const postRepository = {
  findFeed(params: {
    userId?: string;
    cursor?: string;
    take?: number;
  }) {
    const take = params.take ?? DEFAULT_PAGE_SIZE;
    const { userId, cursor } = params;

    return prisma.post.findMany({
      where: userId
        ? { OR: [{ visibility: 'PUBLIC' }, { authorId: userId }] }
        : { visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        ...postSelect,
        comments: {
          ...postSelect.comments,
          select: {
            ...postSelect.comments.select,
            ...(userId && {
              commentLikes: {
                where: { userId },
                select: { id: true },
              },
            }),
          },
        },
      },
    });
  },

  findById(postId: string) {
    return prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, visibility: true, authorId: true },
    });
  },

  create(data: {
    content: string;
    imageUrl: string | null;
    visibility: string;
    authorId: string;
  }) {
    return prisma.post.create({
      data,
      select: {
        id: true,
        content: true,
        imageUrl: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { comments: true, postLikes: true } },
      },
    });
  },

  update(postId: string, data: { content?: string; visibility?: string; imageUrl?: string | null }) {
    return prisma.post.update({
      where: { id: postId },
      data,
      select: {
        id: true,
        content: true,
        imageUrl: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { comments: true, postLikes: true } },
      },
    });
  },

  delete(postId: string) {
    return prisma.post.delete({ where: { id: postId } });
  },

  /**
   * Picking the reaction already set removes it; picking a different one switches it.
   * Returns the reaction the user ends up with, or null when it was cleared.
   */
  setReaction(postId: string, userId: string, type: ReactionType) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.postLike.findUnique({
        where: { userId_postId: { userId, postId } },
        select: { id: true, type: true },
      });

      if (existing?.type === type) {
        await tx.postLike.delete({ where: { id: existing.id } });
        return { reaction: null as ReactionType | null };
      }

      if (existing) {
        await tx.postLike.update({ where: { id: existing.id }, data: { type } });
        return { reaction: type as ReactionType | null };
      }

      await tx.postLike.create({ data: { userId, postId, type } });
      return { reaction: type as ReactionType | null };
    });
  },

  getLikes(postId: string) {
    return prisma.postLike.findMany({
      where: { postId },
      select: {
        type: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  },

  /** Per-type reaction totals for a page of posts, in a single grouped query. */
  getReactionCounts(postIds: string[]) {
    if (postIds.length === 0) return Promise.resolve([]);
    return prisma.postLike.groupBy({
      by: ['postId', 'type'],
      where: { postId: { in: postIds } },
      _count: { _all: true },
    });
  },

  /** The viewer's own reaction for a page of posts (the sampled postLikes may not include them). */
  getUserReactions(postIds: string[], userId: string) {
    if (postIds.length === 0) return Promise.resolve([]);
    return prisma.postLike.findMany({
      where: { postId: { in: postIds }, userId },
      select: { postId: true, type: true },
    });
  },
};
