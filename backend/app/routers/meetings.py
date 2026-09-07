from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.meeting_schema import (
    InstantMeetingCreate,
    ScheduleMeetingRequest,
    MeetingOut,
    MeetingValidateResponse
)
from app.services.meeting_service import MeetingService

router = APIRouter(prefix="/meetings", tags=["Meetings"])

@router.post("/instant", response_model=MeetingOut)
async def create_instant_meeting(
    request: InstantMeetingCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new instant Zoom meeting room with a unique 10-digit ID."""
    service = MeetingService(db)
    try:
        return await service.create_instant_meeting(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/schedule", response_model=MeetingOut)
async def schedule_meeting(
    request: ScheduleMeetingRequest,
    db: AsyncSession = Depends(get_db)
):
    """Schedule a future Zoom meeting."""
    service = MeetingService(db)
    try:
        return await service.schedule_meeting(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/upcoming", response_model=List[MeetingOut])
async def list_upcoming_meetings(db: AsyncSession = Depends(get_db)):
    """Fetch scheduled upcoming meetings."""
    service = MeetingService(db)
    return await service.list_upcoming()

@router.get("/recent", response_model=List[MeetingOut])
async def list_recent_meetings(db: AsyncSession = Depends(get_db)):
    """Fetch recent/past completed meetings."""
    service = MeetingService(db)
    return await service.list_recent()

@router.get("/validate/{code}", response_model=MeetingValidateResponse)
async def validate_meeting_code(
    code: str,
    db: AsyncSession = Depends(get_db)
):
    """Validate whether a meeting exists and is open for joining."""
    service = MeetingService(db)
    return await service.validate_meeting(code)

@router.delete("/{meeting_id}")
async def delete_meeting(meeting_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a scheduled meeting."""
    service = MeetingService(db)
    success = await service.delete_meeting(meeting_id)
    if not success:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    return {"success": True, "message": "Meeting deleted successfully."}
