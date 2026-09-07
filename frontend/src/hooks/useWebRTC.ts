'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MeetingParticipant, ChatMessage, SignalingMessage } from '@/types/meeting';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

interface UseWebRTCOptions {
  meetingId: string;
  displayName: string;
  isHost?: boolean;
  initialMicMuted?: boolean;
  initialVideoOff?: boolean;
}

export function useWebRTC({
  meetingId,
  displayName,
  isHost = false,
  initialMicMuted = false,
  initialVideoOff = false,
}: UseWebRTCOptions) {
  const [peerId] = useState<string>(() => 'peer_' + Math.random().toString(36).substring(2, 9));
  const [role, setRole] = useState<'HOST' | 'CO_HOST' | 'PARTICIPANT'>(isHost ? 'HOST' : 'PARTICIPANT');

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(initialMicMuted);
  const [isVideoOff, setIsVideoOff] = useState(initialVideoOff);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Map of remote participants: peer_id -> MeetingParticipant
  const [participants, setParticipants] = useState<Map<string, MeetingParticipant>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reactionList, setReactionList] = useState<Array<{ id: string; emoji: string; peerId: string }>>([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [localVolume, setLocalVolume] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('connecting');
  
  // Waiting Room State
  const [isWaitingInRoom, setIsWaitingInRoom] = useState(false);
  const [waitingParticipants, setWaitingParticipants] = useState<Array<{ peer_id: string; name: string }>>([]);
  const [isDenied, setIsDenied] = useState(false);
  const [deniedReason, setDeniedReason] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const iceCandidateQueueRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  // Web Audio API Context and Analyzers for Active Speaker Spotlighting
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalysersRef = useRef<Map<string, AnalyserNode>>(new Map());
  const speakerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize AudioContext for Volume & Active Speaker Detection
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    } catch (e) {
      console.warn('AudioContext not supported:', e);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const attachAudioAnalyser = useCallback((id: string, stream: MediaStream) => {
    if (!audioContextRef.current || stream.getAudioTracks().length === 0) return;
    try {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioAnalysersRef.current.set(id, analyser);
    } catch (e) {
      console.warn(`Could not attach audio analyser for ${id}:`, e);
    }
  }, []);

  // 2. Periodic Audio Analysis (Every 150ms) to detect Active Speaker
  useEffect(() => {
    const dataArray = new Uint8Array(128);

    const interval = setInterval(() => {
      let highestVol = 0;
      let loudestSpeakerId: string | null = null;

      audioAnalysersRef.current.forEach((analyser, id) => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));

        if (id === 'local') {
          setLocalVolume(isMuted ? 0 : normalized);
        }

        if (normalized > 18 && normalized > highestVol) {
          highestVol = normalized;
          loudestSpeakerId = id;
        }
      });

      if (loudestSpeakerId) {
        setActiveSpeakerId(loudestSpeakerId);
        if (speakerTimeoutRef.current) clearTimeout(speakerTimeoutRef.current);
        speakerTimeoutRef.current = setTimeout(() => {
          setActiveSpeakerId(null);
        }, 1500);
      }
    }, 150);

    return () => {
      clearInterval(interval);
      if (speakerTimeoutRef.current) clearTimeout(speakerTimeoutRef.current);
    };
  }, [isMuted]);

  // 3. Initialize Local Media Stream with Graceful Fallbacks
  useEffect(() => {
    let active = true;

    async function initMedia() {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          });
        } catch (mediaErr) {
          console.warn('Could not acquire both video and audio, attempting audio-only...', mediaErr);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsVideoOff(true);
          } catch (audioErr) {
            console.warn('Could not acquire audio either, falling back to empty stream.', audioErr);
            stream = new MediaStream();
            setIsVideoOff(true);
            setIsMuted(true);
          }
        }

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        stream.getAudioTracks().forEach((t) => {
          t.enabled = !initialMicMuted;
        });
        stream.getVideoTracks().forEach((t) => {
          t.enabled = !initialVideoOff;
        });

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Attach local analyzer
        attachAudioAnalyser('local', stream);
      } catch (err) {
        console.warn('Could not acquire local camera/mic stream:', err);
        setIsVideoOff(true);
      }
    }

    initMedia();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [initialMicMuted, initialVideoOff, attachAudioAnalyser]);

  // 4. Setup WebRTC Peer Connection Helper
  const createPeerConnection = useCallback(
    (targetPeerId: string, isInitiator: boolean) => {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionsRef.current.set(targetPeerId, pc);

      // Add local tracks to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // ICE candidate generation
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'ice-candidate',
              target_id: targetPeerId,
              candidate: event.candidate,
            })
          );
        }
      };

      // Remote track arrived
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0] || new MediaStream([event.track]);
        setParticipants((prev) => {
          const copy = new Map(prev);
          const existing = copy.get(targetPeerId);
          if (existing) {
            copy.set(targetPeerId, { ...existing, stream: remoteStream });
          }
          return copy;
        });

        // Attach remote audio analyzer for active speaker detection
        attachAudioAnalyser(targetPeerId, remoteStream);
      };

      // If initiator, generate SDP Offer
      if (isInitiator) {
        pc.onnegotiationneeded = async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'offer',
                  target_id: targetPeerId,
                  sdp: offer,
                })
              );
            }
          } catch (e) {
            console.error('Error creating offer', e);
          }
        };
      }

      return pc;
    },
    [attachAudioAnalyser]
  );

  // 5. Connect Signaling WebSocket with Exponential Backoff Auto-Reconnect
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    let isUnmounted = false;

    function connectSignaling() {
      if (isUnmounted) return;
      setConnectionStatus(reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const defaultWsBase = `${wsProtocol}//${host}:8000`;
      const wsBase = process.env.NEXT_PUBLIC_WS_URL || defaultWsBase;
      const wsUrl = `${wsBase}/ws/meeting/${meetingId}?peer_id=${peerId}&name=${encodeURIComponent(
        displayName
      )}&role=${isHost ? 'HOST' : 'PARTICIPANT'}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket signaling connected to room:', meetingId);
        setConnectionStatus('connected');
        reconnectAttempts = 0;
      };

      ws.onmessage = async (event) => {
        try {
          const msg: SignalingMessage = JSON.parse(event.data);

          // A. Room Joined confirmation
          if (msg.type === 'room-joined') {
            setIsWaitingInRoom(false);
            if (msg.role) setRole(msg.role as any);
            if (msg.waiting_peers) {
              setWaitingParticipants(msg.waiting_peers);
            }
            if (msg.peers) {
              const initialMap = new Map<string, MeetingParticipant>();
              msg.peers.forEach((p) => {
                initialMap.set(p.peer_id, {
                  peer_id: p.peer_id,
                  name: p.name,
                  role: p.role,
                  is_muted: p.is_muted,
                  is_video_off: p.is_video_off,
                  is_screen_sharing: p.is_screen_sharing,
                });
                createPeerConnection(p.peer_id, true);
              });
              setParticipants(initialMap);
            }
          }

          // A.1 Waiting Room Handlers
          else if (msg.type === 'waiting-room-status') {
            setIsWaitingInRoom(true);
          } else if (msg.type === 'waiting-room-admitted') {
            setIsWaitingInRoom(false);
            setRole('PARTICIPANT');
            if (msg.peers) {
              const initialMap = new Map<string, MeetingParticipant>();
              msg.peers.forEach((p) => {
                initialMap.set(p.peer_id, {
                  peer_id: p.peer_id,
                  name: p.name,
                  role: p.role,
                  is_muted: p.is_muted,
                  is_video_off: p.is_video_off,
                  is_screen_sharing: p.is_screen_sharing,
                });
                createPeerConnection(p.peer_id, true);
              });
              setParticipants(initialMap);
            }
          } else if (msg.type === 'waiting-room-denied') {
            setIsWaitingInRoom(false);
            setIsDenied(true);
            setDeniedReason(msg.message || 'The host has denied your request to join this meeting.');
          } else if (msg.type === 'waiting-room-list') {
            if (msg.peers) {
              setWaitingParticipants(msg.peers as any);
            }
          } else if (msg.type === 'waiting-peer-joined') {
            if (msg.peer_id && msg.name) {
              setWaitingParticipants((prev) => {
                if (prev.some((p) => p.peer_id === msg.peer_id)) return prev;
                return [...prev, { peer_id: msg.peer_id!, name: msg.name! }];
              });
            }
          } else if (
            msg.type === 'waiting-peer-admitted' ||
            msg.type === 'waiting-peer-denied' ||
            msg.type === 'waiting-peer-left'
          ) {
            if (msg.peer_id) {
              setWaitingParticipants((prev) => prev.filter((p) => p.peer_id !== msg.peer_id));
            }
          }

          // B. New User Joined
          else if (msg.type === 'user-joined' && msg.peer_id) {
            setParticipants((prev) => {
              const copy = new Map(prev);
              copy.set(msg.peer_id!, {
                peer_id: msg.peer_id!,
                name: msg.name || 'Participant',
                role: (msg.role as any) || 'PARTICIPANT',
                is_muted: !!msg.is_muted,
                is_video_off: !!msg.is_video_off,
                is_screen_sharing: false,
              });
              return copy;
            });
            createPeerConnection(msg.peer_id, false);
          }

          // C. SDP Offer received
          else if (msg.type === 'offer' && msg.sender_id && msg.sdp) {
            let pc = peerConnectionsRef.current.get(msg.sender_id);
            if (!pc) pc = createPeerConnection(msg.sender_id, false);

            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));

            const queued = iceCandidateQueueRef.current.get(msg.sender_id) || [];
            for (const cand of queued) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
            iceCandidateQueueRef.current.delete(msg.sender_id);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'answer',
                  target_id: msg.sender_id,
                  sdp: answer,
                })
              );
            }
          }

          // D. SDP Answer received
          else if (msg.type === 'answer' && msg.sender_id && msg.sdp) {
            const pc = peerConnectionsRef.current.get(msg.sender_id);
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              const queued = iceCandidateQueueRef.current.get(msg.sender_id) || [];
              for (const cand of queued) {
                await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
              }
              iceCandidateQueueRef.current.delete(msg.sender_id);
            }
          }

          // E. ICE Candidate received
          else if (msg.type === 'ice-candidate' && msg.sender_id && msg.candidate) {
            const pc = peerConnectionsRef.current.get(msg.sender_id);
            if (pc && pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(() => {});
            } else {
              const list = iceCandidateQueueRef.current.get(msg.sender_id) || [];
              list.push(msg.candidate);
              iceCandidateQueueRef.current.set(msg.sender_id, list);
            }
          }

          // F. Media state changes
          else if (msg.type === 'media-state-change' && msg.peer_id) {
            setParticipants((prev) => {
              const copy = new Map(prev);
              const p = copy.get(msg.peer_id!);
              if (p) {
                if (msg.kind === 'audio') p.is_muted = !msg.enabled;
                if (msg.kind === 'video') p.is_video_off = !msg.enabled;
                if (msg.kind === 'screen') p.is_screen_sharing = !!msg.enabled;
                copy.set(msg.peer_id!, { ...p });
              }
              return copy;
            });
          }

          // G. Chat broadcast
          else if (msg.type === 'chat-broadcast') {
            const newChat: ChatMessage = {
              id: Math.random().toString(36).substring(2, 9),
              sender_id: msg.sender_id || '',
              sender_name: msg.sender_name || 'Participant',
              message: msg.message || '',
              timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChatMessages((prev) => [...prev, newChat]);
          }

          // H. Reaction
          else if (msg.type === 'reaction' && msg.emoji) {
            const rid = Math.random().toString();
            setReactionList((prev) => [...prev, { id: rid, emoji: msg.emoji!, peerId: msg.sender_id || '' }]);
            setTimeout(() => {
              setReactionList((prev) => prev.filter((r) => r.id !== rid));
            }, 2500);
          }

          // I. Host moderation commands
          else if (msg.type === 'host-command') {
            if (msg.command === 'mute-microphone') {
              if (localStreamRef.current) {
                localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
              }
              setIsMuted(true);
              alert('The host has muted your microphone.');
            } else if (msg.command === 'kicked') {
              alert('You have been removed from the meeting by the host.');
              window.location.href = '/';
            }
          }

          // J. User left
          else if (msg.type === 'user-left' && msg.peer_id) {
            const pc = peerConnectionsRef.current.get(msg.peer_id);
            if (pc) {
              pc.close();
              peerConnectionsRef.current.delete(msg.peer_id);
            }
            audioAnalysersRef.current.delete(msg.peer_id);
            setParticipants((prev) => {
              const copy = new Map(prev);
              copy.delete(msg.peer_id!);
              return copy;
            });
          }
        } catch (err) {
          console.error('Error handling WebSocket message', err);
        }
      };

      ws.onclose = () => {
        if (isUnmounted) return;
        setConnectionStatus('disconnected');
        console.warn('Signaling WebSocket closed. Scheduling reconnect...');
        const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        reconnectAttempts++;
        reconnectTimeout = setTimeout(connectSignaling, backoffDelay);
      };
    }

    connectSignaling();

    return () => {
      isUnmounted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      audioAnalysersRef.current.clear();
    };
  }, [meetingId, peerId, displayName, isHost, createPeerConnection]);

  // 6. Toggle Microphone with Dynamic Device Acquisition Fallback
  const toggleAudio = useCallback(async () => {
    const nextState = !isMuted;
    if (!nextState) {
      // Unmuting
      let audioTrack = localStreamRef.current?.getAudioTracks()[0];
      if (!audioTrack) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioTrack = stream.getAudioTracks()[0];
          if (audioTrack) {
            const validAudioTrack = audioTrack;
            if (!localStreamRef.current) {
              localStreamRef.current = new MediaStream();
            }
            localStreamRef.current.addTrack(validAudioTrack);
            setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
            attachAudioAnalyser('local', localStreamRef.current);
            peerConnectionsRef.current.forEach((pc) => {
              const sender = pc.getSenders().find((s) => s.track?.kind === 'audio');
              if (sender) {
                sender.replaceTrack(validAudioTrack);
              } else {
                pc.addTrack(validAudioTrack, localStreamRef.current!);
              }
            });
          }
        } catch (e) {
          console.warn('Could not acquire audio device for unmuting:', e);
          return;
        }
      } else {
        audioTrack.enabled = true;
      }
      setIsMuted(false);
    } else {
      // Muting
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }
      setIsMuted(true);
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'media-state-change',
          kind: 'audio',
          enabled: !nextState,
        })
      );
    }
  }, [isMuted, attachAudioAnalyser]);

  // 7. Toggle Video Camera with Dynamic Device Acquisition Fallback
  const toggleVideo = useCallback(async () => {
    const nextState = !isVideoOff;
    if (!nextState) {
      // Starting Video
      let videoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (!videoTrack) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
            const validVideoTrack = videoTrack;
            if (!localStreamRef.current) {
              localStreamRef.current = new MediaStream();
            }
            localStreamRef.current.addTrack(validVideoTrack);
            setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
            peerConnectionsRef.current.forEach((pc) => {
              const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
              if (sender) {
                sender.replaceTrack(validVideoTrack);
              } else {
                pc.addTrack(validVideoTrack, localStreamRef.current!);
              }
            });
          }
        } catch (e) {
          console.warn('Could not acquire camera device to start video:', e);
          return;
        }
      } else {
        videoTrack.enabled = true;
      }
      setIsVideoOff(false);
    } else {
      // Stopping Video
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
      }
      setIsVideoOff(true);
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'media-state-change',
          kind: 'video',
          enabled: !nextState,
        })
      );
    }
  }, [isVideoOff]);

  // 8. Device Switching (Camera & Microphone) with Track Replacement
  const switchCamera = useCallback(async (deviceId: string) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      if (!newVideoTrack) return;

      if (localStreamRef.current) {
        const oldTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldTrack) {
          localStreamRef.current.removeTrack(oldTrack);
          oldTrack.stop();
        }
        localStreamRef.current.addTrack(newVideoTrack);
        newVideoTrack.enabled = !isVideoOff;
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      }

      peerConnectionsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        } else if (localStreamRef.current) {
          pc.addTrack(newVideoTrack, localStreamRef.current);
        }
      });
    } catch (err) {
      console.error('Failed to switch camera:', err);
    }
  }, [isVideoOff]);

  const switchMicrophone = useCallback(
    async (deviceId: string) => {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });
        const newAudioTrack = newStream.getAudioTracks()[0];
        if (!newAudioTrack) return;

        if (localStreamRef.current) {
          const oldTrack = localStreamRef.current.getAudioTracks()[0];
          if (oldTrack) {
            localStreamRef.current.removeTrack(oldTrack);
            oldTrack.stop();
          }
          localStreamRef.current.addTrack(newAudioTrack);
          newAudioTrack.enabled = !isMuted;
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

          // Reattach audio analyser for new mic
          attachAudioAnalyser('local', localStreamRef.current);
        }

        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'audio');
          if (sender) {
            sender.replaceTrack(newAudioTrack);
          } else if (localStreamRef.current) {
            pc.addTrack(newAudioTrack, localStreamRef.current);
          }
        });
      } catch (err) {
        console.error('Failed to switch microphone:', err);
      }
    },
    [isMuted, attachAudioAnalyser]
  );

  // 9. Screen Sharing
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      if (cameraTrack) {
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(cameraTrack);
        });
      }
      setIsScreenSharing(false);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: 'media-state-change', kind: 'screen', enabled: false })
        );
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({ type: 'media-state-change', kind: 'screen', enabled: true })
          );
        }
      } catch (err) {
        console.warn('Screen share cancelled or failed', err);
      }
    }
  }, [isScreenSharing]);

  // 10. Chat Message & Reactions
  const sendChatMessage = useCallback(
    (text: string) => {
      if (!text.trim() || wsRef.current?.readyState !== WebSocket.OPEN) return;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      wsRef.current.send(
        JSON.stringify({
          type: 'chat-broadcast',
          sender_name: displayName,
          message: text.trim(),
          timestamp,
        })
      );
    },
    [displayName]
  );

  const sendReaction = useCallback((emoji: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'reaction',
          emoji,
        })
      );
    }
  }, []);

  // 11. Host Moderation Actions
  const muteAllParticipants = useCallback(() => {
    if (role !== 'HOST') return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'host-action',
          action: 'mute_all',
        })
      );
    }
  }, [role]);

  const kickParticipant = useCallback(
    (targetPeerId: string) => {
      if (role !== 'HOST') return;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'host-action',
            action: 'kick_user',
            target_peer_id: targetPeerId,
          })
        );
      }
    },
    [role]
  );

  // 12. Waiting Room Host Actions
  const admitParticipant = useCallback((targetPeerId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'host-action',
          action: 'admit_peer',
          target_peer_id: targetPeerId,
        })
      );
    }
  }, []);

  const denyParticipant = useCallback((targetPeerId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'host-action',
          action: 'deny_peer',
          target_peer_id: targetPeerId,
        })
      );
    }
  }, []);

  const admitAllParticipants = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'host-action',
          action: 'admit_all',
        })
      );
    }
  }, []);

  return {
    peerId,
    role,
    localStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    participants: Array.from(participants.values()),
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
  };
}
