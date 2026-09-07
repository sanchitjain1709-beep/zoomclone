'use client';

import React from 'react';
import { History, CheckCircle2, Clock } from 'lucide-react';
import { Meeting } from '@/types/meeting';

interface RecentMeetingsProps {
  meetings: Meeting[];
}

export default function RecentMeetings({ meetings }: RecentMeetingsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-200">
      <div className="flex items-center space-x-2 pb-4 border-b border-gray-100 mb-4">
        <History size={18} className="text-gray-500" />
        <h3 className="text-lg font-bold text-gray-900">Recent Meetings</h3>
      </div>

      {meetings.length === 0 ? (
        <div className="py-6 text-center text-gray-400 text-xs">
          No previous meetings recorded.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
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
                  <div className="flex items-center space-x-3 text-xs text-gray-400 mt-0.5">
                    <span>{formatted}</span>
                    <span>•</span>
                    <span className="font-mono">ID: {m.meeting_code}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={13} className="text-gray-400" />
                  <span>Completed ({m.duration_minutes}m)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
