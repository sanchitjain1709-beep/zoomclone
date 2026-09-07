from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class InstantMeetingCreate(BaseModel):
    title: Optional[str] = "Sanchit Jain's Zoom Meeting"
    use_pmi: Optional[bool] = False

class ScheduleMeetingRequest(BaseModel):
    title: str = Field(default="My Meeting", min_length=1, max_length=255)
    description: Optional[str] = None
    scheduled_start: datetime
    duration_minutes: int = Field(default=40, ge=5, le=1440)
    passcode: Optional[str] = Field(default="gTfEu4", max_length=20)
    enable_waiting_room: bool = False
    use_pmi: bool = False

class MeetingParticipantOut(BaseModel):
    id: str
    peer_id: str
    display_name: str
    role: str
    is_muted: bool
    is_video_off: bool
    is_screen_sharing: bool
    joined_at: datetime
    left_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class MeetingOut(BaseModel):
    id: str
    meeting_code: str
    title: str
    description: Optional[str] = None
    host_id: str
    host_display_name: Optional[str] = None
    meeting_type: str
    status: str
    scheduled_start: Optional[datetime] = None
    duration_minutes: int
    passcode: Optional[str] = None
    host_token: Optional[str] = None
    enable_waiting_room: bool
    invite_link: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime
    participant_count: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)

class MeetingValidateResponse(BaseModel):
    exists: bool
    meeting: Optional[MeetingOut] = None
    message: Optional[str] = None
