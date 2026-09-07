'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, X, Link2 } from 'lucide-react';

interface MeetingInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  meetingCode: string;
  hostName: string;
  passcode?: string;
}

export default function MeetingInfoPopup({
  isOpen,
  onClose,
  title,
  meetingCode,
  hostName,
  passcode = 'gTfEu4',
}: MeetingInfoPopupProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  if (!isOpen) return null;

  const cleanCode = meetingCode.replace(/\s+/g, '');
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const inviteLink = `${origin}/lobby/${cleanCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyFullInvitation = () => {
    const inviteText = `${hostName} is inviting you to a ZoomClone meeting.\n\nTopic: ${title}\nJoin ZoomClone Meeting:\n${inviteLink}\n\nMeeting ID: ${meetingCode}\nPasscode: ${passcode}`;
    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="absolute top-14 left-6 z-50 w-96 bg-[#1F2228] border border-gray-700/90 rounded-2xl p-5 shadow-2xl text-white text-xs space-y-4 animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700/80 pb-3">
        <div className="flex items-center space-x-2 text-green-400 font-bold">
          <ShieldCheck size={16} />
          <span>Meeting Information</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white cursor-pointer p-1 rounded-md hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Topic */}
        <div>
          <span className="text-gray-400 block text-[11px] font-medium">Topic</span>
          <span className="font-bold text-sm text-gray-100">{title}</span>
        </div>

        {/* Meeting ID & Passcode */}
        <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl border border-gray-800">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Meeting ID</span>
            <span className="font-mono font-bold text-gray-100 text-sm">{meetingCode}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Passcode</span>
            <span className="font-mono font-bold text-gray-100 text-sm">{passcode}</span>
          </div>
        </div>

        {/* Host */}
        <div>
          <span className="text-gray-400 block text-[11px] font-medium">Host</span>
          <span className="font-medium text-gray-200">{hostName}</span>
        </div>

        {/* Single Universal Invite Link */}
        <div>
          <span className="text-gray-400 flex items-center space-x-1.5 text-[11px] mb-1.5 font-medium">
            <Link2 size={13} className="text-blue-400" />
            <span>Invite Link</span>
          </span>
          <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
            <span className="truncate font-mono text-[11px] text-gray-300 mr-2 select-all">
              {inviteLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              {copiedLink ? <Check size={12} className="text-white" /> : <Copy size={12} />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Copy Full Invitation Action */}
        <div className="pt-1">
          <button
            onClick={handleCopyFullInvitation}
            className="w-full py-2 px-3 bg-[#2E323B] hover:bg-[#3B404C] text-gray-200 hover:text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-gray-700/60"
          >
            {copiedInvite ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            <span>{copiedInvite ? 'Invitation Copied to Clipboard!' : 'Copy Full Invitation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
