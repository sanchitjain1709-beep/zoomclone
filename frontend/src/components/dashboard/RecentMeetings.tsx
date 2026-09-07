'use client';

import React from 'react';
import { CheckCircle2, History } from 'lucide-react';
import { Meeting } from '@/types/meeting';

interface RecentMeetingsProps {
  meetings: Meeting[];
}

export default function RecentMeetings({ meetings }: RecentMeetingsProps) {
  return (
    <div className="min-h-[340px] bg-white rounded-2xl p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between transition-all">
      {/* Header matching Screenshot 165109.png */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">Recent activity</h3>
        <span className="text-xs font-medium text-gray-400">
          {meetings.length} {meetings.length === 1 ? 'session' : 'sessions'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center py-4">
        {meetings.length === 0 ? (
          /* Pristine Empty State with Zoom Open Box Illustration */
          <div className="flex flex-col items-center justify-center text-center select-none py-4">
            <svg
              width="120"
              height="90"
              viewBox="0 0 120 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-xs"
            >
              {/* Soft ground shadow */}
              <ellipse cx="60" cy="80" rx="42" ry="7" fill="#E2E8F0" />
              {/* Left face */}
              <polygon points="60,48 24,32 24,62 60,78" fill="#1D68EB" />
              {/* Right face */}
              <polygon points="60,48 96,32 96,62 60,78" fill="#0E4EB5" />
              {/* Inside cavity */}
              <polygon points="60,48 24,32 60,18 96,32" fill="#09388A" />
              {/* Flaps */}
              <polygon points="24,32 60,48 50,28 14,14" fill="#60A5FA" />
              <polygon points="96,32 60,48 70,28 106,14" fill="#3B82F6" />
              <polygon points="60,48 24,32 32,50 60,60" fill="#2563EB" />
              <polygon points="60,48 96,32 88,50 60,60" fill="#1D4ED8" />
            </svg>
            <p className="text-sm font-semibold text-gray-800 mt-4">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Meetings you host or participate in will automatically record their session details here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[220px]">
            {meetings.map((m) => {
              const dateStr = m.started_at || m.created_at;
              const formatted = new Date(dateStr).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{m.title}</h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5 font-mono">
                      <span>{formatted}</span>
                      <span>•</span>
                      <span>ID: {m.meeting_code}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} className="text-gray-400" />
                    <span>Completed ({m.duration_minutes}m)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Symmetrical footer padding to align with UpcomingMeetings */}
      <div className="pt-2 border-t border-gray-50 text-[11px] text-gray-400 text-center">
        Synchronized with ZoomClone Engine
      </div>
    </div>
  );
}
