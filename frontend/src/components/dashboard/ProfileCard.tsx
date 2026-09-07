'use client';

import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, Mail } from 'lucide-react';
import { User } from '@/types/meeting';

interface ProfileCardProps {
  user: User | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const pmi = user?.pmi || '948 007 6202';

  const handleCopyPMI = () => {
    navigator.clipboard.writeText(pmi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[190px] bg-white rounded-2xl p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between transition-all">
      {/* Top: Avatar & User Info */}
      <div className="flex items-center space-x-4">
        {/* Bronze Avatar Circle */}
        <div className="w-14 h-14 rounded-full bg-[#5C3E31] text-white flex items-center justify-center text-xl font-bold shadow-inner shrink-0 select-none">
          {user?.avatar_initial || 'S'}
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {user?.display_name || 'Sanchit Jain'}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0B5CFF] border border-blue-100">
              <ShieldCheck size={11} className="mr-1" />
              {user?.plan || 'Workplace Basic'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1 truncate">
            <Mail size={12} className="text-gray-400 shrink-0" />
            <span>{user?.email || 'sanchit.jain@zoomclone.app'}</span>
          </p>
        </div>
      </div>

      {/* Bottom: Personal Meeting ID with Copy */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            Personal Meeting ID (PMI)
          </span>
          <span className="text-base font-bold font-mono text-gray-800 tracking-wide">
            {pmi}
          </span>
        </div>
        <button
          onClick={handleCopyPMI}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
          title="Copy PMI"
        >
          {copied ? (
            <>
              <Check size={13} className="text-green-600" />
              <span className="text-green-600">Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-gray-500" />
              <span>Copy PMI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
