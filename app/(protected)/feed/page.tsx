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
import { usePosts } from '@/hooks/usePosts';
import axios from 'axios';
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
    updatePostReaction,
    incrementCommentCount,
    loadMore,
  } = usePosts();

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Fetch posts on mount
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

  const handleLikePost = async (postId: string) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`);
      updatePostReaction(postId, response.data.data);
    } catch (err) {
      console.error('Failed to like/unlike post:', err);
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
                onLike={handleLikePost}
                isLiked={Boolean(post.likedByCurrentUser)}
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
