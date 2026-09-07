'use client';

import React, { useEffect, useRef } from 'react';
import { MicOff, Pin } from 'lucide-react';

interface VideoTileProps {
  name: string;
  stream?: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isLocal?: boolean;
  isActiveSpeaker?: boolean;
  role?: string;
}

export default function VideoTile({
  name,
  stream,
  isVideoOff,
  isMuted,
  isLocal = false,
  isActiveSpeaker = false,
  role,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initial = name.trim() ? name.trim()[0].toUpperCase() : 'S';

  return (
    <div
      className={`relative w-full h-full bg-[#18181B] rounded-2xl overflow-hidden flex items-center justify-center shadow-xl border border-gray-800 transition-all ${
        isActiveSpeaker ? 'active-speaker-ring' : ''
      }`}
    >
      {/* 1. Live Video Element (kept active with invisible so audio keeps playing if camera is toggled off) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local playback to prevent audio echo
        className={`w-full h-full object-cover ${isLocal ? '-scale-x-100' : ''} ${
          isVideoOff ? 'invisible absolute pointer-events-none' : 'block'
        }`}
      />

      {/* 2. Video Off State matching Screenshot 165457.png & 170119.png */}
      {isVideoOff && (
        <div className="flex flex-col items-center justify-center select-none animate-in fade-in">
          {/* Centered Bronze Avatar Square or Circle */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#5C3E31] text-white flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-2xl border border-white/10">
            {initial}
          </div>
          {/* Centered Large Bold Name if tile is large */}
          <span className="mt-4 text-xl sm:text-2xl font-bold text-white tracking-wide drop-shadow-md">
            {name}
          </span>
        </div>
      )}

      {/* 3. Bottom-Left Participant Tag matching Screenshot 170119.png */}
      <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-md text-xs text-white border border-white/10 select-none z-10">
        {isMuted ? (
          <MicOff size={13} className="text-red-500 shrink-0" />
        ) : isActiveSpeaker ? (
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" title="Speaking" />
        ) : null}
        <span className="font-semibold truncate max-w-[140px]">{name}</span>
        {isLocal && <span className="text-gray-400 font-normal">(me)</span>}
        {role === 'HOST' && (
          <span className="bg-blue-600/80 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-xs ml-1">
            Host
          </span>
        )}
      </div>
    </div>
  );
}
