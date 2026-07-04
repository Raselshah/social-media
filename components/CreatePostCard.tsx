'use client';

import { User } from '@/types';
import Image from 'next/image';
import React, { FormEvent, useState } from 'react';
import { uploadApi } from '@/services/api/upload.api';

interface CreatePostCardProps {
  currentUser: User | null;
  onSubmit: (content: string, privacy: 'PUBLIC' | 'PRIVATE', imageUrl?: string) => Promise<void>;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  currentUser,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content, privacy, imageUrl);
      setContent('');
      setImageUrl(undefined);
      setPrivacy('PUBLIC');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setImageUrl(url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <form onSubmit={handleSubmit} className="mb-3 md:mb-4 rounded-[8px] md:rounded-[12px] bg-white p-3 md:p-[24px] shadow-sm border border-gray-100">
      {/* Top Input Block */}
      <div className="mb-4 md:mb-[24px] flex items-start  gap-3 md:gap-4">
        <Image
          src={ "/assets/images/profile.png"}
          alt={currentUser?.firstName || "User"}
          width={45}
          height={45}
          className="h-[36px] w-[36px] md:h-[45px] md:w-[45px] rounded-full object-cover flex-shrink-0"
        />
        <div className="relative flex flex-1 items-center">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write something ..✎."
            rows={1}
            className="peer w-full resize-none border-0 bg-transparent py-2 pr-8 text-[14px] md:text-[16px] text-gray-600 outline-none placeholder:text-gray-400 focus:placeholder-transparent min-h-[60px] md:min-h-[88px] flex items-center"
          />
        </div>
      </div>

      {/* Upload File Banner Notification */}
      {imageUrl && (
        <div className="mb-3 md:mb-4 flex flex-col md:flex-row items-start md:items-center justify-between rounded-[8px] bg-[#f6f8fb] px-3 md:px-4 py-2 md:py-3 text-[12px] md:text-[13px] text-gray-600 gap-2 md:gap-0">
          <span className="truncate w-full md:w-auto">📎 Attached image: {imageUrl}</span>
          <button 
            type="button" 
            onClick={() => setImageUrl(undefined)} 
            className="font-semibold text-[#168bff] hover:underline text-[12px] md:text-[13px] flex-shrink-0"
          >
            Remove
          </button>
        </div>
      )}

      {/* Bottom Action Bar Layer */}
      <div className="flex  flex-row md:flex-col lg:flex-row items-center justify-between rounded-[8px] bg-[#f4f8fe] p-2 md:p-3 pl-3 md:pl-[20px] gap-3 md:gap-4">
        {/* Action Buttons Container */}
        <div className="flex items-center justify-around md:justify-start gap-2 md:gap-[24px] text-[13px] md:text-[16px] font-medium text-gray-500">
          
          {/* Photo Option */}
          <label className="flex flex-col md:flex-row items-center gap-1 md:gap-2 hover:text-gray-800 transition-colors cursor-pointer py-1 md:py-0">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {/* Text hidden on mobile, visible on tablet+ */}
            <span className="hidden md:inline text-[11px] md:text-[16px]">Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="hidden" 
            />
          </label>

          {/* Video Option */}
          <button type="button" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 hover:text-gray-800 transition-colors py-1 md:py-0">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="hidden md:inline text-[11px] md:text-[16px]">Video</span>
          </button>

          {/* Event Option */}
          <button type="button" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 hover:text-gray-800 transition-colors py-1 md:py-0">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden md:inline text-[11px] md:text-[16px]">Event</span>
          </button>

          {/* Article Option */}
          <button type="button" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 hover:text-gray-800 transition-colors py-1 md:py-0">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden md:inline text-[11px] md:text-[16px]">Article</span>
          </button>
        </div>

        {/* Post Button Wrapper */}
        <button
          type="submit"
          disabled={isSubmitting || isUploading || !content.trim()}
          className="flex h-[38px]  md:h-[44px] items-center justify-center  gap-1.5 md:gap-2 rounded-[6px] md:rounded-[8px] bg-[#2f82f6] px-4 md:px-[24px] text-[14px] md:text-[16px] font-medium text-white shadow-sm transition-all hover:bg-[#1276db]  disabled:cursor-not-allowed w-fit md:w-full lg:w-auto "
        >
          <svg className="h-3.5 w-3.5 md:h-4 md:w-4 rotate-90 transform text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span>
            {isUploading ? 'Uploading...' : isSubmitting ? 'Posting...' : 'Post'}
          </span>
        </button>
      </div>
    </form>
  );
};

CreatePostCard.displayName = 'CreatePostCard';