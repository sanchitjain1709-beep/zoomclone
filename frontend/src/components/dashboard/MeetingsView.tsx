'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Video, Copy, Check, Trash2, Calendar, Lock, Shield, Key } from 'lucide-react';
import { Meeting, User } from '@/types/meeting';
import { deleteMeeting } from '@/services/api';

interface MeetingsViewProps {
  user: User | null;
  upcoming: Meeting[];
  recent: Meeting[];
  onRefresh: () => void;
  onOpenSchedule: () => void;
  onStartInstant: () => void;
}

export default function MeetingsView({
  user,
  upcoming,
  recent,
  onRefresh,
  onOpenSchedule,
  onStartInstant,
}: MeetingsViewProps) {
  const router = useRouter();
  const [subTab, setSubTab] = useState<'upcoming' | 'previous' | 'personal'>('upcoming');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPmi, setCopiedPmi] = useState(false);

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
    <div className="space-y-6">
      {/* Top Header matching Screenshot 165356.png */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <button
          onClick={onOpenSchedule}
          className="flex items-center space-x-2 px-4 py-2 bg-[#0E71EB] hover:bg-[#005CE6] text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>Schedule a Meeting</span>
        </button>
      </div>

      {/* Navigation Sub-tabs matching Screenshot 165356 */}
      <div className="flex items-center space-x-8 border-b border-gray-200 text-sm font-medium">
        <button
          onClick={() => setSubTab('upcoming')}
          className={`pb-3 transition-colors cursor-pointer ${
            subTab === 'upcoming'
              ? 'text-[#0B5CFF] border-b-2 border-[#0B5CFF] font-semibold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setSubTab('previous')}
          className={`pb-3 transition-colors cursor-pointer ${
            subTab === 'previous'
              ? 'text-[#0B5CFF] border-b-2 border-[#0B5CFF] font-semibold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setSubTab('personal')}
          className={`pb-3 transition-colors cursor-pointer ${
            subTab === 'personal'
              ? 'text-[#0B5CFF] border-b-2 border-[#0B5CFF] font-semibold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Personal Room
        </button>
      </div>

      {/* Sub-tab 1: Upcoming */}
      {subTab === 'upcoming' && (
        <>
          {upcoming.length === 0 ? (
            /* Pristine Zoom Empty State matching Screenshot 165356.png */
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-xs space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Welcome to ZoomClone Meetings!</h2>
              <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
                Schedule new and manage existing meetings all in one place. You are currently limited to
                40 minutes per meeting.{' '}
                <a href="#plans" className="text-[#0B5CFF] hover:underline">
                  Upgrade now
                </a>{' '}
                if you need more time.
              </p>
              <div className="flex items-center justify-center pt-2">
                <button
                  onClick={onOpenSchedule}
                  className="px-6 py-2.5 bg-[#0E71EB] hover:bg-[#005CE6] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Schedule a Meeting
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-800">Your Scheduled Meetings</h3>
              <div className="divide-y divide-gray-100">
                {upcoming.map((m) => (
                  <div key={m.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#0E71EB] bg-blue-50 px-2 py-0.5 rounded-md">
                          {m.scheduled_start ? new Date(m.scheduled_start).toLocaleString() : 'Flexible Time'}
                        </span>
                        <span className="text-xs text-gray-400">({m.duration_minutes}m)</span>
                      </div>
                      <h4 className="text-base font-bold text-gray-900">{m.title}</h4>
                      <p className="text-xs text-gray-500 font-mono">
                        Meeting ID: <strong>{m.meeting_code}</strong>
                        {m.passcode && ` • Passcode: ${m.passcode}`}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyInvite(m)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        {copiedId === m.id ? 'Copied' : 'Copy Invitation'}
                      </button>
                      <button
                        onClick={() => handleStart(m)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-[#0E71EB] hover:bg-[#005CE6] rounded-lg cursor-pointer"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sub-tab 2: Previous */}
      {subTab === 'previous' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          {recent.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No previous meetings recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recent.map((m) => (
                <div key={m.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{m.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      {new Date(m.started_at || m.created_at).toLocaleDateString()} • ID: {m.meeting_code}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Completed ({m.duration_minutes}m)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 3: Personal Room */}
      {subTab === 'personal' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Personal Meeting Room</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Your permanent personal meeting space for quick check-ins and ad-hoc collaborations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Personal Meeting ID (PMI)
              </span>
              <p className="text-xl font-bold font-mono text-gray-800">{user?.pmi || '948 007 6202'}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Host Name
              </span>
              <p className="text-lg font-bold text-gray-800">{user?.display_name || 'Sanchit Jain'}</p>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={onStartInstant}
              className="flex items-center space-x-2 px-5 py-2 bg-[#0E71EB] hover:bg-[#005CE6] text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Video size={16} />
              <span>Start Meeting</span>
            </button>
            <button
              onClick={() => {
                const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                const code = (user?.pmi || '9480076202').replace(/\s+/g, '');
                navigator.clipboard.writeText(`${origin}/lobby/${code}`);
                setCopiedPmi(true);
                setTimeout(() => setCopiedPmi(false), 2000);
              }}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {copiedPmi ? 'Copied to Clipboard!' : 'Copy Invitation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
