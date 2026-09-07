'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Settings,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { validateMeetingCode } from '@/services/api';
import { Meeting } from '@/types/meeting';

export default function MeetingLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const meetingIdParam = (params.meetingId as string) || '';
  const initialName = searchParams.get('name') || 'Sanchit Jain';

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [displayName, setDisplayName] = useState(initialName);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 1. Validate Meeting existence with backend
  useEffect(() => {
    async function checkMeeting() {
      try {
        setIsValidating(true);
        const res = await validateMeetingCode(meetingIdParam);
        if (!res.exists || !res.meeting) {
          setValidationError(res.message || 'Meeting ID not found or meeting has ended.');
        } else {
          setMeeting(res.meeting);
        }
      } catch (err) {
        setValidationError('Failed to connect to meeting server. Please check your network.');
      } finally {
        setIsValidating(false);
      }
    }
    if (meetingIdParam) {
      checkMeeting();
    }
  }, [meetingIdParam]);

  // 2. Setup Local Camera/Mic Preview & Web Audio API Visualizer
  useEffect(() => {
    let active = true;

    async function setupPreview() {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 360 } },
            audio: true,
          });
        } catch (mediaErr) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsVideoOff(true);
          } catch (audioErr) {
            stream = new MediaStream();
            setIsVideoOff(true);
            setIsMuted(true);
          }
        }

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Web Audio API volume analyzer
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass();
          audioContextRef.current = ctx;

          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateVolume = () => {
            if (!active) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        } catch (e) {
          console.warn('Audio visualization not supported in current environment', e);
        }
      } catch (err) {
        console.warn('Could not access camera/mic preview (devices might be in use or permission denied)', err);
        setIsVideoOff(true);
      }
    }

    setupPreview();

    return () => {
      active = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const handleJoinMeeting = () => {
    // Release preview stream so meeting room can capture
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    const encodedName = encodeURIComponent(displayName.trim() || 'Participant');
    const micParam = isMuted ? 'off' : 'on';
    const videoParam = isVideoOff ? 'off' : 'on';

    router.push(
      `/room/${meetingIdParam}?name=${encodedName}&mic=${micParam}&video=${videoParam}`
    );
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#131619] flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 size={36} className="animate-spin text-[#0E71EB]" />
        <p className="text-sm font-medium text-gray-400">Verifying Zoom Meeting...</p>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen bg-[#131619] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1F2228] border border-gray-800 rounded-2xl p-8 text-center text-white space-y-5">
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle size={30} />
          </div>
          <h2 className="text-xl font-bold">Unable to Join Meeting</h2>
          <p className="text-sm text-gray-400">{validationError}</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#0E71EB] hover:bg-[#005CE6] text-white rounded-xl text-sm font-bold transition-all"
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131619] flex flex-col justify-between text-white font-sans">
      {/* Top Navbar */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-gray-800/80 bg-[#16181D]">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black text-[#0B5CFF]">zoom</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-2 border-l border-gray-700">
            Workplace Lobby
          </span>
        </Link>
        <div className="flex items-center space-x-2 text-xs text-green-400 bg-green-950/40 px-3 py-1.5 rounded-full border border-green-800/40">
          <ShieldCheck size={14} />
          <span>Encrypted Session</span>
        </div>
      </header>

      {/* Center Pre-Meeting Monitor */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-center gap-10">
        {/* Video Preview Box */}
        <div className="w-full md:w-3/5 flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-800 flex items-center justify-center">
            {/* Live Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover -scale-x-100 ${
                isVideoOff ? 'hidden' : 'block'
              }`}
            />

            {/* Video Off Placeholder matching Screenshot 170119.png */}
            {isVideoOff && (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-24 h-24 rounded-full bg-[#5C3E31] text-white flex items-center justify-center text-4xl font-bold shadow-inner">
                  {displayName.trim() ? displayName.trim()[0].toUpperCase() : 'S'}
                </div>
                <span className="text-sm font-medium text-gray-400">Camera is off</span>
              </div>
            )}

            {/* Audio Level Visualizer Bar on Bottom-Left */}
            <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs">
              {isMuted ? (
                <MicOff size={14} className="text-red-500" />
              ) : (
                <Mic size={14} className="text-green-500" />
              )}
              <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-75"
                  style={{ width: `${isMuted ? 0 : audioLevel}%` }}
                />
              </div>
            </div>

            {/* Media Toggles Floating Bar */}
            <div className="absolute bottom-4 right-4 flex items-center space-x-2">
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                  isVideoOff
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
              >
                {isVideoOff ? <VideoOff size={16} /> : <VideoIcon size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Join Parameters Card */}
        <div className="w-full md:w-2/5 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold tracking-tight">
              {meeting?.title || 'Zoom Meeting'}
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Meeting ID: <span className="text-white font-bold">{meeting?.meeting_code}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Your Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-4 py-3 bg-[#1F2228] border border-gray-700 focus:border-[#0E71EB] focus:ring-1 focus:ring-[#0E71EB] rounded-xl text-white text-sm outline-hidden transition-all"
              />
            </div>

            <button
              onClick={handleJoinMeeting}
              disabled={!displayName.trim()}
              className="w-full py-3.5 bg-[#0E71EB] hover:bg-[#005CE6] disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              Join Meeting
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-600 border-t border-gray-800/60">
        © 2026 Zoom Communications, Inc. All rights reserved.
      </footer>
    </div>
  );
}
