'use client';

import { useCallback, useState } from 'react';
import axios from 'axios';
import { Post, PaginatedResponse } from '@/types';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (newCursor?: string) => {
    try {
      setLoading(true);
      const params = newCursor ? { cursor: newCursor } : {};
      const response = await axios.get<{ success: boolean; data: PaginatedResponse<Post> }>(
        '/api/posts',
        { params }
      );
      const { data: newPosts, cursor: nextCursor, hasMore: more } = response.data.data;

      if (newCursor) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setCursor(nextCursor);
      setHasMore(more);
      setError(null);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to fetch posts'
        : 'Failed to fetch posts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(
    async (content: string, privacy: 'PUBLIC' | 'PRIVATE', imageUrl?: string) => {
      try {
        const response = await axios.post<{ success: boolean; data: Post }>(
          '/api/posts',
          { content, visibility: privacy, imageUrl }
        );
        setPosts((prev) => [response.data.data, ...prev]);
        return response.data.data;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to create post'
          : 'Failed to create post';
        throw new Error(message);
      }
    },
    []
  );

  const deletePost = useCallback(async (postId: string) => {
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to delete post'
        : 'Failed to delete post';
      throw new Error(message);
    }
  }, []);

  const updatePostReaction = useCallback((postId: string, reaction: Pick<Post, 'likedByCurrentUser' | 'likeCount' | 'likedUsers'>) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, ...reaction } : post))
    );
  }, []);

  const incrementCommentCount = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, commentCount: (post.commentCount ?? post._count?.comments ?? 0) + 1 }
          : post
      )
    );
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !cursor) return;
    await fetchPosts(cursor);
  }, [cursor, hasMore, loading, fetchPosts]);

  return {
    posts,
    loading,
    hasMore,
    error,
    fetchPosts,
    createPost,
    deletePost,
    updatePostReaction,
    incrementCommentCount,
    loadMore,
  };
};
