'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Volume2, CheckCircle2 } from 'lucide-react';

interface AudioVideoTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AudioVideoTestModal({ isOpen, onClose }: AudioVideoTestModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlayingChime, setIsPlayingChime] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [devices, setDevices] = useState<{ audioInputs: MediaDeviceInfo[]; videoInputs: MediaDeviceInfo[] }>({
    audioInputs: [],
    videoInputs: [],
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize camera and mic when modal opens
  useEffect(() => {
    if (!isOpen) {
      cleanupMedia();
      return;
    }

    let activeStream: MediaStream | null = null;

    async function initMedia() {
      try {
        let mediaStream: MediaStream | null = null;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 360 },
            audio: true,
          });
        } catch {
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch {
            try {
              mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            } catch {
              // Neither camera nor microphone accessible
            }
          }
        }
        if (!mediaStream) return;
        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Setup audio level meter
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        const source = ctx.createMediaStreamSource(mediaStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();

        // Enumerate devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices({
          audioInputs: allDevices.filter((d) => d.kind === 'audioinput'),
          videoInputs: allDevices.filter((d) => d.kind === 'videoinput'),
        });
      } catch (err) {
        console.warn('Hardware preview not accessible', err);
      }
    }

    initMedia();

    return () => {
      cleanupMedia();
    };
  }, [isOpen]);

  const cleanupMedia = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setAudioLevel(0);
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((t) => {
        t.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Play pleasant Zoom chime tone via Web Audio API oscillator
  const playTestSpeaker = () => {
    try {
      setIsPlayingChime(true);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.35); // D6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.7);

      setTimeout(() => {
        setIsPlayingChime(false);
        ctx.close().catch(() => {});
      }, 750);
    } catch (e) {
      setIsPlayingChime(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={20} className="text-[#0E71EB]" />
            <h3 className="text-base font-bold text-gray-900">Audio & Video Diagnostic Test</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Preview Box */}
        <div className="p-6 space-y-5">
          <div className="relative w-full aspect-video bg-[#131619] rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                isVideoOff ? 'hidden' : 'block'
              }`}
            />
            {isVideoOff && (
              <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                <VideoOff size={36} />
                <span className="text-xs font-semibold">Camera is Turned Off</span>
              </div>
            )}

            {/* Quick Controls overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg text-white text-xs">
              <button
                onClick={toggleMute}
                className="flex items-center space-x-1.5 hover:text-blue-300 transition-colors cursor-pointer"
              >
                {isMuted ? <MicOff size={16} className="text-red-400" /> : <Mic size={16} className="text-green-400" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                onClick={toggleVideo}
                className="flex items-center space-x-1.5 hover:text-blue-300 transition-colors cursor-pointer"
              >
                {isVideoOff ? <VideoOff size={16} className="text-red-400" /> : <Video size={16} className="text-green-400" />}
                <span>{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
              </button>
            </div>
          </div>

          {/* Microphone Level Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-gray-700">
              <span className="flex items-center space-x-1.5">
                <Mic size={14} className="text-gray-500" />
                <span>Microphone Level:</span>
              </span>
              <span className="font-mono text-gray-500">{isMuted ? 'Muted' : `${audioLevel}%`}</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div
                className={`h-full transition-all duration-75 ${
                  isMuted ? 'w-0' : audioLevel > 60 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: isMuted ? '0%' : `${audioLevel}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400">Speak into your microphone to verify the volume indicator reacts.</p>
          </div>

          {/* Speaker Sound Test */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-2.5">
              <Volume2 size={18} className="text-[#0E71EB]" />
              <div>
                <p className="text-xs font-bold text-gray-800">Test Speaker Output</p>
                <p className="text-[11px] text-gray-500">Play standard Zoom test chime</p>
              </div>
            </div>
            <button
              onClick={playTestSpeaker}
              disabled={isPlayingChime}
              className="px-3.5 py-1.5 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-[#0E71EB] text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              {isPlayingChime ? 'Playing...' : 'Test Speaker'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0E71EB] hover:bg-[#005CE6] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Finished Testing
          </button>
        </div>
      </div>
    </div>
  );
}
