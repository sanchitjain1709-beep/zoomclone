from pydantic import BaseModel
from typing import Optional, Any, Dict, List

class SignalingMessage(BaseModel):
    type: str  # join-room, offer, answer, ice-candidate, media-state, chat, host-action, leave
    sender_id: Optional[str] = None
    target_id: Optional[str] = None
    meeting_id: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = "PARTICIPANT"
    sdp: Optional[Dict[str, Any]] = None
    candidate: Optional[Dict[str, Any]] = None
    kind: Optional[str] = None  # audio, video
    enabled: Optional[bool] = None
    message: Optional[str] = None
    action: Optional[str] = None  # mute_all, mute_user, kick_user, lock_room
    host_token: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
