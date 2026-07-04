'use client';

import { Post, User } from '@/types';
import { EllipsisVertical } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { CommentSection } from './CommentSection';

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute ago`;
  return `${Math.floor(diffMins / 60)} hour ago`;
}

// Helper to extract the very first letter of the name
function getFirstLetter(firstName: string): string {
  return firstName?.charAt(0).toUpperCase() || 'U';
}

interface UnifiedInputBoxProps {
  value: string;
  setValue: (val: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  placeholder: string;
  onSubmit?: () => void;
}

// Unified Input Component (extracted outside to avoid recreation during render)
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

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onDelete?: (postId: string) => void;
  onLike?: (postId: string) => void;
  onCommentCreated?: (postId: string) => void;
  isLiked?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onDelete,
  onLike,
  onCommentCreated,
  isLiked = false,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // State for the main post comment input
  const [commentText, setCommentText] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await onLike?.(post.id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
  
      setCommentText('');
      onCommentCreated?.(post.id);
    }
  };

  const commentCount = post.commentCount ?? post._count?.comments ?? 0;
  const postImage = post.imageUrl || '/assets/images/recommend3.png';

  const primaryLikerName = post.likedUsers?.[0] 
    ? `${post.likedUsers[0].firstName} ${post.likedUsers[0].lastName}`
    : null;

  return (
    <article className="mb-3 sm:mb-4 rounded-[8px] sm:rounded-[12px] bg-white border border-gray-100 shadow-sm overflow-visible">
      {/* Header Profile Row */}
      <div className="px-4 sm:px-[24px] pt-4 sm:pt-[20px]">
        <div className="mb-3 sm:mb-[16px] flex items-start justify-between relative">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Image 
              src={"/assets/images/Avatar.png"} 
              alt={post.author.firstName} 
              width={45} 
              height={45} 
              className="h-[36px] w-[36px] sm:h-[45px] sm:w-[45px] rounded-full object-cover flex-shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] sm:text-[16px] font-semibold leading-tight text-gray-900 truncate">
                {post.author.firstName} {post.author.lastName}
              </h3>
              <p className="mt-0.5 text-[11px] sm:text-[13px] text-gray-400 font-normal truncate">
                {formatDistanceToNow(new Date(post.createdAt))} . {post.privacy || post.visibility || 'Public'}
              </p>
            </div>
          </div>
          
          {/* Menu Dropdown Section */}
          <div className="relative flex-shrink-0 ml-2" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-[20px] sm:text-[22px] font-bold leading-none text-gray-400 hover:text-gray-700 transition-colors p-1"
            >
              <EllipsisVertical />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-30 w-[220px] sm:w-[260px] rounded-[12px] sm:rounded-[16px] border border-gray-100/80 bg-white p-2 sm:p-3 shadow-xl">
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => setShowMenu(false)} className="flex w-full items-center gap-2 sm:gap-3 rounded-[8px] sm:rounded-[10px] p-2 text-left text-[13px] sm:text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50 group">
                    <div className="flex h-[30px] w-[30px] sm:h-[36px] sm:w-[36px] shrink-0 items-center justify-center rounded-full bg-blue-50/70 text-blue-500 transition-colors group-hover:bg-blue-100">
                      <svg className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </div>
                    <span>Save Post</span>
                  </button>
                  <button type="button" onClick={() => setShowMenu(false)} className="flex w-full items-center gap-2 sm:gap-3 rounded-[8px] sm:rounded-[10px] p-2 text-left text-[13px] sm:text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50 group">
                    <div className="flex h-[30px] w-[30px] sm:h-[36px] sm:w-[36px] shrink-0 items-center justify-center rounded-full bg-blue-50/70 text-blue-500 transition-colors group-hover:bg-blue-100">
                      <svg className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                    <span>Turn On Notification</span>
                  </button>
                  <button type="button" onClick={() => setShowMenu(false)} className="flex w-full items-center gap-2 sm:gap-3 rounded-[8px] sm:rounded-[10px] p-2 text-left text-[13px] sm:text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50 group">
                    <div className="flex h-[30px] w-[30px] sm:h-[36px] sm:w-[36px] shrink-0 items-center justify-center rounded-full bg-blue-50/70 text-blue-500 transition-colors group-hover:bg-blue-100">
                      <svg className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span>Hide</span>
                  </button>
                  <button type="button" onClick={() => setShowMenu(false)} className="flex w-full items-center gap-2 sm:gap-3 rounded-[8px] sm:rounded-[10px] p-2 text-left text-[13px] sm:text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50 group">
                    <div className="flex h-[30px] w-[30px] sm:h-[36px] sm:w-[36px] shrink-0 items-center justify-center rounded-full bg-blue-50/70 text-blue-500 transition-colors group-hover:bg-blue-100">
                      <svg className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <span>Edit Post</span>
                  </button>
                  {currentUser?.id === post.authorId && (
                    <button
                      type="button"
                      onClick={() => { setShowMenu(false); onDelete?.(post.id); }}
                      className="flex w-full items-center gap-2 sm:gap-3 rounded-[8px] sm:rounded-[10px] p-2 text-left text-[13px] sm:text-[15px] font-semibold text-red-500 transition-colors hover:bg-red-50 group"
                    >
                      <div className="flex h-[30px] w-[30px] sm:h-[36px] sm:w-[36px] shrink-0 items-center justify-center rounded-full bg-red-50/60 text-red-500 transition-colors">
                        <svg className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-14v4M1 7h22" /></svg>
                      </div>
                      <span>Delete Post</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mb-3 sm:mb-[16px] text-[14px] sm:text-[15px] font-normal leading-relaxed text-gray-800 break-words">
          {post.content || '-Healthy Tracking App'}
        </p>
      </div>

      {/* Main Post Media Image */}
      <div className="relative mx-4 sm:mx-[24px] h-[200px] sm:h-[280px] md:h-[360px] overflow-hidden rounded-[6px] sm:rounded-[8px]">
        <Image 
          src={postImage} 
          alt="Post content" 
          fill 
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 650px" 
          className="object-cover" 
        />
      </div>

      {/* Engagement Stats Section */}
      <div className="mx-4 sm:mx-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 py-2 sm:py-[12px] text-[11px] sm:text-[13px] text-gray-400 font-medium gap-1 sm:gap-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Reaction Stack */}
          <div className="flex -space-x-1.5 overflow-hidden">
            {post.likedUsers && post.likedUsers.length > 0 ? (
              post.likedUsers.slice(0, 3).map((user, i) => {
                const bgColors = ['bg-amber-500', 'bg-blue-500', 'bg-rose-500'];
                return (
                  <div
                    key={i}
                    className={`inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full ring-2 ring-white text-[8px] sm:text-[10px] font-bold text-white uppercase ${bgColors[i % bgColors.length]}`}
                  >
                    {getFirstLetter(user.firstName)}
                  </div>
                );
              })
            ) : (
              <div className="inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full ring-2 ring-white bg-gray-300 text-[8px] sm:text-[10px] font-bold text-white">
                R
              </div>
            )}
          </div>
          
          <span className="text-[11px] sm:text-[13px] text-gray-500 font-normal">
            {primaryLikerName ? (
              <>
                <span className="font-semibold text-gray-700">{primaryLikerName}</span>
                {post.likedUsers!.length > 1 && ` and ${post.likedUsers!.length - 1} others`}
              </>
            ) : (
              "Be the first to react"
            )}
          </span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => setShowComments(!showComments)} className="hover:underline text-[11px] sm:text-[13px]">
            {commentCount} Comment{commentCount !== 1 && 's'}
          </button>
          <button className="hover:underline text-[11px] sm:text-[13px]">122 Share</button>
        </div>
      </div>

      {/* Action Row Grid */}
      <div className="mx-4 sm:mx-[24px] grid grid-cols-3 py-1 sm:py-[6px] text-[12px] sm:text-[14px] font-semibold text-gray-500 gap-1 sm:gap-0">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex h-[36px] sm:h-[42px] items-center justify-center gap-1 sm:gap-2 rounded-[4px] sm:rounded-[6px] transition-colors hover:bg-gray-50 text-[12px] sm:text-[14px] ${isLiked ? 'text-[#168bff] bg-blue-50/50' : ''}`}
        >
          <span className="text-base sm:text-xl">😃</span> 
          <span className="hidden xs:inline">Haha</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex h-[36px] sm:h-[42px] items-center justify-center gap-1 sm:gap-2 rounded-[4px] sm:rounded-[6px] transition-colors hover:bg-gray-50 text-[12px] sm:text-[14px]">
          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span className="hidden xs:inline">Comment</span>
        </button>
        <button className="flex h-[36px] sm:h-[42px] items-center justify-center gap-1 sm:gap-2 rounded-[4px] sm:rounded-[6px] transition-colors hover:bg-gray-50 text-[12px] sm:text-[14px]">
          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.632-2.316a3 3 0 110 5.148l-4.632-2.316A3 3 0 008.684 10.742z" /></svg>
          <span className="hidden xs:inline">Share</span>
        </button>
      </div>

      {/* Main Bottom Comment Area */}
      <div className="border-t border-gray-100 bg-gray-50/50 rounded-b-[8px] sm:rounded-b-[12px] p-3 sm:p-[20px] flex flex-col gap-3 sm:gap-4">
        {/* Render the Shared Component instance with submit handler */}
        <UnifiedInputBox 
          value={commentText}
          setValue={setCommentText}
          isFocused={isCommentFocused}
          setIsFocused={setIsCommentFocused}
          placeholder="Write a comment"
          onSubmit={handleCommentSubmit}
        />

        {showComments && (
          <CommentSection
            postId={post.id}
            currentUser={currentUser}
            onCommentCreated={() => onCommentCreated?.(post.id)}
          />
        )}
      </div>
    </article>
  );
};

PostCard.displayName = 'PostCard';