'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Video, Copy, Check, Sparkles } from 'lucide-react';
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
    <div className="h-[310px] bg-white rounded-2xl p-6 shadow-xs hover:shadow-md border border-gray-200/80 flex flex-col justify-between transition-all select-none">
      {/* Top: Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#0E71EB]" />
          Quick Actions
        </h3>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          HD Ready
        </span>
      </div>

      {/* Center: 3 Action Squircles matching Screenshot 165109.png */}
      <div className="flex justify-around items-center py-2">
        {/* 1. Schedule (Blue, Calendar 19) */}
        <button
          onClick={onOpenSchedule}
          className="flex flex-col items-center group cursor-pointer"
          title="Schedule Meeting"
        >
          <div className="w-15 h-15 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-108 group-hover:bg-[#005CE6] group-hover:shadow-md transition-all">
            <div className="relative flex items-center justify-center">
              <Calendar size={28} />
              <span className="absolute top-[8px] text-[10px] font-bold leading-none">19</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2.5 group-hover:text-[#0E71EB] transition-colors">
            Schedule
          </span>
        </button>

        {/* 2. Join (Blue, +) */}
        <button
          onClick={onOpenJoin}
          className="flex flex-col items-center group cursor-pointer"
          title="Join Meeting"
        >
          <div className="w-15 h-15 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-108 group-hover:bg-[#005CE6] group-hover:shadow-md transition-all">
            <Plus size={30} />
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2.5 group-hover:text-[#0E71EB] transition-colors">
            Join
          </span>
        </button>

        {/* 3. Host (Orange, Video Camera) */}
        <button
          onClick={onStartHost}
          className="flex flex-col items-center group cursor-pointer"
          title="Host Meeting"
        >
          <div className="w-15 h-15 rounded-2xl bg-[#FF5500] text-white flex items-center justify-center shadow-sm shadow-orange-500/20 group-hover:scale-108 group-hover:bg-[#E04B00] group-hover:shadow-md transition-all">
            <Video size={28} />
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2.5 group-hover:text-[#FF5500] transition-colors">
            Host
          </span>
        </button>
      </div>

      {/* Bottom: Personal Meeting ID with Copy matching Screenshot 165109.png */}
      <div className="p-3 bg-gray-50/80 hover:bg-gray-100/60 rounded-xl border border-gray-200/70 flex items-center justify-between transition-colors">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Personal Meeting ID (PMI)
          </span>
          <span className="text-base font-bold font-mono text-gray-800 tracking-wide">
            {pmi}
          </span>
        </div>
        <button
          onClick={handleCopyPMI}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-gray-300/80 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-all cursor-pointer"
          title="Copy PMI"
        >
          {copied ? (
            <>
              <Check size={13} className="text-green-600" />
              <span className="text-green-600 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-gray-500" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
