'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Video, Copy, Check, Trash2, Key, Plus } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { deleteMeeting } from '@/services/api';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
  onRefresh: () => void;
  onOpenSchedule: () => void;
  onTestAudioVideo?: () => void;
}

export default function UpcomingMeetings({
  meetings,
  onRefresh,
  onOpenSchedule,
  onTestAudioVideo,
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
    <div className="min-h-[340px] bg-white rounded-2xl p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Calendar size={17} className="text-gray-400" />
          <h3 className="text-base font-bold text-gray-900">Upcoming Meetings</h3>
        </div>
        <button
          onClick={onOpenSchedule}
          className="flex items-center space-x-1 text-xs font-semibold text-[#0E71EB] hover:text-[#005CE6] transition-colors cursor-pointer"
        >
          <Plus size={13} />
          <span>Schedule</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center py-4">
        {meetings.length === 0 ? (
          /* Pristine Empty State with Audio & Video Test */
          <div className="flex flex-col items-center justify-center text-center select-none py-4 space-y-4">
            <div className="w-full max-w-xs bg-[#F7F8FA] border border-gray-100 rounded-xl py-3 px-4 text-center">
              <span className="text-sm font-semibold text-gray-800">No Upcoming Meetings</span>
            </div>

            <p className="text-xs text-gray-400 max-w-xs">
              No meetings scheduled for today. You can check your camera and microphone setup before your next call.
            </p>

            {onTestAudioVideo && (
              <button
                onClick={onTestAudioVideo}
                className="px-5 py-2 rounded-full bg-[#EBF2FF] hover:bg-[#D8E6FE] text-[#0B5CFF] text-xs font-semibold transition-colors cursor-pointer"
              >
                Test Audio and Video
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[220px]">
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
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-bold text-[#0E71EB] bg-blue-50 px-1.5 py-0.5 rounded">
                        {formattedDate}
                      </span>
                      <span className="text-[11px] text-gray-400">({m.duration_minutes}m)</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{m.title}</h4>
                    <p className="text-xs text-gray-500 font-mono">
                      ID: {m.meeting_code}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleCopyInvite(m)}
                      title="Copy invite"
                      className="p-1.5 text-gray-600 hover:text-[#0E71EB] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedId === m.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleStart(m)}
                      className="flex items-center space-x-1 px-3 py-1 bg-[#0E71EB] hover:bg-[#005CE6] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <Video size={13} />
                      <span>Start</span>
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      title="Delete meeting"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Symmetrical footer padding to align with RecentMeetings */}
      <div className="pt-2 border-t border-gray-50 text-[11px] text-gray-400 text-center">
        {meetings.length === 0 ? 'Ready to Host' : `${meetings.length} scheduled`}
      </div>
    </div>
  );
}
