'use client';

import { User } from '@/types';
import axios from 'axios';
import { Bell, ChevronDown, House, LogOut, Menu, MessageCircleMore, Search, Settings, User as UserIcon, Users, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

interface FeedLayoutProps {
  sidebar: React.ReactNode;
  center: React.ReactNode;
  rightbar: React.ReactNode;
  currentUser?: User | null;
  onLogout?: () => void;
}

const HeaderIcon = ({
  children,
  active = false,
  badge,
  label,
}: {
  children: React.ReactNode;
  active?: boolean;
  badge?: string;
  label?: string;
}) => (
  <button
    className={`relative flex flex-col items-center justify-center transition-colors hover:text-[#168bff] h-[70px] ${
      active ? 'text-[#168bff]' : 'text-gray-600'
    }`}
  >
    <span className="text-[23px] leading-none">{children}</span>
    {badge && (
      <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#168bff] px-1 text-[10px] font-semibold text-white">
        {badge}
      </span>
    )}
    {label && (
      <span className="mt-1 text-[10px] font-medium">{label}</span>
    )}
    {/* Active border bottom */}
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#168bff] rounded-t-full" />
    )}
  </button>
);

export const FeedLayout: React.FC<FeedLayoutProps> = ({
  sidebar,
  center,
  rightbar,
  currentUser,
  onLogout,
}) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsLoggingOut(true);

    try {
      // Call logout API
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true, // Include cookies in request
      });

      // Clear all cookies
      document.cookie.split(';').forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, `=; expires=${new Date(0).toUTCString()}; path=/`);
      });

      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();

      // Call parent logout handler if provided
      if (onLogout) {
        await onLogout();
      }

      // Redirect to login page
      router.push('/login');
      router.refresh(); // Refresh to clear any server-side state
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, still redirect to login
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (path: string) => {
    // Navigate to different pages
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#eef1f5] text-[#050505]">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 h-[72px] bg-white shadow-[0_1px_0_rgba(21,27,38,0.04)]">
        <div className="container mx-auto flex h-full w-full items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/assets/images/logo.svg"
              alt="BuddyScript"
              width={137}
              height={27}
              priority
              className="h-auto w-[100px] md:w-[137px]"
            />
          </div>

          {/* Search Bar - Desktop */}
          <label className="hidden md:flex h-[40px] w-[425px] max-w-[35vw] items-center gap-3 rounded-full bg-[#f4f4f4] px-4 text-[#a6abb5] border border-transparent transition-all hover:border-blue-500 focus-within:border-blue-500 focus-within:bg-white">
            <Search size={17} />
            <input
              type="search"
              placeholder="input search text"
              className="w-full bg-transparent text-[16px] font-light outline-none placeholder:text-[#a6abb5] focus:placeholder-transparent"
            />
          </label>

          {/* Search Bar - Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-[26px]">
            <nav className="flex items-center gap-[14px]">
              {/* Home - Always Active */}
              <button 
                onClick={() => handleNavigation('/feed')}
                className="relative flex items-center justify-center h-[70px] transition-colors hover:text-[#168bff] text-[#168bff]"
              >
                <span className="text-[23px] leading-none"><House /></span>
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#168bff] rounded-t-full" />
              </button>
              
              <button 
                onClick={() => handleNavigation('/friends')}
                className="relative flex items-center justify-center h-[70px] transition-colors hover:text-[#168bff] text-gray-600"
              >
                <span className="text-[23px] leading-none"><Users /></span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/notifications')}
                className="relative flex items-center justify-center h-[70px] transition-colors hover:text-[#168bff] text-gray-600"
              >
                <span className="text-[23px] leading-none relative">
                  <Bell />
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#168bff] px-1 text-[10px] font-semibold text-white">
                    6
                  </span>
                </span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/messages')}
                className="relative flex items-center justify-center h-[70px] transition-colors hover:text-[#168bff] text-gray-600"
              >
                <span className="text-[23px] leading-none relative">
                  <MessageCircleMore />
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#168bff] px-1 text-[10px] font-semibold text-white">
                    2
                  </span>
                </span>
              </button>
            </nav>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 text-[16px] font-medium hover:bg-gray-50 rounded-full px-2 py-1 transition-colors"
              >
                <Image
                  src={ "/assets/images/profile.png"}
                  alt={currentUser?.firstName || 'Profile'}
                  width={25}
                  height={25}
                  className="h-[25px] w-[25px] rounded-full object-cover"
                />
                <span className="hidden lg:inline">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Dylan Field'}
                </span>
                <ChevronDown 
                  size={12} 
                  className={`transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-[280px] rounded-[12px] bg-white shadow-lg border border-gray-100 overflow-hidden">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Image
                        src={ "/assets/images/profile.png"}
                        alt={currentUser?.firstName || 'Profile'}
                        width={40}
                        height={40}
                        className="h-[40px] w-[40px] rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[14px] truncate">
                          {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Dylan Field'}
                        </p>
                        <p className="text-[12px] text-gray-500 truncate">
                          {currentUser?.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleNavigation('/profile');
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <UserIcon size={18} className="text-gray-500" />
                      <span>View Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleNavigation('/settings');
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={18} className="text-gray-500" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut size={18} className="text-red-500" />
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Expanded */}
        {isSearchOpen && (
          <div className="md:hidden px-4 pb-3 bg-white border-t border-gray-100">
            <label className="flex h-[40px] w-full items-center gap-3 rounded-full bg-[#f4f4f4] px-4 text-[#a6abb5] border border-transparent transition-all focus-within:border-blue-500 focus-within:bg-white">
              <Search size={17} />
              <input
                type="search"
                placeholder="input search text"
                className="w-full bg-transparent text-[16px] font-light outline-none placeholder:text-[#a6abb5] focus:placeholder-transparent"
                autoFocus
              />
            </label>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            {/* Mobile User Profile */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <Image
                src={ "/assets/images/profile.png"}
                alt={currentUser?.firstName || 'Profile'}
                width={40}
                height={40}
                className="h-[40px] w-[40px] rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Dylan Field'}
                </p>
                <p className="text-sm text-gray-500">View Profile</p>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleNavigation('/feed');
                }}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-[#168bff]"
              >
                <House size={20} className="text-[#168bff]" />
                <span className="font-medium">Home</span>
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleNavigation('/friends');
                }}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users size={20} />
                <span className="font-medium">Friends</span>
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleNavigation('/notifications');
                }}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Bell size={20} />
                <span className="font-medium">Notifications</span>
                <span className="ml-auto bg-[#168bff] text-white text-xs px-2 py-1 rounded-full">6</span>
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleNavigation('/messages');
                }}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircleMore size={20} />
                <span className="font-medium">Messages</span>
                <span className="ml-auto bg-[#168bff] text-white text-xs px-2 py-1 rounded-full">2</span>
              </button>
              
              {/* Mobile Logout */}
              <div className="border-t border-gray-100 mt-4 pt-4">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut size={20} className="text-red-500" />
                  <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content - Independent Scrolling Sections with Hidden Scrollbars */}
      <main className="grid grid-cols-1 md:grid-cols-[306px_minmax(520px,637px)_306px] justify-center gap-6 px-4 md:px-[30px] pt-[92px] pb-[80px] md:pb-8">
        {/* Left Sidebar - Fixed Position with Independent Scroll */}
        <aside className="hidden md:block sticky top-[92px] h-[calc(100vh-92px-2rem)] overflow-y-auto">
          <div className="h-full">
            {sidebar}
          </div>
        </aside>

        {/* Center Content - Independent Scroll */}
        <section className="min-w-0 h-[calc(100vh-92px-2rem)] overflow-y-auto pb-4">
          <div className="h-full">
            {center}
          </div>
        </section>

        {/* Right Sidebar - Fixed Position with Independent Scroll */}
        <aside className="hidden xl:block sticky top-[92px] h-[calc(100vh-92px-2rem)] overflow-y-auto">
          <div className="h-full">
            {rightbar}
          </div>
        </aside>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around h-[64px] px-4">
          <HeaderIcon active label="Home">
            <House size={22} />
          </HeaderIcon>
          <HeaderIcon label="Friends">
            <Users size={22} />
          </HeaderIcon>
          <HeaderIcon badge="6" label="Alerts">
            <Bell size={22} />
          </HeaderIcon>
          <HeaderIcon badge="2" label="Chat">
            <MessageCircleMore size={22} />
          </HeaderIcon>
        </div>
      </nav>
    </div>
  );
};

FeedLayout.displayName = 'FeedLayout';