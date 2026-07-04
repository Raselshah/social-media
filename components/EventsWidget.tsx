'use client';

import Image from 'next/image';
import React from 'react';

interface EventItem {
  id: string;
  imageSrc: string;
  day: string;
  month: string;
  title: string;
  attendeesCount: number;
  isGoing: boolean;
}

// Dummy mock data aligned with the provided screenshot visuals
const MOCK_EVENTS: EventItem[] = [
  {
    id: '1',
    imageSrc: '/assets/images/feed_event1.png',
    day: '10',
    month: 'Jul',
    title: 'No more terrorism no more cry',
    attendeesCount: 17,
    isGoing: true,
  },
  {
    id: '2',
    imageSrc: '/assets/images/feed_event1.png',
    day: '10',
    month: 'Jul',
    title: 'No more terrorism no more cry',
    attendeesCount: 17,
    isGoing: true,
  },
];

export const EventsWidget: React.FC = () => {
  return (
    <div className="w-[300px] rounded-[12px] bg-white border border-gray-100 p-6 shadow-sm">
      {/* Widget Header Row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Events</h2>
        <button 
          type="button" 
          className="text-[13px] font-semibold text-[#168bff] hover:underline"
        >
          See all
        </button>
      </div>

      {/* Events Container List */}
      <div className="flex flex-col gap-4">
        {MOCK_EVENTS.map((event) => (
          <div 
            key={event.id} 
            className="rounded-[8px] border border-gray-100 bg-white overflow-hidden shadow-sm"
          >
            {/* Context specified Image Element Config */}
            <div className="relative w-full min-h-[128px] overflow-hidden">
              <Image 
                src={event.imageSrc} 
                alt="Event" 
                width={258} 
                height={128} 
                className="h-auto w-full rounded-[4px] object-cover" 
              />
            </div>

            {/* Event Meta Details Grid Body */}
            <div className="p-3">
              <div className="flex items-start gap-3">
                {/* Green Date Badge Container */}
                <div className="flex flex-col items-center justify-center bg-[#00c875] text-white rounded-[6px] h-[48px] w-[45px] shrink-0 font-sans">
                  <span className="text-[16px] font-bold leading-none">{event.day}</span>
                  <span className="text-[11px] font-medium leading-tight mt-0.5">{event.month}</span>
                </div>

                {/* Event Heading Title Description */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2">
                    {event.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Bottom Counter and Interactive Action Trigger Row */}
            <div className="px-3 pb-3 pt-2 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[13px] text-gray-400 font-medium">
                {event.attendeesCount} People Going
              </span>
              
              <button
                type="button"
                className="px-4 py-1 text-[13px] font-semibold rounded-[4px] border border-[#168bff] text-[#168bff] bg-blue-50/20 hover:bg-blue-50 transition-colors"
              >
                Going
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

EventsWidget.displayName = 'EventsWidget';