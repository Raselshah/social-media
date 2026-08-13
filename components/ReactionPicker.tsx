'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { REACTIONS, REACTION_TYPES, ReactionType } from '@/constants/reactions';

const OPEN_DELAY_MS = 320;
const CLOSE_DELAY_MS = 240;
const LONG_PRESS_MS = 400;

interface ReactionPickerProps {
  /** The reaction the viewer currently has on this entity, if any. */
  current: ReactionType | null;
  /** Fired with the picked reaction — picking the current one again clears it. */
  onPick: (type: ReactionType) => void;
  disabled?: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  current,
  onPick,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [poppingType, setPoppingType] = useState<ReactionType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const didLongPress = useRef(false);

  const clearTimers = useCallback(() => {
    [openTimer, closeTimer, longPressTimer].forEach((timer) => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    });
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const scheduleOpen = () => {
    if (disabled) return;
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    openTimer.current = window.setTimeout(() => setIsOpen(true), OPEN_DELAY_MS);
  };

  const scheduleClose = () => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  };

  const pick = (type: ReactionType) => {
    if (disabled) return;
    setIsOpen(false);
    setPoppingType(type);
    onPick(type);
  };

  const active = current ? REACTIONS[current] : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      {isOpen && (
        <div
          role="menu"
          aria-label="Pick a reaction"
          className="reaction-picker absolute bottom-full left-1/2 z-40 mb-2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gray-100 bg-white px-2 py-1.5 shadow-xl"
        >
          {REACTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              aria-label={REACTIONS[type].label}
              aria-pressed={current === type}
              onClick={() => pick(type)}
              className={`reaction-option group/reaction relative flex h-8 w-8 items-center justify-center rounded-full text-lg transition-transform sm:h-9 sm:w-9 sm:text-xl ${
                current === type ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <span aria-hidden="true">{REACTIONS[type].emoji}</span>
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-900/90 px-2 py-0.5 text-[10px] font-medium text-white group-hover/reaction:block">
                {REACTIONS[type].label}
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          if (didLongPress.current) {
            didLongPress.current = false;
            return;
          }
          pick(current ?? 'LIKE');
        }}
        onFocus={() => !disabled && setIsOpen(true)}
        onTouchStart={() => {
          didLongPress.current = false;
          longPressTimer.current = window.setTimeout(() => {
            didLongPress.current = true;
            setIsOpen(true);
          }, LONG_PRESS_MS);
        }}
        onTouchEnd={() => {
          if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        className={`group relative flex h-[36px] w-full items-center justify-center gap-1 rounded-[4px] text-[12px] font-semibold transition-colors hover:bg-gray-50 disabled:opacity-60 sm:h-[42px] sm:gap-2 sm:rounded-[6px] sm:text-[14px] ${
          active ? `${active.textClass} ${active.bgClass}` : 'text-gray-500'
        }`}
      >
        <span className="relative flex items-center justify-center">
          {poppingType && (
            <span
              aria-hidden="true"
              className="emoji-burst pointer-events-none absolute inset-0 -m-1 rounded-full bg-amber-300"
            />
          )}
          <span
            className={`emoji-animate relative text-base sm:text-xl ${poppingType ? 'is-popping' : ''}`}
            onAnimationEnd={() => setPoppingType(null)}
          >
            {active?.emoji ?? REACTIONS.LIKE.emoji}
          </span>
        </span>
        <span className="hidden xs:inline">{active?.label ?? REACTIONS.LIKE.label}</span>
      </button>
    </div>
  );
};

ReactionPicker.displayName = 'ReactionPicker';
