'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Video } from 'lucide-react';
import { User } from '@/types/meeting';

interface PortalHeaderProps {
  user: User | null;
  onOpenJoin: () => void;
  onOpenSchedule: () => void;
  onStartInstant: () => void;
}

export default function PortalHeader({
  user,
  onOpenJoin,
  onOpenSchedule,
  onStartInstant,
}: PortalHeaderProps) {
  const [hostDropdownOpen, setHostDropdownOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: ZoomClone Workplace Branding */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0B5CFF] to-[#3B82F6] flex items-center justify-center text-white shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Video size={17} className="fill-white" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black tracking-tight text-[#0B5CFF]">
              zoom<span className="text-[#005CE6] font-black">clone</span>
            </span>
            <span className="text-xs font-semibold text-gray-500 tracking-tight">
              Workplace
            </span>
          </div>
        </Link>

        {/* Right: Functional Action Buttons & Profile Avatar */}
        <div className="flex items-center space-x-4 text-sm">
          <button
            onClick={onOpenSchedule}
            className="px-3.5 py-1.5 font-medium text-gray-700 hover:text-[#0B5CFF] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            Schedule
          </button>
          
          <button
            onClick={onOpenJoin}
            className="px-3.5 py-1.5 font-medium text-gray-700 hover:text-[#0B5CFF] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            Join
          </button>

          {/* Host Instant Meeting Dropdown */}
          <div className="relative">
            <button
              onClick={() => setHostDropdownOpen(!hostDropdownOpen)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 font-semibold text-white bg-[#0E71EB] hover:bg-[#005CE6] rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <Video size={15} />
              <span>Host Meeting</span>
              <ChevronDown size={14} />
            </button>

            {hostDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setHostDropdownOpen(false);
                    onStartInstant();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] transition-colors cursor-pointer"
                >
                  Start With Video On
                </button>
                <button
                  onClick={() => {
                    setHostDropdownOpen(false);
                    onStartInstant();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] transition-colors cursor-pointer"
                >
                  Start With Video Off
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div
            className="relative flex items-center pl-2"
            title={`${user?.display_name || 'Sanchit Jain'} (${user?.plan || 'Workplace Basic'})`}
          >
            <div className="w-9 h-9 rounded-full bg-[#5C3E31] text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white select-none">
              {user?.avatar_initial || 'S'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
