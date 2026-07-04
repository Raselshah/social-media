'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/services/api/comments.api';
import { postKeys } from '@/constants/query-keys';
import { Comment, Reply } from '@/types';

export function useComments(postId: string, enabled = true) {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: async () => {
      const response = await commentsApi.getByPost(postId);
      return response.data.data;
    },
    enabled,
    staleTime: 30 * 1000,
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) =>
      commentsApi.create(postId, { content }).then((r) => r.data.data),
    onSuccess: (newComment) => {
      queryClient.setQueryData<Comment[]>(postKeys.comments(postId), (old = []) => [
        newComment as Comment,
        ...old,
      ]);
      void queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentsApi.createReply(commentId, { content }).then((r) => r.data.data),
    onSuccess: (reply, { commentId }) => {
      queryClient.setQueryData<Comment[]>(postKeys.comments(postId), (old = []) =>
        old.map((c) =>
          c.id === commentId ? { ...c, replies: [...(c.replies || []), reply as Reply] } : c,
        ),
      );
    },
  });

  const toggleCommentLikeMutation = useMutation({
    mutationFn: (commentId: string) =>
      commentsApi.toggleLike(commentId).then((r) => r.data.data),
    onSuccess: (reaction, commentId) => {
      queryClient.setQueryData<Comment[]>(postKeys.comments(postId), (old = []) =>
        old.map((c) => (c.id === commentId ? { ...c, ...reaction } : c)),
      );
    },
  });

  const toggleReplyLikeMutation = useMutation({
    mutationFn: ({ replyId }: { commentId: string; replyId: string }) =>
      commentsApi.toggleReplyLike(replyId).then((r) => r.data.data),
    onSuccess: (reaction, { commentId, replyId }) => {
      queryClient.setQueryData<Comment[]>(postKeys.comments(postId), (old = []) =>
        old.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: (c.replies || []).map((r) =>
                  r.id === replyId ? { ...r, ...reaction } : r,
                ),
              }
            : c,
        ),
      );
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.delete(commentId),
    onSuccess: (_data, commentId) => {
      queryClient.setQueryData<Comment[]>(postKeys.comments(postId), (old = []) =>
        old.filter((c) => c.id !== commentId),
      );
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: ({ replyId }: { commentId: string; replyId: string }) =>
      commentsApi.deleteReply(replyId),
    onSuccess: (_data, { commentId, replyId }) => {
      queryClient.setQueryData<Comment[]>(postKeys.comments(postId), (old = []) =>
        old.map((c) =>
          c.id === commentId
            ? { ...c, replies: (c.replies || []).filter((r) => r.id !== replyId) }
            : c,
        ),
      );
    },
  });

  return {
    comments,
    loading: isLoading,
    createComment: createCommentMutation.mutateAsync,
    createReply: createReplyMutation.mutateAsync,
    toggleCommentLike: toggleCommentLikeMutation.mutateAsync,
    toggleReplyLike: toggleReplyLikeMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    deleteReply: deleteReplyMutation.mutateAsync,
  };
}
