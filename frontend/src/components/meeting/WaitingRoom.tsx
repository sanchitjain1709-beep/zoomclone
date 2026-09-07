'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Clock, ShieldAlert, LogOut, Home, Radio } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WaitingRoomProps {
  meetingTitle?: string;
  meetingCode?: string;
  hostName?: string;
  displayName: string;
  isDenied?: boolean;
  deniedReason?: string;
  localStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  localVolume?: number;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export default function WaitingRoom({
  meetingTitle = 'Zoom Meeting',
  meetingCode = '',
  hostName = 'Host',
  displayName,
  isDenied = false,
  deniedReason,
  localStream,
  isMuted,
  isVideoOff,
  localVolume = 0,
  onToggleAudio,
  onToggleVideo,
}: WaitingRoomProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]);

  if (isDenied) {
    return (
      <div className="min-h-screen w-full bg-[#0E1015] flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-[#181A20] border border-red-500/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-lg shadow-red-500/5">
            <ShieldAlert size={32} />
          </div>

          <h2 className="text-2xl font-bold mb-2 text-gray-100">Unable to Join Meeting</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {deniedReason || 'The host has denied your request to join this meeting.'}
          </p>

          <div className="w-full p-4 bg-[#121418] rounded-xl border border-gray-800 text-left text-xs text-gray-400 mb-6 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Meeting:</span>
              <span className="text-gray-300 font-medium">{meetingTitle}</span>
            </div>
            {meetingCode && (
              <div className="flex justify-between">
                <span className="text-gray-500">Meeting ID:</span>
                <span className="text-gray-300 font-mono">{meetingCode}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Home size={16} />
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0E1017] via-[#12151D] to-[#0A0C11] flex items-center justify-center p-4 text-white select-none">
      <div className="w-full max-w-lg bg-[#181A20]/95 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pulse Radar Indicator */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/10">
            <Clock size={34} className="animate-pulse" />
          </div>
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-[#181A20]"></span>
          </span>
        </div>

        {/* Header Titles */}
        <h2 className="text-2xl font-bold text-gray-100 tracking-tight mb-2">
          Please wait, the meeting host will let you in soon.
        </h2>
        <p className="text-gray-400 text-sm max-w-sm mb-6">
          You are in the waiting room for{' '}
          <span className="text-gray-200 font-semibold">{meetingTitle}</span>
        </p>

        {/* Meeting metadata card */}
        <div className="w-full p-3.5 bg-[#121419] rounded-2xl border border-gray-800/70 text-xs mb-6 flex items-center justify-around divide-x divide-gray-800">
          <div className="px-3 flex flex-col items-center">
            <span className="text-gray-500 text-[11px] uppercase tracking-wider mb-0.5">Host</span>
            <span className="text-gray-200 font-medium truncate max-w-[120px]">{hostName}</span>
          </div>
          {meetingCode && (
            <div className="px-3 flex flex-col items-center">
              <span className="text-gray-500 text-[11px] uppercase tracking-wider mb-0.5">Meeting ID</span>
              <span className="text-gray-200 font-mono">{meetingCode}</span>
            </div>
          )}
          <div className="px-3 flex flex-col items-center">
            <span className="text-gray-500 text-[11px] uppercase tracking-wider mb-0.5">Status</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Waiting
            </span>
          </div>
        </div>

        {/* Hardware Preview Card */}
        <div className="w-full bg-[#121419] rounded-2xl border border-gray-800/80 p-4 mb-6 flex flex-col items-center">
          <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-3 self-start flex items-center gap-1.5">
            <Radio size={12} className="text-blue-400" />
            Audio & Video Preview
          </div>

          {/* Video Preview Box */}
          <div className="w-full aspect-video bg-[#0B0C0E] rounded-xl overflow-hidden relative border border-gray-800 flex items-center justify-center">
            {!isVideoOff && localStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center text-xl font-bold">
                  {displayName ? displayName[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs text-gray-400">Camera is off</span>
              </div>
            )}

            {/* Overlay Name and Mic badge */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[11px] text-gray-300 flex items-center gap-1.5">
              <span>{displayName}</span>
              {isMuted ? (
                <MicOff size={11} className="text-red-400" />
              ) : (
                <div className="flex items-center gap-0.5">
                  <Mic size={11} className="text-emerald-400" />
                  <span
                    className="w-1.5 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, (localVolume / 100) * 12)}px` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quick Hardware Controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={onToggleAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isMuted
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-white/10 text-gray-200 border border-white/10 hover:bg-white/15'
              }`}
            >
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
              {isMuted ? 'Unmute Mic' : 'Mute Mic'}
            </button>

            <button
              onClick={onToggleVideo}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isVideoOff
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-white/10 text-gray-200 border border-white/10 hover:bg-white/15'
              }`}
            >
              {isVideoOff ? <VideoOff size={14} /> : <Video size={14} />}
              {isVideoOff ? 'Start Video' : 'Stop Video'}
            </button>
          </div>
        </div>

        {/* Leave Meeting action */}
        <button
          onClick={() => router.push('/')}
          className="w-full py-2.5 px-4 bg-transparent hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-xs font-semibold rounded-xl border border-transparent hover:border-red-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut size={14} />
          Leave Meeting
        </button>
      </div>
    </div>
  );
}
