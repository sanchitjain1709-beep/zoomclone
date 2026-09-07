'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, X, Laptop, Smartphone, Info } from 'lucide-react';

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
  const [copiedLocal, setCopiedLocal] = useState(false);
  const [copiedNetwork, setCopiedNetwork] = useState(false);

  if (!isOpen) return null;

  const cleanCode = meetingCode.replace(/\s+/g, '');
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const localInviteLink = `${origin}/lobby/${cleanCode}`;
  // User's active network IP (Wi-Fi adapter)
  const networkInviteLink = `http://10.12.124.101:3000/lobby/${cleanCode}`;

  const handleCopyLocal = () => {
    navigator.clipboard.writeText(localInviteLink);
    setCopiedLocal(true);
    setTimeout(() => setCopiedLocal(false), 2000);
  };

  const handleCopyNetwork = () => {
    navigator.clipboard.writeText(networkInviteLink);
    setCopiedNetwork(true);
    setTimeout(() => setCopiedNetwork(false), 2000);
  };

  return (
    <div className="absolute top-14 left-6 z-50 w-96 bg-[#1F2228] border border-gray-700 rounded-2xl p-5 shadow-2xl text-white text-xs space-y-4 animate-in fade-in zoom-in-95">
      <div className="flex items-center justify-between border-b border-gray-700/80 pb-3">
        <div className="flex items-center space-x-2 text-green-400 font-bold">
          <ShieldCheck size={16} />
          <span>Meeting Information</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2.5">
        <div>
          <span className="text-gray-400 block text-[11px]">Topic</span>
          <span className="font-bold text-sm text-gray-100">{title}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-400 block text-[11px]">Meeting ID</span>
            <span className="font-mono font-bold text-gray-200">{meetingCode}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Passcode</span>
            <span className="font-mono font-bold text-gray-200">{passcode}</span>
          </div>
        </div>

        <div>
          <span className="text-gray-400 block text-[11px]">Host</span>
          <span className="font-medium text-gray-200">{hostName}</span>
        </div>

        {/* 1. Local Link (For this PC: 2nd Tab / Incognito) */}
        <div>
          <span className="text-gray-400 flex items-center space-x-1 text-[11px] mb-1">
            <Laptop size={12} className="text-blue-400" />
            <span>Link for this computer (Tab 2 / Incognito):</span>
          </span>
          <div className="flex items-center justify-between p-2 bg-black/40 rounded-lg border border-gray-800">
            <span className="truncate font-mono text-[10px] text-gray-300 max-w-[220px]">
              {localInviteLink}
            </span>
            <button
              onClick={handleCopyLocal}
              className="flex items-center space-x-1 text-[#0E71EB] hover:text-blue-400 font-semibold cursor-pointer shrink-0 ml-2"
            >
              {copiedLocal ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              <span>{copiedLocal ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* 2. Network Wi-Fi Link (For phone / other laptop on Wi-Fi or Hotspot) */}
        <div>
          <span className="text-gray-400 flex items-center space-x-1 text-[11px] mb-1">
            <Smartphone size={12} className="text-emerald-400" />
            <span>Link for other devices (Phone / Same Wi-Fi / Hotspot):</span>
          </span>
          <div className="flex items-center justify-between p-2 bg-black/40 rounded-lg border border-gray-800">
            <span className="truncate font-mono text-[10px] text-emerald-300 max-w-[220px]">
              {networkInviteLink}
            </span>
            <button
              onClick={handleCopyNetwork}
              className="flex items-center space-x-1 text-[#22C55E] hover:text-green-400 font-semibold cursor-pointer shrink-0 ml-2"
            >
              {copiedNetwork ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              <span>{copiedNetwork ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Explanatory note */}
        <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-[10px] text-blue-200 flex items-start space-x-1.5">
          <Info size={13} className="shrink-0 text-blue-400 mt-0.5" />
          <span>
            <b>Why &apos;localhost&apos; won&apos;t work on other devices:</b> &apos;localhost&apos; points to that device itself. To test on a phone or another laptop, make sure it is connected to the same Wi-Fi or your mobile hotspot, then use the green <b>Network link</b> above.
          </span>
        </div>
      </div>
    </div>
  );
}
