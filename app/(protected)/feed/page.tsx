"use client";

import { Button } from '@/components/Button';
import { CreatePostCard } from '@/components/CreatePostCard';
import { FeedLayout } from '@/components/FeedLayout';
import { PostCard } from '@/components/PostCard';
import { Rightbar } from '@/components/Rightbar';
import { Sidebar } from '@/components/Sidebar';
import { Spinner } from '@/components/Spinner';
import { Stories } from '@/components/Stories';
import { useAuth } from '@/hooks/useAuth';
import { useFeedInfiniteScroll, useFeedPrefetch, usePosts } from '@/hooks/usePosts';
import { ReactionType } from '@/constants/reactions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FeedPage() {
  const router = useRouter();
  const { user, loading: userLoading, logout } = useAuth();
  const {
    posts,
    loading,
    hasMore,
    error,
    fetchPosts,
    createPost,
    deletePost,
    incrementCommentCount,
    loadMore,
    reactToPost,
  } = usePosts();

  const scrollSentinelRef = useFeedInfiniteScroll(loadMore, hasMore, loading);
  useFeedPrefetch(posts.map((p) => p.id));

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const handleCreatePost = async (content: string, privacy: 'PUBLIC' | 'PRIVATE', imageUrl?: string) => {
    await createPost(content, privacy, imageUrl);
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  const handleReactToPost = async (postId: string, type: ReactionType) => {
    try {
      await reactToPost(postId, type);
    } catch (err) {
      console.error('Failed to react to post:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const centerContent = (
    <>
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Stories Section */}
      <Stories currentUserName={user.firstName} />

      {/* Create Post Card */}
      <CreatePostCard currentUser={user} onSubmit={handleCreatePost} />

      {/* Posts List */}
      <div className="space-y-6">
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4 text-sm">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onDelete={handleDeletePost}
                onReact={handleReactToPost}
                onCommentCreated={incrementCommentCount}
              />
            ))}
          </>
        )}

        {/* Load More Button */}
        {hasMore && posts.length > 0 && (
          <div className="flex justify-center py-6">
            <Button
              variant="secondary"
              onClick={loadMore}
              isLoading={loading}
            >
              Load More Posts
            </Button>
          </div>
        )}

        {/* Infinite scroll sentinel (preloads next page before user reaches bottom) */}
        <div ref={scrollSentinelRef} className="h-1" aria-hidden="true" />
      </div>
    </>
  );

  return (

    <FeedLayout
      sidebar={<Sidebar currentUser={user} onLogout={handleLogout} />}
      center={centerContent}
      rightbar={<Rightbar />}
      currentUser={user}
    />
  );
}
