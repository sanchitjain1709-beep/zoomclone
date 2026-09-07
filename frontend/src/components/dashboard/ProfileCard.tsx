'use client';

import React from 'react';
import { User } from '@/types/meeting';

interface ProfileCardProps {
  user: User | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-200 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Bronze Avatar Circle */}
        <div className="w-14 h-14 rounded-full bg-[#5C3E31] text-white flex items-center justify-center text-xl font-bold shadow-inner">
          {user?.avatar_initial || 'S'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {user?.display_name || 'Sanchit Jain'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Plan: <span className="text-gray-800 font-medium">{user?.plan || 'Workplace Basic'}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end space-y-1.5">
        <button className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer">
          Manage Plan
        </button>
        <button className="text-xs text-[#0B5CFF] hover:underline font-medium cursor-pointer">
          View Plan Details
        </button>
      </div>
    </div>
  );
}
