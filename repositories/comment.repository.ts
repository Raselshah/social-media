import { prisma } from '@/lib/prisma';

export const commentRepository = {
  findByPost(postId: string, _userId?: string) {
    return prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        content: true,
        postId: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, updatedAt: true },
        },
        commentLikes: {
          take: 12,
          orderBy: { createdAt: 'desc' },
          select: {
            userId: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        _count: { select: { replies_v2: true, commentLikes: true } },
        replies_v2: {
          orderBy: { createdAt: 'asc' },
          take: 20,
          select: {
            id: true,
            content: true,
            commentId: true,
            authorId: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, updatedAt: true },
            },
            replyLikes: {
              take: 12,
              orderBy: { createdAt: 'desc' },
              select: {
                userId: true,
                user: { select: { id: true, firstName: true, lastName: true } },
              },
            },
            _count: { select: { replyLikes: true } },
          },
        },
      },
    });
  },

  findById(commentId: string) {
    return prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true, authorId: true },
    });
  },

  create(data: { content: string; postId: string; authorId: string }) {
    return prisma.comment.create({
      data,
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, updatedAt: true } },
      },
    });
  },

  update(commentId: string, content: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, updatedAt: true } },
      },
    });
  },

  delete(commentId: string) {
    return prisma.comment.delete({ where: { id: commentId } });
  },

  toggleLike(commentId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.commentLike.findUnique({
        where: { userId_commentId: { userId, commentId } },
      });

      if (existing) {
        await tx.commentLike.delete({ where: { id: existing.id } });
        return { liked: false };
      }

      await tx.commentLike.create({ data: { userId, commentId } });
      return { liked: true };
    });
  },

  getLikes(commentId: string) {
    return prisma.commentLike.findMany({
      where: { commentId },
      select: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  },
};

export const replyRepository = {
  findByComment(commentId: string, userId?: string) {
    return prisma.reply.findMany({
      where: { commentId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        commentId: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, updatedAt: true } },
        _count: { select: { replyLikes: true } },
        ...(userId && {
          replyLikes: { where: { userId }, select: { id: true } },
        }),
      },
    });
  },

  findById(replyId: string) {
    return prisma.reply.findUnique({
      where: { id: replyId },
      select: { id: true, commentId: true, authorId: true, comment: { select: { postId: true } } },
    });
  },

  create(data: { content: string; commentId: string; authorId: string }) {
    return prisma.reply.create({
      data,
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, updatedAt: true } },
      },
    });
  },

  update(replyId: string, content: string) {
    return prisma.reply.update({
      where: { id: replyId },
      data: { content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, updatedAt: true } },
      },
    });
  },

  delete(replyId: string) {
    return prisma.reply.delete({ where: { id: replyId } });
  },

  toggleLike(replyId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.replyLike.findUnique({
        where: { userId_replyId: { userId, replyId } },
      });

      if (existing) {
        await tx.replyLike.delete({ where: { id: existing.id } });
        return { liked: false };
      }

      await tx.replyLike.create({ data: { userId, replyId } });
      return { liked: true };
    });
  },

  getLikes(replyId: string) {
    return prisma.replyLike.findMany({
      where: { replyId },
      select: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  },
};
