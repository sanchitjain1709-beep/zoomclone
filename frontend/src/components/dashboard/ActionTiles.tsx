'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Video, Copy, Check } from 'lucide-react';
import { User } from '@/types/meeting';

interface ActionTilesProps {
  user: User | null;
  onOpenSchedule: () => void;
  onOpenJoin: () => void;
  onStartHost: () => void;
}

export default function ActionTiles({
  user,
  onOpenSchedule,
  onOpenJoin,
  onStartHost,
}: ActionTilesProps) {
  const [copied, setCopied] = useState(false);
  const pmi = user?.pmi || '948 007 6202';

  const handleCopyPMI = () => {
    navigator.clipboard.writeText(pmi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-200">
      {/* 3 Quick Action Buttons matching Screenshot 165109 */}
      <div className="flex justify-around items-center gap-4 mb-6">
        {/* 1. Schedule */}
        <button
          onClick={onOpenSchedule}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-lg group-hover:bg-[#005CE6] transition-all">
            <Calendar size={28} />
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#0E71EB]">
            Schedule
          </span>
        </button>

        {/* 2. Join */}
        <button
          onClick={onOpenJoin}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-lg group-hover:bg-[#005CE6] transition-all">
            <Plus size={32} />
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#0E71EB]">
            Join
          </span>
        </button>

        {/* 3. Host */}
        <button
          onClick={onStartHost}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FF5500] text-white flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-lg group-hover:bg-[#E04B00] transition-all">
            <Video size={30} />
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#FF5500]">
            Host
          </span>
        </button>
      </div>

      {/* Personal Meeting ID (PMI) Container */}
      <div className="border-t border-gray-100 pt-4 flex flex-col items-center">
        <span className="text-xs font-medium text-gray-500">Personal Meeting ID</span>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-base font-bold text-gray-800 tracking-wide font-mono">
            {pmi}
          </span>
          <button
            onClick={handleCopyPMI}
            title="Copy Personal Meeting ID"
            className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
