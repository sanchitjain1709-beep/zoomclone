'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Info,
  ShieldCheck,
  Maximize,
  Minimize,
} from 'lucide-react';
import { validateMeetingCode } from '@/services/api';
import { Meeting } from '@/types/meeting';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useMediaDevices } from '@/hooks/useMediaDevices';

import VideoTile from '@/components/meeting/VideoTile';
import ControlBar from '@/components/meeting/ControlBar';
import ParticipantsDrawer from '@/components/meeting/ParticipantsDrawer';
import ChatDrawer from '@/components/meeting/ChatDrawer';
import EndModal from '@/components/meeting/EndModal';
import MeetingInfoPopup from '@/components/meeting/MeetingInfoPopup';
import WaitingRoom from '@/components/meeting/WaitingRoom';

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const meetingId = (params.meetingId as string) || '';
  const displayName = searchParams.get('name') || 'Sanchit Jain';
  const isHostParam = searchParams.get('host') === 'true';
  const initialMicMuted = searchParams.get('mic') === 'off';
  const initialVideoOff = searchParams.get('video') === 'off';

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'participants' | 'chat'>('none');
  const [showEndModal, setShowEndModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hardware Media Devices Enumeration & Selection
  const {
    audioInputs,
    audioOutputs,
    videoInputs,
    selectedAudioInputId,
    selectedAudioOutputId,
    selectedVideoInputId,
    selectAudioInput,
    selectVideoInput,
    selectAudioOutput,
  } = useMediaDevices();

  // WebRTC Media & Signaling Hook
  const {
    peerId,
    role,
    localStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    participants,
    chatMessages,
    reactionList,
    activeSpeakerId,
    localVolume,
    connectionStatus,
    isWaitingInRoom,
    waitingParticipants,
    isDenied,
    deniedReason,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    switchCamera,
    switchMicrophone,
    sendChatMessage,
    sendReaction,
    muteAllParticipants,
    kickParticipant,
    admitParticipant,
    denyParticipant,
    admitAllParticipants,
  } = useWebRTC({
    meetingId,
    displayName,
    isHost: isHostParam,
    initialMicMuted,
    initialVideoOff,
  });

  const isHost = role === 'HOST' || isHostParam;

  // Handlers for switching devices with track replacement
  const handleSelectAudioInput = (deviceId: string) => {
    selectAudioInput(deviceId);
    switchMicrophone(deviceId);
  };

  const handleSelectVideoInput = (deviceId: string) => {
    selectVideoInput(deviceId);
    switchCamera(deviceId);
  };

  const handleSelectAudioOutput = (deviceId: string) => {
    selectAudioOutput(deviceId);
    if ('setSinkId' in HTMLMediaElement.prototype) {
      document.querySelectorAll('video, audio').forEach((el: any) => {
        if (el.setSinkId) el.setSinkId(deviceId).catch(console.warn);
      });
    }
  };

  // Load meeting metadata
  useEffect(() => {
    async function loadInfo() {
      const res = await validateMeetingCode(meetingId);
      if (res.exists && res.meeting) {
        setMeeting(res.meeting);
      }
    }
    if (meetingId) loadInfo();
  }, [meetingId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleLeave = () => {
    router.push('/');
  };

  const handleEndAll = () => {
    // If host ends meeting for all, kick everyone
    muteAllParticipants();
    router.push('/');
  };

  // Total count including self
  const totalCount = 1 + participants.length;

  // Calculate grid layout columns based on participant count
  const getGridClass = () => {
    if (totalCount === 1) return 'grid-cols-1 max-w-5xl';
    if (totalCount === 2) return 'grid-cols-1 md:grid-cols-2 max-w-6xl';
    if (totalCount <= 4) return 'grid-cols-1 sm:grid-cols-2 max-w-6xl';
    return 'grid-cols-2 sm:grid-cols-3 max-w-7xl';
  };

  // If in waiting room or denied access, render Zoom Waiting Room
  if (isWaitingInRoom || isDenied) {
    return (
      <WaitingRoom
        meetingTitle={meeting?.title || `${displayName}'s ZoomClone Meeting`}
        meetingCode={meeting?.meeting_code || meetingId}
        hostName={meeting?.host_display_name || 'Meeting Host'}
        displayName={displayName}
        isDenied={isDenied}
        deniedReason={deniedReason}
        localStream={localStream}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        localVolume={localVolume}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#131619] text-white flex flex-col justify-between overflow-hidden relative select-none font-sans">
      {/* Connection State Alert Banner */}
      {connectionStatus !== 'connected' && (
        <div className="bg-amber-500/95 text-black text-xs font-semibold px-4 py-1.5 text-center flex items-center justify-center space-x-2 z-50 animate-in fade-in shadow-md">
          <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
          <span>
            {connectionStatus === 'reconnecting'
              ? 'Reconnecting to meeting server... Audio & video will resume automatically.'
              : connectionStatus === 'connecting'
              ? 'Connecting to meeting room...'
              : 'Disconnected from meeting server. Re-establishing connection...'}
          </span>
        </div>
      )}

      {/* Host Floating Waiting Room Notification Banner */}
      {isHost && waitingParticipants.length > 0 && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1E222B]/95 backdrop-blur-md border border-amber-500/40 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-gray-200">
            <strong className="text-white font-semibold">
              {waitingParticipants.length === 1
                ? `${waitingParticipants[0].name} is waiting`
                : `${waitingParticipants.length} people are waiting`}
            </strong>{' '}
            to join the meeting.
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={admitAllParticipants}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Admit All
            </button>
            <button
              onClick={() => setActiveDrawer('participants')}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              View
            </button>
          </div>
        </div>
      )}

      {/* 1. Top In-Meeting Bar matching Screenshot 165457.png & 170119.png */}
      <header className="h-12 px-5 flex items-center justify-between bg-transparent z-20">
        {/* Left: Meeting Info Button */}
        <div className="flex items-center space-x-3 relative">
          <button
            onClick={() => setShowInfoPopup(!showInfoPopup)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-gray-200 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer"
          >
            <Info size={14} className="text-[#0E71EB]" />
            <span>{meeting?.title || `${displayName}'s ZoomClone Meeting`}</span>
          </button>

          {/* Meeting Info Popup Dialog */}
          <MeetingInfoPopup
            isOpen={showInfoPopup}
            onClose={() => setShowInfoPopup(false)}
            title={meeting?.title || `${displayName}'s ZoomClone Meeting`}
            meetingCode={meeting?.meeting_code || meetingId}
            hostName={meeting?.host_display_name || displayName}
            passcode={meeting?.passcode || 'gTfEu4'}
          />
        </div>

        {/* Right: Security Badge, View Grid & Fullscreen */}
        <div className="flex items-center space-x-3 text-gray-300">
          <div className="flex items-center space-x-1 text-green-400 bg-green-950/40 px-2 py-1 rounded-md border border-green-800/40 text-xs">
            <ShieldCheck size={14} />
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </header>

      {/* 2. Central Video Grid Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 p-4 sm:p-6 flex items-center justify-center overflow-hidden">
          <div className={`w-full h-full grid gap-4 place-items-center ${getGridClass()}`}>
            {/* Local User Video Tile */}
            <div className="w-full h-full max-h-[75vh] aspect-video">
              <VideoTile
                name={displayName}
                stream={localStream}
                isVideoOff={isVideoOff}
                isMuted={isMuted}
                isLocal={true}
                isActiveSpeaker={activeSpeakerId === 'local' || activeSpeakerId === peerId}
                role={role}
              />
            </div>

            {/* Remote Participants Video Tiles */}
            {participants.map((p) => (
              <div key={p.peer_id} className="w-full h-full max-h-[75vh] aspect-video">
                <VideoTile
                  name={p.name}
                  stream={p.stream}
                  isVideoOff={p.is_video_off}
                  isMuted={p.is_muted}
                  isLocal={false}
                  isActiveSpeaker={activeSpeakerId === p.peer_id}
                  role={p.role}
                />
              </div>
            ))}
          </div>

          {/* Floating Emoji Reactions Stream */}
          <div className="absolute bottom-20 left-12 flex flex-col space-y-2 pointer-events-none z-40">
            {reactionList.map((r) => (
              <div key={r.id} className="reaction-bubble text-4xl">
                {r.emoji}
              </div>
            ))}
          </div>
        </main>

        {/* 3. Slide-over Drawers */}
        <ParticipantsDrawer
          isOpen={activeDrawer === 'participants'}
          onClose={() => setActiveDrawer('none')}
          localName={displayName}
          isLocalHost={isHost}
          isLocalMuted={isMuted}
          isLocalVideoOff={isVideoOff}
          participants={participants}
          waitingParticipants={waitingParticipants}
          onMuteAll={muteAllParticipants}
          onKickParticipant={kickParticipant}
          onAdmitPeer={admitParticipant}
          onDenyPeer={denyParticipant}
          onAdmitAll={admitAllParticipants}
          onOpenInvite={() => setShowInfoPopup(true)}
        />

        <ChatDrawer
          isOpen={activeDrawer === 'chat'}
          onClose={() => setActiveDrawer('none')}
          messages={chatMessages}
          onSendMessage={sendChatMessage}
          localName={displayName}
        />
      </div>

      {/* 4. Zoom Signature Bottom Docked Control Bar */}
      <ControlBar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        participantCount={totalCount}
        waitingCount={waitingParticipants.length}
        unreadCount={0}
        isHost={isHost}
        audioInputs={audioInputs}
        audioOutputs={audioOutputs}
        videoInputs={videoInputs}
        selectedAudioInputId={selectedAudioInputId}
        selectedAudioOutputId={selectedAudioOutputId}
        selectedVideoInputId={selectedVideoInputId}
        onSelectAudioInput={handleSelectAudioInput}
        onSelectAudioOutput={handleSelectAudioOutput}
        onSelectVideoInput={handleSelectVideoInput}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleParticipants={() =>
          setActiveDrawer(activeDrawer === 'participants' ? 'none' : 'participants')
        }
        onToggleChat={() =>
          setActiveDrawer(activeDrawer === 'chat' ? 'none' : 'chat')
        }
        onSendReaction={sendReaction}
        onMuteAll={muteAllParticipants}
        onEndClick={() => setShowEndModal(true)}
      />

      {/* 5. End Meeting Popup Dialog matching Screenshot 165511.png */}
      <EndModal
        isOpen={showEndModal}
        isHost={isHost}
        onClose={() => setShowEndModal(false)}
        onLeave={handleLeave}
        onEndAll={handleEndAll}
      />
    </div>
  );
}
