'use client';

import Image from 'next/image';
import React, { useState } from 'react';

interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  status: 'online' | 'offline';
}

interface RightbarProps {
  friends?: Friend[];
}

const friendsList = [
  { name: 'Steve Jobs', role: 'CEO of Apple', image: '/assets/images/card_ppl2.png', time: '5 minute ago' },
  { name: 'Ryan Roslansky', role: 'CEO of Linkedin', image: '/assets/images/card_ppl1.png', online: true },
  { name: 'Dylan Field', role: 'CEO of Figma', image: '/assets/images/card_ppl3.png', online: true },
  { name: 'Steve Jobs', role: 'CEO of Apple', image: '/assets/images/card_ppl2.png', time: '5 minute ago' },
  { name: 'Ryan Roslansky', role: 'CEO of Linkedin', image: '/assets/images/card_ppl1.png', online: true },
  { name: 'Dylan Field', role: 'CEO of Figma', image: '/assets/images/card_ppl3.png' },
];

export const Rightbar: React.FC<RightbarProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-4">
      <section className="rounded-[6px] bg-white px-6 py-[25px]">
        <div className="mb-[30px] flex items-center justify-between border-b border-[#f0f0f0] pb-[25px]">
          <h2 className="text-[22px] font-semibold">You Might Like</h2>
          <button className="text-[12px] font-medium text-[#006eff]">See All</button>
        </div>
        <div className="mb-[25px] flex items-center gap-5">
          <Image src="/assets/images/card_ppl1.png" alt="Radovan SkillArena" width={50} height={50} className="h-[50px] w-[50px] rounded-full object-cover" />
          <div>
            <p className="text-[16px] font-semibold">Radovan SkillArena</p>
            <p className="text-[12px] text-[#606875]">Founder & CEO at Trophy</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="h-[41px] rounded-[4px] border border-[#eceff4] text-[14px] font-semibold text-[#9aa1af]">
            Ignore
          </button>
          <button className="h-[41px] rounded-[4px] bg-[#2f82f6] text-[14px] font-semibold text-white">
            Follow
          </button>
        </div>
      </section>

      <section className="rounded-[6px] bg-white px-6 py-[25px]">
        <div className="mb-[28px] flex items-center justify-between">
          <h2 className="text-[22px] font-semibold">Your Friends</h2>
          <button className="text-[12px] font-medium text-[#006eff]">See All</button>
        </div>
        <label className="mb-[28px] flex h-[40px] items-center gap-3 rounded-full bg-[#f4f4f4] px-4 text-[#9ea4ad]">
          <span className="text-[20px]">⌕</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="input search text"
            className="w-full bg-transparent text-[16px] font-light outline-none placeholder:text-[#a6abb5]"
          />
        </label>

        <div className="space-y-[27px]">
          {friendsList
            .filter((friend) => friend.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((friend, index) => (
              <div key={`${friend.name}-${index}`} className="flex items-center gap-[14px]">
                <Image src={friend.image} alt={friend.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">{friend.name}</p>
                  <p className="text-[11px] text-[#555]">{friend.role}</p>
                </div>
                {friend.online ? (
                  <span className="h-[10px] w-[10px] rounded-full bg-[#00c875]" />
                ) : (
                  <span className="text-[11px] text-[#8e96a3]">{friend.time}</span>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

Rightbar.displayName = 'Rightbar';
