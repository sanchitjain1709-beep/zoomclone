'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, Phone, LifeBuoy } from 'lucide-react';
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
    <header className="w-full bg-white shadow-xs border-b border-gray-200">
      {/* 1. Top Dark Navy Strip matching Screenshot 165109.png */}
      <div className="bg-[#00053D] text-white text-xs py-1.5 px-6 flex justify-end items-center space-x-6">
        <button className="flex items-center space-x-1 hover:text-blue-300 transition-colors cursor-pointer">
          <Search size={13} />
          <span>Search</span>
        </button>
        <button className="flex items-center space-x-1 hover:text-blue-300 transition-colors cursor-pointer">
          <LifeBuoy size={13} />
          <span>Support</span>
        </button>
        <span className="flex items-center space-x-1 text-gray-300">
          <Phone size={13} />
          <span>0008000503335</span>
        </span>
        <span className="text-gray-300">|</span>
        <button className="hover:text-blue-300 transition-colors cursor-pointer">Contact Sales</button>
        <button className="hover:text-blue-300 transition-colors cursor-pointer">Request a Demo</button>
      </div>

      {/* 2. Main White Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Zoom Logo & Primary Nav Links */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-1 group">
            <span className="text-3xl font-extrabold tracking-tight text-[#0B5CFF] group-hover:opacity-90 transition-opacity">
              zoom
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
            <button className="hover:text-[#0B5CFF] transition-colors cursor-pointer">Products</button>
            <button className="hover:text-[#0B5CFF] transition-colors cursor-pointer">Solutions</button>
            <button className="hover:text-[#0B5CFF] transition-colors cursor-pointer">Resources</button>
            <button className="hover:text-[#0B5CFF] transition-colors cursor-pointer">Plans & Pricing</button>
          </nav>
        </div>

        {/* Right: Meeting Actions & User Avatar */}
        <div className="flex items-center space-x-5 text-sm">
          <button
            onClick={onOpenSchedule}
            className="font-medium text-gray-700 hover:text-[#0B5CFF] transition-colors cursor-pointer"
          >
            Schedule
          </button>
          <button
            onClick={onOpenJoin}
            className="font-medium text-gray-700 hover:text-[#0B5CFF] transition-colors cursor-pointer"
          >
            Join
          </button>

          {/* Host Dropdown */}
          <div className="relative">
            <button
              onClick={() => setHostDropdownOpen(!hostDropdownOpen)}
              className="flex items-center space-x-1 font-medium text-gray-700 hover:text-[#0B5CFF] transition-colors cursor-pointer"
            >
              <span>Host</span>
              <ChevronDown size={14} />
            </button>

            {hostDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setHostDropdownOpen(false);
                    onStartInstant();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] transition-colors cursor-pointer"
                >
                  With Video On
                </button>
                <button
                  onClick={() => {
                    setHostDropdownOpen(false);
                    onStartInstant();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] transition-colors cursor-pointer"
                >
                  With Video Off
                </button>
                <button
                  onClick={() => {
                    setHostDropdownOpen(false);
                    onStartInstant();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] transition-colors cursor-pointer"
                >
                  Screen Share Only
                </button>
              </div>
            )}
          </div>

          <button className="flex items-center space-x-1 font-medium text-gray-700 hover:text-[#0B5CFF] transition-colors cursor-pointer">
            <span>Web App</span>
            <ChevronDown size={14} />
          </button>

          {/* User Profile Avatar with Presence Indicator */}
          <div className="relative flex items-center">
            <div className="w-9 h-9 rounded-full bg-[#5C3E31] text-white flex items-center justify-center font-semibold text-sm shadow-xs border border-white">
              {user?.avatar_initial || 'S'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
