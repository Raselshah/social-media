'use client';

import { User } from '@/types';
import { Bookmark, CirclePlay, Gamepad2, Group, Save, Settings, SquareLibrary, UserPlus } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { EventsWidget } from './EventsWidget';

interface SidebarProps {
  currentUser: User | null;
  onLogout: () => void;
}

const people = [
  { name: 'Steve Jobs', role: 'CEO of Apple', image: '/assets/images/card_ppl2.png' },
  { name: 'Ryan Roslansky', role: 'CEO of Linkedin', image: '/assets/images/card_ppl1.png' },
  { name: 'Dylan Field', role: 'CEO of Figma', image: '/assets/images/card_ppl3.png' },
];

const navItems = [
  { name: 'Learning', icon: <CirclePlay size={20} /> },
  { name: 'Insights', icon: <SquareLibrary size={20} /> },
  { name: 'Find friends', icon: <UserPlus size={20} /> },
  { name: 'Bookmarks', icon: <Bookmark  size={20} /> },
  { name: 'Group', icon:  <Group size={20} /> },
  { name: 'Gaming', icon:  <Gamepad2 size={20} />, badge: 'New' },
  { name: 'Settings', icon: <Settings size={20} /> },
  { name: 'Save post', icon: <Save size={20} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  return (
    <div className="space-y-4">
      <section className="rounded-[6px] bg-white p-6">
        <h2 className="mb-[24px] text-[20px] font-semibold">Explore</h2>
        <nav className="space-y-[20px]">
          {navItems.map((item, index) => (
            <button
              key={item.name}
              onClick={index === navItems.length - 1 ? onLogout : undefined}
              className="flex group  cursor-pointer w-full items-center justify-between text-left text-[16px] font-medium text-[#4e5561]"
            >
              <span className="flex group-hover:text-blue-400 items-center gap-4 text-[#666666] text-[18px] leading-relaxed font-medium ">
                <span className="w-5  text-center  font-light ">{item.icon}</span>
                {item.name}
              </span>
              {(item.badge || item.name === 'Learning') && (
                <span className="rounded-[5px] bg-[#00c875] px-[6px] py-[2px] text-[12px] font-semibold text-white">
                  New
                </span>
              )}
            </button>
          ))}
        </nav>
      </section>

      <section className="rounded-[6px] bg-white p-6">
        <div className="mb-[22px] flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">Suggested People</h2>
          <button className="text-[12px] font-medium cursor-pointer text-[#006eff]">See All</button>
        </div>
        <div className="space-y-[20px]">
          {people.map((person) => (
            <div key={person.name} className="flex items-center gap-4">
              <Image src={person.image} alt={person.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px]  font-semibold mb-[4px]">{person.name}</p>
                <p className="text-[11px] text-[#555]">{person.role}</p>
              </div>
              <button className="h-[33px] border border-[#d8dce3] px-[10px] text-[13px] font-medium text-[#8a91a0]">
                Connect
              </button>
            </div>
          ))}
        </div>
      </section>

      < EventsWidget />
    </div>
  );
};

Sidebar.displayName = 'Sidebar';
