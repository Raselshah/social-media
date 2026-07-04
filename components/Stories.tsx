'use client';

import { MoveRight } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';

interface StoryItem {
  id: string;
  author: {
    firstName: string;
    lastName: string;
    id: string;
  };
  isUserStory?: boolean;
}

interface StoriesProps {
  currentUserName: string;
  stories?: StoryItem[];
}

const defaultStories = [
  { id: 'user-story', name: 'Your Story', image: '/assets/images/mobile_story_img.png', avatar: '/assets/images/profile.png', self: true },
  { id: '1', name: 'Ryan Roslansky', image: '/assets/images/mobile_story_img1.png', avatar: '/assets/images/card_ppl1.png' },
  { id: '2', name: 'Ryan Roslansky', image: '/assets/images/mobile_story_img2.png', avatar: '/assets/images/card_ppl2.png' },
  { id: '3', name: 'Ryan Roslansky', image: '/assets/images/slider4.png', avatar: '/assets/images/card_ppl3.png' },
  { id: '4', name: 'Ryan Roslansky', image: '/assets/images/mobile_story_img1.png', avatar: '/assets/images/card_ppl1.png' },
  { id: '5', name: 'Ryan Roslansky', image: '/assets/images/mobile_story_img2.png', avatar: '/assets/images/card_ppl2.png' },
];

export const Stories: React.FC<StoriesProps> = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-3 sm:mb-4">
      {/* Scroll Left Button - Mobile */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Stories Container - Horizontal Scroll */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2 sm:pb-4 px-0.5"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {defaultStories.map((story, index) => {
          const isLastCard = index === defaultStories.length - 1;

          return (
            <article
              key={story.id}
              className="group relative shrink-0 overflow-hidden rounded-[6px] sm:rounded-[8px] md:rounded-[10px] bg-[#12243b] cursor-pointer transition-transform hover:scale-[1.01] active:scale-[99%]"
              style={{
                width: 'clamp(80px, 20vw, 141px)',
                height: 'clamp(120px, 25vw, 155px)',
              }}
            >
              {/* Base background image */}
              <Image 
                src={story.image} 
                alt={story.name} 
                fill 
                sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 141px" 
                className="object-cover" 
              />
              
              {/* Dark Layer Overlay */}
              <div className={`absolute inset-0 transition-colors duration-300 ${
                story.self ? 'bg-black/25' : 'bg-black/40 group-hover:bg-black/60'
              }`} />
              
              {story.self ? (
                <div className="absolute bottom-0 left-0 right-0 flex h-[50%] flex-col items-center justify-end rounded-t-[16px] sm:rounded-t-[22px] bg-[#10233b] pb-2 sm:pb-[11px]">
                  <button className="absolute -top-[12px] sm:-top-[15px] flex h-[24px] w-[24px] sm:h-[30px] sm:w-[30px] items-center justify-center rounded-full bg-[#168bff] text-[18px] sm:text-[22px] leading-none text-white transition-transform group-hover:scale-110 shadow-md">
                    +
                  </button>
                  <span className="text-[11px] sm:text-[13px] font-semibold text-white">Your Story</span>
                </div>
              ) : (
                <>
                  <Image
                    src={story.avatar}
                    alt={story.name}
                    width={30}
                    height={30}
                    className="absolute left-[8px] sm:left-[10px] top-[10px] sm:top-[12px] h-[24px] w-[24px] sm:h-[30px] sm:w-[30px] rounded-full border-2 border-[#168bff] object-cover"
                  />
                  <p className="absolute bottom-[10px] sm:bottom-[12px] left-0 right-0 px-2 sm:px-3 text-[11px] sm:text-[13px] font-semibold text-white line-clamp-2 leading-tight">
                    {story.name}
                  </p>
                </>
              )}

              {/* Arrow Key Button - Only on last card */}
              {isLastCard && (
                <button className="absolute right-[-8px] sm:right-[-6px] top-1/2 -translate-y-1/2 z-10 flex h-[20px] w-[20px] sm:h-[24px] sm:w-[24px] items-center justify-center rounded-full bg-[#168bff] text-white shadow-lg border-2 border-white transition-transform group-hover:scale-110">
                  <MoveRight size={14} className="sm:w-[16px] sm:h-[16px]" />
                </button>
              )}
            </article>
          );
        })}
      </div>

      {/* Scroll Right Button - Mobile */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

Stories.displayName = 'Stories';