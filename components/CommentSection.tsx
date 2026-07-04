'use client';

import { Comment, Reply, User } from '@/types';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

function formatDistanceToNow(date: Date): string {
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  return `${Math.floor(diffMins / 1440)}d`;
}

interface UnifiedInputBoxProps {
  value: string;
  setValue: (val: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  placeholder: string;
  onSubmit?: () => void;
}

// Unified Input Component
const UnifiedInputBox: React.FC<UnifiedInputBoxProps> = ({
  value,
  setValue,
  isFocused,
  setIsFocused,
  placeholder,
  onSubmit,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit?.();
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full">
      <Image
        src={"/assets/images/profile.png"}
        alt="User Avatar"
        width={36}
        height={36}
        className="h-[28px] w-[28px] sm:h-[36px] sm:w-[36px] rounded-full object-cover flex-shrink-0"
      />
      <div className="relative flex flex-1 items-center rounded-full bg-gray-100/80 px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all">
        <input
          type="text"
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 220)}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full bg-transparent text-[13px] sm:text-[14px] text-gray-700 outline-none placeholder:text-gray-400 pr-[50px] sm:pr-[60px]"
        />
        
        <div className="absolute right-2 sm:right-3 flex items-center gap-1.5 sm:gap-2">
          {isFocused || value.trim().length > 0 ? (
            <button 
              type="button"
              onClick={onSubmit}
              className="text-[12px] sm:text-[14px] font-bold text-[#168bff] hover:text-blue-700 transition-colors bg-transparent px-1"
            >
              Post
            </button>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 cursor-pointer hover:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 cursor-pointer hover:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface CommentSectionProps {
  postId: string;
  currentUser: User | null;
  onCommentCreated?: () => void;
  showCommentInput?: boolean; // New prop to control comment input visibility
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  currentUser,
  onCommentCreated,
  showCommentInput = false, // Default to false
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [replyFocused, setReplyFocused] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/posts/${postId}/comments`);
        setComments(response.data.data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmitComment = async () => {
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, { content });
      setComments((prev) => [response.data.data, ...prev]);
      setContent('');
      onCommentCreated?.();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    const value = replyContent[commentId]?.trim();
    if (!value) return;

    try {
      const response = await axios.post(`/api/comments/${commentId}/replies`, { content: value });
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...(comment.replies || []), response.data.data] }
            : comment
        )
      );
      setReplyContent((prev) => ({ ...prev, [commentId]: '' }));
      setActiveReplyId(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    try {
      const response = await axios.post(`/api/comments/${commentId}/like`);
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, ...response.data.data } : comment
        )
      );
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const handleToggleReplyLike = async (commentId: string, replyId: string) => {
    try {
      const response = await axios.post(`/api/replies/${replyId}/like`);
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: (comment.replies || []).map((reply) =>
                  reply.id === replyId ? { ...reply, ...response.data.data } : reply
                ),
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Error toggling reply like:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;
    try {
      await axios.delete(`/api/replies/${replyId}`);
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: (comment.replies || []).filter((reply) => reply.id !== replyId) }
            : comment
        )
      );
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const toggleReplyInput = (commentId: string) => {
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
    // Reset reply content when toggling
    if (activeReplyId !== commentId) {
      setReplyContent((prev) => ({ ...prev, [commentId]: '' }));
    }
  };

  const renderLikedUsers = (item: Comment | Reply) =>
    item.likedUsers?.length
      ? item.likedUsers.map((user) => `${user.firstName} ${user.lastName}`).join(', ')
      : 'No likes yet';

  return (
    <div className="border-t border-[#eef0f3] bg-[#fbfcfe] px-3 sm:px-[25px] py-3 sm:py-4">
      {/* Comment Input - Only shows when showCommentInput is true */}
      {currentUser && showCommentInput && (
        <div className="mb-3 sm:mb-4">
          <UnifiedInputBox
            value={content}
            setValue={setContent}
            isFocused={isCommentFocused}
            setIsFocused={setIsCommentFocused}
            placeholder="Write a comment..."
            onSubmit={handleSubmitComment}
          />
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <p className="py-4 text-center text-[12px] sm:text-[13px] text-[#7c8491]">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="py-4 text-center text-[12px] sm:text-[13px] text-[#7c8491]">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 sm:gap-3">
              <Image 
                src={ "/assets/images/Avatar.png"} 
                alt={comment.author.firstName} 
                width={34} 
                height={34} 
                className="h-[28px] w-[28px] sm:h-[34px] sm:w-[34px] rounded-full object-cover flex-shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <div className="rounded-[8px] sm:rounded-[10px] bg-white px-3 sm:px-4 py-2 sm:py-3 shadow-[0_1px_0_rgba(20,27,37,0.05)]">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-[13px] sm:text-[14px] font-semibold truncate">
                      {comment.author.firstName} {comment.author.lastName}
                    </h5>
                    {currentUser?.id === comment.authorId && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)} 
                        className="text-[11px] sm:text-[12px] font-semibold text-[#d95050] hover:text-red-700 transition-colors flex-shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] sm:text-[14px] text-[#333] break-words">{comment.content}</p>
                </div>
                <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-[12px] font-semibold text-[#707887]">
                  <button 
                    onClick={() => handleToggleCommentLike(comment.id)} 
                    className={`hover:text-[#168bff] transition-colors ${comment.likedByCurrentUser ? 'text-[#168bff]' : ''}`}
                  >
                    Like
                  </button>
                  <button 
                    onClick={() => toggleReplyInput(comment.id)}
                    className={`hover:text-[#168bff] transition-colors ${activeReplyId === comment.id ? 'text-[#168bff]' : ''}`}
                  >
                    Reply
                  </button>
                  <span className="cursor-default" title={renderLikedUsers(comment)}>
                    {comment.likeCount ?? 0} likes
                  </span>
                  <span className="cursor-default">{formatDistanceToNow(new Date(comment.createdAt))}</span>
                </div>

                {/* Replies Section */}
                {(comment.replies || []).length > 0 && (
                  <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                    {(comment.replies || []).map((reply) => (
                      <div key={reply.id} className="flex gap-2 sm:gap-3">
                        <Image 
                          src={ "/assets/images/card_ppl1.png"} 
                          alt={reply.author.firstName} 
                          width={28} 
                          height={28} 
                          className="h-[22px] w-[22px] sm:h-[28px] sm:w-[28px] rounded-full object-cover flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="rounded-[8px] sm:rounded-[10px] bg-white px-2 sm:px-3 py-1.5 sm:py-2">
                            <div className="flex items-center justify-between gap-2">
                              <h6 className="text-[12px] sm:text-[13px] font-semibold truncate">
                                {reply.author.firstName} {reply.author.lastName}
                              </h6>
                              {currentUser?.id === reply.authorId && (
                                <button 
                                  onClick={() => handleDeleteReply(comment.id, reply.id)} 
                                  className="text-[10px] sm:text-[11px] font-semibold text-[#d95050] hover:text-red-700 transition-colors flex-shrink-0"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p className="mt-0.5 text-[12px] sm:text-[13px] text-[#333] break-words">{reply.content}</p>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-semibold text-[#707887]">
                            <button 
                              onClick={() => handleToggleReplyLike(comment.id, reply.id)} 
                              className={`hover:text-[#168bff] transition-colors ${reply.likedByCurrentUser ? 'text-[#168bff]' : ''}`}
                            >
                              Like
                            </button>
                            <span className="cursor-default" title={renderLikedUsers(reply)}>
                              {reply.likeCount ?? 0} likes
                            </span>
                            <span className="cursor-default">{formatDistanceToNow(new Date(reply.createdAt))}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input - Only shows when Reply button is clicked */}
                {activeReplyId === comment.id && currentUser && (
                  <div className="mt-2 sm:mt-3">
                    <UnifiedInputBox
                      value={replyContent[comment.id] || ''}
                      setValue={(val) => setReplyContent((prev) => ({ ...prev, [comment.id]: val }))}
                      isFocused={replyFocused[comment.id] || false}
                      setIsFocused={(focused) => setReplyFocused((prev) => ({ ...prev, [comment.id]: focused }))}
                      placeholder="Write a reply..."
                      onSubmit={() => handleSubmitReply(comment.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

CommentSection.displayName = 'CommentSection';