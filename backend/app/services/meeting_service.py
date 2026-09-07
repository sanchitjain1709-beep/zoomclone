from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from app.models.meeting import Meeting
from app.models.user import User
from app.schemas.meeting_schema import (
    InstantMeetingCreate,
    ScheduleMeetingRequest,
    MeetingOut,
    MeetingValidateResponse
)
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.user_repository import UserRepository
from app.utils.meeting_code import generate_meeting_code, normalize_meeting_code

class MeetingService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.meeting_repo = MeetingRepository(session)
        self.user_repo = UserRepository(session)

    def _format_meeting_out(self, meeting: Meeting, base_url: str = "http://localhost:3000") -> MeetingOut:
        clean_code = meeting.meeting_code.replace(" ", "")
        invite_link = f"{base_url}/lobby/{clean_code}"
        host_name = meeting.host.display_name if meeting.host else "Sanchit Jain"
        participant_count = len(meeting.participants) if meeting.participants else 0

        return MeetingOut(
            id=meeting.id,
            meeting_code=meeting.meeting_code,
            title=meeting.title,
            description=meeting.description,
            host_id=meeting.host_id,
            host_display_name=host_name,
            meeting_type=meeting.meeting_type,
            status=meeting.status,
            scheduled_start=meeting.scheduled_start,
            duration_minutes=meeting.duration_minutes,
            passcode=meeting.passcode,
            host_token=meeting.host_token,
            enable_waiting_room=meeting.enable_waiting_room,
            invite_link=invite_link,
            started_at=meeting.started_at,
            ended_at=meeting.ended_at,
            created_at=meeting.created_at,
            participant_count=participant_count
        )

    async def create_instant_meeting(self, request: InstantMeetingCreate) -> MeetingOut:
        # Fetch or create default user
        user = await self.user_repo.get_default_user()
        if not user:
            raise ValueError("Default user not found. Please run database seeder.")

        if request.use_pmi and user.pmi:
            meeting_code = user.pmi
            existing = await self.meeting_repo.get_by_code(meeting_code)
            if existing:
                existing.status = "ACTIVE"
                existing.started_at = datetime.now(timezone.utc)
                await self.session.commit()
                await self.session.refresh(existing)
                return self._format_meeting_out(existing)
        else:
            # Generate unique 10-digit code
            for _ in range(5):
                candidate_code = generate_meeting_code()
                if not await self.meeting_repo.get_by_code(candidate_code):
                    meeting_code = candidate_code
                    break
            else:
                meeting_code = generate_meeting_code()

        title = request.title or f"{user.display_name}'s Zoom Meeting"
        meeting = Meeting(
            id=str(uuid.uuid4()),
            meeting_code=meeting_code,
            title=title,
            description="Instant Zoom Meeting Room",
            host_id=user.id,
            meeting_type="PMI" if request.use_pmi else "INSTANT",
            status="ACTIVE",
            scheduled_start=datetime.now(timezone.utc),
            duration_minutes=40,
            passcode="gTfEu4",
            host_token=str(uuid.uuid4()),
            enable_waiting_room=False,
            started_at=datetime.now(timezone.utc)
        )

        created_meeting = await self.meeting_repo.create(meeting)
        # Re-fetch with relations loaded
        hydrated = await self.meeting_repo.get_by_code(created_meeting.meeting_code)
        return self._format_meeting_out(hydrated or created_meeting)

    async def schedule_meeting(self, request: ScheduleMeetingRequest) -> MeetingOut:
        user = await self.user_repo.get_default_user()
        if not user:
            raise ValueError("Default user not found. Please run database seeder.")

        if request.use_pmi and user.pmi:
            meeting_code = user.pmi
        else:
            for _ in range(5):
                candidate_code = generate_meeting_code()
                if not await self.meeting_repo.get_by_code(candidate_code):
                    meeting_code = candidate_code
                    break
            else:
                meeting_code = generate_meeting_code()

        meeting = Meeting(
            id=str(uuid.uuid4()),
            meeting_code=meeting_code,
            title=request.title,
            description=request.description,
            host_id=user.id,
            meeting_type="PMI" if request.use_pmi else "SCHEDULED",
            status="SCHEDULED",
            scheduled_start=request.scheduled_start,
            duration_minutes=request.duration_minutes,
            passcode=request.passcode or "gTfEu4",
            host_token=str(uuid.uuid4()),
            enable_waiting_room=request.enable_waiting_room
        )

        created_meeting = await self.meeting_repo.create(meeting)
        hydrated = await self.meeting_repo.get_by_code(created_meeting.meeting_code)
        return self._format_meeting_out(hydrated or created_meeting)

    async def validate_meeting(self, raw_code: str) -> MeetingValidateResponse:
        normalized = normalize_meeting_code(raw_code)
        # Try both normalized code and direct match
        meeting = await self.meeting_repo.get_by_code(normalized)
        if not meeting:
            # Try searching without spaces
            clean = raw_code.replace(" ", "").replace("-", "")
            for m in await self.meeting_repo.list_all():
                if m.meeting_code.replace(" ", "").replace("-", "") == clean:
                    meeting = m
                    break

        if not meeting:
            return MeetingValidateResponse(
                exists=False,
                meeting=None,
                message=f"Meeting '{raw_code}' was not found. Please check the Meeting ID and try again."
            )

        if meeting.status == "ENDED":
            return MeetingValidateResponse(
                exists=False,
                meeting=None,
                message="This meeting has already ended."
            )

        hydrated = await self.meeting_repo.get_by_code(meeting.meeting_code)
        return MeetingValidateResponse(
            exists=True,
            meeting=self._format_meeting_out(hydrated or meeting),
            message="Meeting is valid and ready to join."
        )

    async def list_upcoming(self) -> List[MeetingOut]:
        meetings = await self.meeting_repo.get_upcoming_meetings()
        return [self._format_meeting_out(m) for m in meetings]

    async def list_recent(self) -> List[MeetingOut]:
        meetings = await self.meeting_repo.get_recent_meetings()
        return [self._format_meeting_out(m) for m in meetings]

    async def delete_meeting(self, meeting_id: str) -> bool:
        meeting = await self.meeting_repo.get_by_id(meeting_id)
        if not meeting:
            return False
        await self.meeting_repo.delete(meeting)
        return True
