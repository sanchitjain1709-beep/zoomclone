export interface User {
  id: string;
  email: string;
  display_name: string;
  plan: string;
  pmi: string;
  avatar_initial: string;
  avatar_url?: string;
  is_default: boolean;
  created_at: string;
}

export interface Meeting {
  id: string;
  meeting_code: string;
  title: string;
  description?: string;
  host_id: string;
  host_display_name?: string;
  meeting_type: 'INSTANT' | 'SCHEDULED' | 'PMI';
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED';
  scheduled_start?: string;
  duration_minutes: number;
  passcode?: string;
  host_token?: string;
  enable_waiting_room: boolean;
  invite_link?: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  participant_count?: number;
}

export interface MeetingParticipant {
  peer_id: string;
  name: string;
  role: 'HOST' | 'CO_HOST' | 'PARTICIPANT';
  is_muted: boolean;
  is_video_off: boolean;
  is_screen_sharing: boolean;
  stream?: MediaStream;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  is_private?: boolean;
}

export interface SignalingMessage {
  type: string;
  sender_id?: string;
  sender_name?: string;
  target_id?: string;
  peer_id?: string;
  meeting_id?: string;
  name?: string;
  role?: string;
  is_muted?: boolean;
  is_video_off?: boolean;
  is_screen_sharing?: boolean;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  kind?: 'audio' | 'video' | 'screen';
  enabled?: boolean;
  message?: string;
  timestamp?: string;
  action?: string;
  command?: string;
  emoji?: string;
  peers?: Array<{
    peer_id: string;
    name: string;
    role: 'HOST' | 'CO_HOST' | 'PARTICIPANT';
    is_muted: boolean;
    is_video_off: boolean;
    is_screen_sharing: boolean;
  }>;
  waiting_peers?: Array<{
    peer_id: string;
    name: string;
  }>;
  result?: any;
}
