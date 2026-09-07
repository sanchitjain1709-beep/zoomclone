'use client';

import React from 'react';
import { User } from '@/types/meeting';

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
  return (
    <div className="min-h-[200px] bg-white rounded-2xl p-6 shadow-xs border border-gray-200/80 flex items-center justify-between transition-all select-none">
      {/* Left: Avatar & User Info */}
      <div className="flex items-center space-x-5">
        {/* Bronze Avatar Circle matching Screenshot 165109.png */}
        <div className="w-16 h-16 rounded-full bg-[#5C3E31] text-white flex items-center justify-center text-2xl font-bold shadow-sm shrink-0 select-none">
          {user?.avatar_initial || 'S'}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {user?.display_name || 'Sanchit Jain'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Plan:{' '}
            <span className="font-semibold text-gray-800">
              {user?.plan || 'Workplace Basic'}
            </span>
          </p>
        </div>
      </div>

      {/* Right: Plan Action Controls matching Screenshot 165109.png */}
      <div className="flex flex-col items-end space-y-2.5 shrink-0">
        <button
          onClick={
            onManagePlan ||
            (() => alert('Workplace Basic Plan: 40-minute limit per meeting with up to 100 participants.'))
          }
          className="px-4 py-2 bg-blue-50/80 hover:bg-blue-100/90 text-[#0E71EB] rounded-xl text-xs font-semibold transition-all border border-blue-100 shadow-2xs cursor-pointer"
        >
          Manage Plan
        </button>
        <button
          onClick={
            onViewPlanDetails ||
            (() => alert('Plan Details: Personal Meeting ID, WebRTC HD Conferencing, Unlimited 1-on-1 calls.'))
          }
          className="text-xs font-medium text-[#0E71EB] hover:underline cursor-pointer transition-colors"
        >
          View Plan Details
        </button>
      </div>
    </div>
  );
}
