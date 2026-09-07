'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/meeting';
import { Clock, ShieldCheck, ExternalLink } from 'lucide-react';

interface ProfileCardProps {
  user: User | null;
  onManagePlan?: () => void;
  onViewPlanDetails?: () => void;
}

export default function ProfileCard({
  user,
  onManagePlan,
  onViewPlanDetails,
}: ProfileCardProps) {
  const [timeStr, setTimeStr] = useState('');
  const [secondsStr, setSecondsStr] = useState('');
  const [ampmStr, setAmpmStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format 12-hour hours and minutes
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');

      setTimeStr(`${hours}:${minutes}`);
      setSecondsStr(seconds);
      setAmpmStr(ampm);
      setDateStr(
        now.toLocaleDateString([], {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[310px] bg-white rounded-2xl p-6 shadow-xs hover:shadow-md border border-gray-200/80 flex flex-col justify-between transition-all select-none">
      {/* Top: Avatar & User Info & Plan Button */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-3.5 min-w-0">
          {/* Bronze Avatar with Online Status Indicator */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#5C3E31] to-[#7A5242] text-white flex items-center justify-center text-xl font-bold shadow-inner">
              {user?.avatar_initial || 'S'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white shadow-xs" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight truncate">
              {user?.display_name || 'Sanchit Jain'}
            </h2>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-[#0B5CFF] border border-blue-100/80">
                <ShieldCheck size={11} className="mr-1" />
                {user?.plan || 'Workplace Basic'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={
            onManagePlan ||
            (() => alert('Workplace Basic Plan: 40-minute limit per meeting with up to 100 participants.'))
          }
          className="px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-[#0E71EB] rounded-lg text-xs font-semibold transition-all border border-blue-100/80 cursor-pointer shrink-0 shadow-2xs"
        >
          Manage Plan
        </button>
      </div>

      {/* Center: Integrated High-Precision Live Clock Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-slate-50 border border-blue-100/60 flex flex-col justify-between my-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600/80 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Live Local Clock
          </span>
          <span className="text-[10px] font-medium text-gray-400 bg-white/80 px-2 py-0.5 rounded-full border border-gray-200/60">
            Auto-synced
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
            {timeStr || '12:00'}
          </span>
          <span className="text-sm font-semibold text-gray-500 font-mono">
            :{secondsStr || '00'}
          </span>
          <span className="text-xs font-bold text-blue-600 tracking-wider">
            {ampmStr || 'PM'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-blue-100/40">
          <span className="font-medium text-gray-700">{dateStr || 'Loading date...'}</span>
          <span className="text-[11px] text-gray-400">System Time</span>
        </div>
      </div>

      {/* Bottom: Plan details link */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="text-gray-400 text-[11px]">Account ID: {user?.pmi?.replace(/\s+/g, '') || '9480076202'}</span>
        <button
          onClick={
            onViewPlanDetails ||
            (() => alert('Plan Details: Personal Meeting ID, WebRTC HD Conferencing, Unlimited 1-on-1 calls.'))
          }
          className="text-[#0E71EB] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View Plan Details</span>
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}
