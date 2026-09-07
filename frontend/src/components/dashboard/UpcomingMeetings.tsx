'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Copy, Check, Trash2, Video, Key } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { deleteMeeting } from '@/services/api';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
  onRefresh: () => void;
  onOpenSchedule: () => void;
}

export default function UpcomingMeetings({
  meetings,
  onRefresh,
  onOpenSchedule,
}: UpcomingMeetingsProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleStart = (meeting: Meeting) => {
    const cleanCode = meeting.meeting_code.replace(/\s+/g, '');
    router.push(`/room/${cleanCode}?host=true&name=Sanchit%20Jain`);
  };

  const handleCopyInvite = (meeting: Meeting) => {
    const cleanCode = meeting.meeting_code.replace(/\s+/g, '');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const inviteText = `Sanchit Jain is inviting you to a scheduled Zoom meeting.\n\nTopic: ${meeting.title}\nTime: ${
      meeting.scheduled_start ? new Date(meeting.scheduled_start).toLocaleString() : 'Now'
    }\n\nJoin Zoom Meeting:\n${origin}/lobby/${cleanCode}\n\nMeeting ID: ${meeting.meeting_code}\nPasscode: ${
      meeting.passcode || 'None'
    }`;

    navigator.clipboard.writeText(inviteText);
    setCopiedId(meeting.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (meetingId: string) => {
    if (confirm('Are you sure you want to delete this scheduled meeting?')) {
      await deleteMeeting(meetingId);
      onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-200">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Upcoming Meetings</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Synchronized with your Zoom SQLite database
          </p>
        </div>
        <button
          onClick={onOpenSchedule}
          className="text-xs font-semibold text-[#0E71EB] hover:text-[#005CE6] hover:underline cursor-pointer"
        >
          + Schedule New
        </button>
      </div>

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0E71EB] flex items-center justify-center mb-3">
            <Calendar size={28} />
          </div>
          <p className="text-sm font-semibold text-gray-700">No Upcoming Meetings</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            You don't have any scheduled sessions today. Click "Schedule" to create one.
          </p>
          <button
            onClick={onOpenSchedule}
            className="mt-4 px-4 py-2 bg-[#0E71EB] hover:bg-[#005CE6] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Schedule a Meeting
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => {
            const formattedDate = m.scheduled_start
              ? new Date(m.scheduled_start).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Flexible Time';

            return (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xs transition-all bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Meeting Details */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#0E71EB] bg-blue-50 px-2 py-0.5 rounded-md">
                      {formattedDate}
                    </span>
                    <span className="text-xs text-gray-400">({m.duration_minutes} mins)</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900">{m.title}</h4>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 font-mono">
                    <span>Meeting ID: <strong className="text-gray-700">{m.meeting_code}</strong></span>
                    {m.passcode && (
                      <span className="flex items-center space-x-1">
                        <Key size={12} />
                        <span>Passcode: <strong className="text-gray-700">{m.passcode}</strong></span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleCopyInvite(m)}
                    title="Copy full meeting invitation"
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check size={14} className="text-green-600" />
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Invite</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleStart(m)}
                    className="flex items-center space-x-1 px-4 py-1.5 text-xs font-bold text-white bg-[#0E71EB] hover:bg-[#005CE6] rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Video size={14} />
                    <span>Start</span>
                  </button>

                  <button
                    onClick={() => handleDelete(m.id)}
                    title="Delete meeting"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
