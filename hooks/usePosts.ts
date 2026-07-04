'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { postsApi } from '@/services/api/posts.api';
import { feedKeys } from '@/constants/query-keys';
import { Post } from '@/types';
import { PostDto, PaginatedFeedDto } from '@/types/dto/post.dto';
import { ApiClientError } from '@/lib/axios/errors';

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function usePosts() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: feedKeys.homeInfinite(),
    queryFn: async ({ pageParam }) => {
      const response = await postsApi.getFeed({ cursor: pageParam });
      return response.data.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.cursor : undefined),
    staleTime: 30 * 1000,
  });

  const posts = useMemo(
    () => deduplicateById(data?.pages.flatMap((page) => page.data) ?? []) as Post[],
    [data],
  );

  const prefetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (posts.length > 0 && hasNextPage) {
      const timer = window.setTimeout(prefetchNextPage, 500);
      return () => window.clearTimeout(timer);
    }
  }, [posts.length, hasNextPage, prefetchNextPage]);

  const createPostMutation = useMutation({
    mutationFn: async (input: { content: string; privacy: 'PUBLIC' | 'PRIVATE'; imageUrl?: string }) => {
      const response = await postsApi.create({
        content: input.content,
        visibility: input.privacy,
        imageUrl: input.imageUrl,
      });
      return response.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.homeInfinite() });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postsApi.delete(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.homeInfinite() });
      const previous = queryClient.getQueryData(feedKeys.homeInfinite());
      queryClient.setQueryData(feedKeys.homeInfinite(), (old: { pages: PaginatedFeedDto<PostDto>[]; pageParams: unknown[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((p) => p.id !== postId),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(feedKeys.homeInfinite(), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.homeInfinite() });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: (postId: string) => postsApi.toggleLike(postId).then((r) => r.data.data),
    onSuccess: (reaction, postId) => {
      queryClient.setQueryData(feedKeys.homeInfinite(), (old: { pages: PaginatedFeedDto<PostDto>[]; pageParams: unknown[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((p) =>
              p.id === postId ? { ...p, ...reaction } : p,
            ),
          })),
        };
      });
    },
  });

  const fetchPosts = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const createPost = useCallback(
    async (content: string, privacy: 'PUBLIC' | 'PRIVATE', imageUrl?: string) =>
      createPostMutation.mutateAsync({ content, privacy, imageUrl }),
    [createPostMutation],
  );

  const deletePost = useCallback(
    async (postId: string) => {
      await deletePostMutation.mutateAsync(postId);
    },
    [deletePostMutation],
  );

  const updatePostReaction = useCallback(
    (postId: string, reaction: Pick<Post, 'likedByCurrentUser' | 'likeCount' | 'likedUsers'>) => {
      queryClient.setQueryData(feedKeys.homeInfinite(), (old: { pages: PaginatedFeedDto<PostDto>[]; pageParams: unknown[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((p) => (p.id === postId ? { ...p, ...reaction } : p)),
          })),
        };
      });
    },
    [queryClient],
  );

  const incrementCommentCount = useCallback(
    (postId: string) => {
      queryClient.setQueryData(feedKeys.homeInfinite(), (old: { pages: PaginatedFeedDto<PostDto>[]; pageParams: unknown[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((p) =>
              p.id === postId
                ? { ...p, commentCount: (p.commentCount ?? 0) + 1 }
                : p,
            ),
          })),
        };
      });
    },
    [queryClient],
  );

  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const likePost = useCallback(
    async (postId: string) => likePostMutation.mutateAsync(postId),
    [likePostMutation],
  );

  return {
    posts,
    loading: isLoading || isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    error: error instanceof ApiClientError ? error.message : error ? 'Failed to fetch posts' : null,
    fetchPosts,
    createPost,
    deletePost,
    updatePostReaction,
    incrementCommentCount,
    loadMore,
    likePost,
    prefetchNextPage,
  };
}

export function useFeedInfiniteScroll(loadMore: () => void, hasMore: boolean, loading: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '400px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  return sentinelRef;
}

export function useFeedPrefetch(postIds: string[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    postIds.slice(0, 5).forEach((postId) => {
      void queryClient.prefetchQuery({
        queryKey: ['posts', postId, 'comments'],
        staleTime: 60 * 1000,
      });
    });
  }, [postIds, queryClient]);
}
