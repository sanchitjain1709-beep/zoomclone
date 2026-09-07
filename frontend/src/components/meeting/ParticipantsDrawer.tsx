'use client';

import React from 'react';
import { X, Mic, MicOff, Video, VideoOff, MoreHorizontal, UserMinus } from 'lucide-react';
import { MeetingParticipant } from '@/types/meeting';

interface ParticipantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  localName: string;
  isLocalHost: boolean;
  isLocalMuted: boolean;
  isLocalVideoOff: boolean;
  participants: MeetingParticipant[];
  onMuteAll: () => void;
  onKickParticipant: (peerId: string) => void;
  onOpenInvite: () => void;
}

export default function ParticipantsDrawer({
  isOpen,
  onClose,
  localName,
  isLocalHost,
  isLocalMuted,
  isLocalVideoOff,
  participants,
  onMuteAll,
  onKickParticipant,
  onOpenInvite,
}: ParticipantsDrawerProps) {
  if (!isOpen) return null;

  const totalCount = 1 + participants.length;

  return (
    <aside className="w-80 h-full bg-[#181A20] border-l border-gray-800 text-white flex flex-col justify-between shrink-0 z-20 animate-in slide-in-from-right duration-200">
      {/* Header matching Screenshot 165550.png */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-bold">Participants ({totalCount})</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Roster List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        {/* Local User */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-[#5C3E31] text-white flex items-center justify-center font-bold text-xs">
              {localName ? localName[0].toUpperCase() : 'S'}
            </div>
            <div>
              <span className="font-semibold text-gray-200">{localName}</span>
              <span className="text-gray-400 ml-1">({isLocalHost ? 'Host, ' : ''}me)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            {isLocalMuted ? <MicOff size={14} className="text-red-500" /> : <Mic size={14} />}
            {isLocalVideoOff ? <VideoOff size={14} className="text-red-500" /> : <Video size={14} />}
          </div>
        </div>

        {/* Remote Participants */}
        {participants.map((p) => (
          <div
            key={p.peer_id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {p.name ? p.name[0].toUpperCase() : 'P'}
              </div>
              <div>
                <span className="font-semibold text-gray-200">{p.name}</span>
                {p.role === 'HOST' && <span className="text-blue-400 ml-1">(Host)</span>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {p.is_muted ? <MicOff size={14} className="text-red-500" /> : <Mic size={14} />}
              {p.is_video_off ? <VideoOff size={14} className="text-red-500" /> : <Video size={14} />}

              {/* Host kick action */}
              {isLocalHost && (
                <button
                  onClick={() => onKickParticipant(p.peer_id)}
                  title="Remove participant"
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-1 rounded-sm transition-all cursor-pointer"
                >
                  <UserMinus size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Buttons matching Screenshot 165550.png */}
      <div className="p-3 border-t border-gray-800 flex items-center justify-between gap-2">
        <button
          onClick={onOpenInvite}
          className="flex-1 py-1.5 bg-[#2E323B] hover:bg-[#3D424E] text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
        >
          Invite
        </button>
        {isLocalHost && (
          <button
            onClick={onMuteAll}
            className="flex-1 py-1.5 bg-[#2E323B] hover:bg-[#3D424E] text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
          >
            Mute all
          </button>
        )}
      </div>
    </aside>
  );
}
