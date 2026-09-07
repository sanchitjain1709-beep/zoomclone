'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Video, Copy, Check } from 'lucide-react';
import { User } from '@/types/meeting';

interface ActionTilesProps {
  user?: User | null;
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
    <div className="min-h-[200px] bg-white rounded-2xl p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between transition-all select-none">
      {/* Top: 3 Action Squircles matching Screenshot 165109.png */}
      <div className="flex justify-around items-center pt-1">
        {/* 1. Schedule (Blue, Calendar 19) */}
        <button
          onClick={onOpenSchedule}
          className="flex flex-col items-center group cursor-pointer"
          title="Schedule Meeting"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#005CE6] transition-all">
            <div className="relative flex items-center justify-center">
              <Calendar size={24} />
              <span className="absolute top-[7px] text-[9px] font-bold leading-none">19</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#0E71EB] transition-colors">
            Schedule
          </span>
        </button>

        {/* 2. Join (Blue, +) */}
        <button
          onClick={onOpenJoin}
          className="flex flex-col items-center group cursor-pointer"
          title="Join Meeting"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#005CE6] transition-all">
            <Plus size={26} />
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#0E71EB] transition-colors">
            Join
          </span>
        </button>

        {/* 3. Host (Orange, Video Camera) */}
        <button
          onClick={onStartHost}
          className="flex flex-col items-center group cursor-pointer"
          title="Host Meeting"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#FF5500] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#E04B00] transition-all">
            <Video size={24} />
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#FF5500] transition-colors">
            Host
          </span>
        </button>
      </div>

      {/* Bottom: Personal Meeting ID with Copy matching Screenshot 165109.png */}
      <div className="pt-3 border-t border-gray-100 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-semibold text-gray-800 mb-1">
          Personal Meeting ID
        </span>
        <div className="flex items-center space-x-1.5 text-sm font-mono text-gray-600">
          <span>{pmi}</span>
          <button
            onClick={handleCopyPMI}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors cursor-pointer"
            title="Copy PMI"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
