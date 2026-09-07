'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Copy, Check, Trash2, Settings2 } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { deleteMeeting } from '@/services/api';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
  onRefresh: () => void;
  onOpenSchedule: () => void;
  onTestAudioVideo?: () => void;
  onViewAllMeetings?: () => void;
}

export default function UpcomingMeetings({
  meetings,
  onRefresh,
  onOpenSchedule,
  onTestAudioVideo,
  onViewAllMeetings,
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
    const inviteText = `Sanchit Jain is inviting you to a scheduled ZoomClone meeting.\n\nTopic: ${meeting.title}\nTime: ${
      meeting.scheduled_start ? new Date(meeting.scheduled_start).toLocaleString() : 'Now'
    }\n\nJoin ZoomClone Meeting:\n${origin}/lobby/${cleanCode}\n\nMeeting ID: ${meeting.meeting_code}\nPasscode: ${
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
    <div className="h-[310px] bg-white rounded-2xl p-6 shadow-xs hover:shadow-md border border-gray-200/80 flex flex-col justify-between transition-all select-none">
      {/* Header matching Screenshot 165109.png */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Meetings</h3>
        <button
          onClick={onViewAllMeetings || onOpenSchedule}
          className="text-xs font-semibold text-[#0E71EB] hover:underline transition-colors cursor-pointer"
        >
          Visit Meetings
        </button>
      </div>

      {/* Content Area with Exact Height Constraint */}
      <div className="flex-1 flex flex-col justify-center py-2 overflow-hidden">
        {meetings.length === 0 ? (
          /* Pristine Empty State with Audio & Video Test matching Screenshot 165109.png */
          <div className="flex flex-col items-center justify-center text-center select-none py-1 space-y-3">
            <div className="w-full max-w-xs bg-[#F7F8FA] border border-gray-200/60 rounded-xl py-3 px-4 text-center">
              <span className="text-sm font-semibold text-gray-800">No Upcoming Meetings</span>
            </div>

            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              No meetings scheduled. Verify your camera and mic setup below.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[165px] pr-1">
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
                  className="py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold text-[#0E71EB] bg-blue-50 px-1.5 py-0.5 rounded">
                        {formattedDate}
                      </span>
                      <span className="text-[10px] text-gray-400">({m.duration_minutes}m)</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 truncate max-w-[190px] mt-0.5">{m.title}</h4>
                    <p className="text-xs text-gray-400 font-mono">
                      ID: {m.meeting_code}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleCopyInvite(m)}
                      title="Copy invite"
                      className="p-1.5 text-gray-500 hover:text-[#0E71EB] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedId === m.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleStart(m)}
                      className="flex items-center space-x-1 px-3 py-1 bg-[#0E71EB] hover:bg-[#005CE6] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <Video size={13} />
                      <span>Start</span>
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      title="Delete meeting"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Symmetrical footer matching Tile 1 & 2: Diagnostic Button */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-center">
        {onTestAudioVideo && (
          <button
            onClick={onTestAudioVideo}
            className="w-full py-1.5 px-4 rounded-xl bg-blue-50/80 hover:bg-blue-100/90 text-[#0B5CFF] text-xs font-semibold transition-all border border-blue-100/80 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Settings2 size={13} />
            <span>Test Audio and Video</span>
          </button>
        )}
      </div>
    </div>
  );
}
