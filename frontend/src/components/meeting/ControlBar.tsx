'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  MessageSquare,
  Smile,
  ArrowUpFromLine,
  Shield,
  MoreHorizontal,
  X,
  ChevronUp,
  Check,
  Settings,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  participantCount: number;
  unreadCount?: number;
  isHost: boolean;
  audioInputs?: MediaDeviceInfo[];
  audioOutputs?: MediaDeviceInfo[];
  videoInputs?: MediaDeviceInfo[];
  selectedAudioInputId?: string;
  selectedAudioOutputId?: string;
  selectedVideoInputId?: string;
  onSelectAudioInput?: (deviceId: string) => void;
  onSelectAudioOutput?: (deviceId: string) => void;
  onSelectVideoInput?: (deviceId: string) => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  onSendReaction: (emoji: string) => void;
  onMuteAll: () => void;
  onEndClick: () => void;
}

export default function ControlBar({
  isMuted,
  isVideoOff,
  isScreenSharing,
  participantCount,
  unreadCount = 0,
  isHost,
  audioInputs = [],
  audioOutputs = [],
  videoInputs = [],
  selectedAudioInputId = '',
  selectedAudioOutputId = '',
  selectedVideoInputId = '',
  onSelectAudioInput,
  onSelectAudioOutput,
  onSelectVideoInput,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleParticipants,
  onToggleChat,
  onSendReaction,
  onMuteAll,
  onEndClick,
}: ControlBarProps) {
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showHostTools, setShowHostTools] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAudioMenu(false);
        setShowVideoMenu(false);
        setShowReactions(false);
        setShowHostTools(false);
        setShowMore(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emojis = ['👍', '👏', '❤️', '🎉', '😂', '✋'];

  return (
    <footer
      ref={containerRef}
      className="h-18 bg-[#000000] border-t border-gray-800/80 px-4 sm:px-6 flex items-center justify-between select-none relative z-30"
    >
      {/* 1. Left Controls: Audio & Video */}
      <div className="flex items-center space-x-1 sm:space-x-2 relative">
        {/* Audio Toggle & Menu */}
        <div className="flex items-center relative">
          <button
            onClick={onToggleAudio}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
              isMuted ? 'text-red-500' : 'text-gray-200'
            }`}
            title={isMuted ? 'Unmute (Alt+A)' : 'Mute (Alt+A)'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            <span className="text-[11px] font-medium mt-1">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>
          <button
            onClick={() => {
              setShowAudioMenu(!showAudioMenu);
              setShowVideoMenu(false);
              setShowReactions(false);
              setShowHostTools(false);
              setShowMore(false);
            }}
            title="Select a Microphone or Speaker"
            className={`p-1 hover:bg-white/10 rounded-md cursor-pointer -ml-1 transition-colors ${
              showAudioMenu ? 'text-white bg-white/15' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ChevronUp size={14} />
          </button>

          {/* Zoom Signature Audio Device Popover Menu */}
          {showAudioMenu && (
            <div className="absolute bottom-16 left-0 w-72 bg-[#1F2228] border border-gray-700/80 rounded-xl shadow-2xl p-2 z-50 text-xs text-white divide-y divide-gray-700/60 animate-in fade-in zoom-in-95">
              {/* Microphones Section */}
              <div className="pb-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
                  Select a Microphone
                </div>
                {audioInputs.length === 0 ? (
                  <div className="px-3 py-1.5 text-gray-400 italic">Default Microphone</div>
                ) : (
                  audioInputs.map((d, i) => (
                    <button
                      key={d.deviceId || i}
                      onClick={() => {
                        onSelectAudioInput?.(d.deviceId);
                        setShowAudioMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                    >
                      <span className="truncate mr-2">{d.label || `Microphone ${i + 1}`}</span>
                      {selectedAudioInputId === d.deviceId && (
                        <Check size={14} className="text-[#0E71EB] shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Speakers Section */}
              <div className="py-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
                  Select a Speaker
                </div>
                {audioOutputs.length === 0 ? (
                  <div className="px-3 py-1.5 text-gray-400 italic">Default Speaker / Headphones</div>
                ) : (
                  audioOutputs.map((d, i) => (
                    <button
                      key={d.deviceId || i}
                      onClick={() => {
                        onSelectAudioOutput?.(d.deviceId);
                        setShowAudioMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                    >
                      <span className="truncate mr-2">{d.label || `Speaker ${i + 1}`}</span>
                      {selectedAudioOutputId === d.deviceId && (
                        <Check size={14} className="text-[#0E71EB] shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Audio Settings & Test */}
              <div className="pt-2 space-y-1">
                <button
                  onClick={() => {
                    alert('Audio Test: Speaker chime played. Microphone active.');
                    setShowAudioMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 rounded-lg cursor-pointer flex items-center space-x-2 text-gray-200"
                >
                  <Volume2 size={13} className="text-gray-400" />
                  <span>Test Speaker &amp; Microphone...</span>
                </button>
                <button
                  onClick={() => {
                    alert('Audio Settings: Echo cancellation & noise suppression are active.');
                    setShowAudioMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 rounded-lg cursor-pointer flex items-center space-x-2 text-gray-200"
                >
                  <Settings size={13} className="text-gray-400" />
                  <span>Audio Settings...</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Toggle & Menu */}
        <div className="flex items-center relative">
          <button
            onClick={onToggleVideo}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
              isVideoOff ? 'text-red-500' : 'text-gray-200'
            }`}
            title={isVideoOff ? 'Start Video (Alt+V)' : 'Stop Video (Alt+V)'}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            <span className="text-[11px] font-medium mt-1">
              {isVideoOff ? 'Start Video' : 'Stop Video'}
            </span>
          </button>
          <button
            onClick={() => {
              setShowVideoMenu(!showVideoMenu);
              setShowAudioMenu(false);
              setShowReactions(false);
              setShowHostTools(false);
              setShowMore(false);
            }}
            title="Select a Camera"
            className={`p-1 hover:bg-white/10 rounded-md cursor-pointer -ml-1 transition-colors ${
              showVideoMenu ? 'text-white bg-white/15' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ChevronUp size={14} />
          </button>

          {/* Zoom Signature Video Device Popover Menu */}
          {showVideoMenu && (
            <div className="absolute bottom-16 left-12 sm:left-14 w-72 bg-[#1F2228] border border-gray-700/80 rounded-xl shadow-2xl p-2 z-50 text-xs text-white divide-y divide-gray-700/60 animate-in fade-in zoom-in-95">
              {/* Cameras Section */}
              <div className="pb-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
                  Select a Camera
                </div>
                {videoInputs.length === 0 ? (
                  <div className="px-3 py-1.5 text-gray-400 italic">Integrated Camera</div>
                ) : (
                  videoInputs.map((d, i) => (
                    <button
                      key={d.deviceId || i}
                      onClick={() => {
                        onSelectVideoInput?.(d.deviceId);
                        setShowVideoMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                    >
                      <span className="truncate mr-2">{d.label || `Camera ${i + 1}`}</span>
                      {selectedVideoInputId === d.deviceId && (
                        <Check size={14} className="text-[#0E71EB] shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Video Settings */}
              <div className="pt-2 space-y-1">
                <button
                  onClick={() => {
                    alert('Virtual Backgrounds: Blur, Executive Office, and San Francisco Bay available.');
                    setShowVideoMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 rounded-lg cursor-pointer flex items-center space-x-2 text-gray-200"
                >
                  <Sparkles size={13} className="text-yellow-400" />
                  <span>Choose Virtual Background...</span>
                </button>
                <button
                  onClick={() => {
                    alert('Video Settings: HD 720p enabled, adjust for low light enabled.');
                    setShowVideoMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 rounded-lg cursor-pointer flex items-center space-x-2 text-gray-200"
                >
                  <Settings size={13} className="text-gray-400" />
                  <span>Video Settings...</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Center Controls matching Screenshot 165457.png & 170119.png */}
      <div className="flex items-center space-x-1 sm:space-x-2 relative">
        {/* Participants Button */}
        <button
          onClick={onToggleParticipants}
          className="flex flex-col items-center justify-center w-16 h-14 text-gray-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer relative"
        >
          <div className="relative">
            <Users size={20} />
            <span className="absolute -top-1.5 -right-3 bg-gray-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-black">
              {participantCount}
            </span>
          </div>
          <span className="text-[11px] font-medium mt-1">Participants</span>
        </button>

        {/* Chat Button */}
        <button
          onClick={onToggleChat}
          className="flex flex-col items-center justify-center w-14 h-14 text-gray-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer relative"
        >
          <div className="relative">
            <MessageSquare size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium mt-1">Chat</span>
        </button>

        {/* React Button & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="flex flex-col items-center justify-center w-14 h-14 text-gray-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <Smile size={20} />
            <span className="text-[11px] font-medium mt-1">React</span>
          </button>

          {showReactions && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#1F2228] border border-gray-700 rounded-2xl p-2.5 shadow-2xl flex items-center space-x-2 z-50 animate-in fade-in zoom-in-95">
              {emojis.map((em) => (
                <button
                  key={em}
                  onClick={() => {
                    onSendReaction(em);
                    setShowReactions(false);
                  }}
                  className="text-2xl p-1.5 hover:scale-125 transition-transform cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Share Screen (Vibrant Green Icon) matching Zoom's signature color */}
        <button
          onClick={onToggleScreenShare}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-colors cursor-pointer ${
            isScreenSharing
              ? 'text-red-400 hover:bg-white/10'
              : 'text-[#22C55E] hover:bg-white/10'
          }`}
        >
          <ArrowUpFromLine size={20} />
          <span className="text-[11px] font-medium mt-1">
            {isScreenSharing ? 'Stop Share' : 'Share'}
          </span>
        </button>

        {/* Host Tools Button & Menu */}
        {isHost && (
          <div className="relative">
            <button
              onClick={() => setShowHostTools(!showHostTools)}
              className="flex flex-col items-center justify-center w-16 h-14 text-gray-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <Shield size={20} className="text-blue-400" />
              <span className="text-[11px] font-medium mt-1">Host tools</span>
            </button>

            {showHostTools && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 bg-[#1F2228] border border-gray-700 rounded-xl p-2 shadow-2xl space-y-1 z-50 animate-in fade-in">
                <button
                  onClick={() => {
                    onMuteAll();
                    setShowHostTools(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Mute All Participants
                </button>
                <button
                  onClick={() => {
                    alert('Meeting is now locked. No new participants can join.');
                    setShowHostTools(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Lock Meeting
                </button>
              </div>
            )}
          </div>
        )}

        {/* More Button */}
        <div className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center justify-center w-14 h-14 text-gray-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <MoreHorizontal size={20} />
            <span className="text-[11px] font-medium mt-1">More</span>
          </button>

          {showMore && (
            <div className="absolute bottom-16 right-0 w-44 bg-[#1F2228] border border-gray-700 rounded-xl p-2 shadow-2xl space-y-1 z-50 text-xs text-white animate-in fade-in">
              <button
                onClick={() => {
                  alert('Closed captions enabled.');
                  setShowMore(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                Show Captions
              </button>
              <button
                onClick={() => {
                  alert('Whiteboards feature.');
                  setShowMore(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                Whiteboards
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Right Control: Red End Button */}
      <div className="flex items-center">
        <button
          onClick={onEndClick}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#E02828] hover:bg-[#C52222] text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <X size={15} />
          <span>End</span>
        </button>
      </div>
    </footer>
  );
}
