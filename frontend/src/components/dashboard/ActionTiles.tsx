'use client';

import React from 'react';
import { Calendar, Plus, Video } from 'lucide-react';

interface ActionTilesProps {
  onOpenSchedule: () => void;
  onOpenJoin: () => void;
  onStartHost: () => void;
}

export default function ActionTiles({
  onOpenSchedule,
  onOpenJoin,
  onStartHost,
}: ActionTilesProps) {
  return (
    <div className="h-[190px] bg-white rounded-2xl p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between transition-all select-none">
      {/* Top Header */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
          Quick Actions
        </span>
      </div>

      {/* 3 Symmetrical Quick Action Buttons */}
      <div className="flex justify-around items-center gap-4 my-auto">
        {/* 1. Host / New Meeting (Orange) */}
        <button
          onClick={onStartHost}
          className="flex flex-col items-center group cursor-pointer"
          title="Start Instant Video Meeting"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FF5500] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md group-hover:bg-[#E04B00] transition-all">
            <Video size={26} />
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#FF5500] transition-colors">
            New Meeting
          </span>
        </button>

        {/* 2. Join (+) */}
        <button
          onClick={onOpenJoin}
          className="flex flex-col items-center group cursor-pointer"
          title="Join a Meeting by ID"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md group-hover:bg-[#005CE6] transition-all">
            <Plus size={28} />
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#0E71EB] transition-colors">
            Join
          </span>
        </button>

        {/* 3. Schedule (Calendar 19) */}
        <button
          onClick={onOpenSchedule}
          className="flex flex-col items-center group cursor-pointer"
          title="Schedule an Upcoming Meeting"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md group-hover:bg-[#005CE6] transition-all">
            <div className="relative flex items-center justify-center">
              <Calendar size={26} />
              <span className="absolute top-[8px] text-[10px] font-bold leading-none">19</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#0E71EB] transition-colors">
            Schedule
          </span>
        </button>
      </div>
    </div>
  );
}
