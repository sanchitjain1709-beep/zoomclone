from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from app.models.meeting import Meeting
from app.repositories.base_repository import BaseRepository

class MeetingRepository(BaseRepository[Meeting]):
    def __init__(self, session: AsyncSession):
        super().__init__(Meeting, session)

    async def get_by_code(self, code: str) -> Optional[Meeting]:
        result = await self.session.execute(
            select(Meeting)
            .options(selectinload(Meeting.host), selectinload(Meeting.participants))
            .where(Meeting.meeting_code == code)
        )
        return result.scalars().first()

    async def get_by_id_with_relations(self, id: str) -> Optional[Meeting]:
        result = await self.session.execute(
            select(Meeting)
            .options(selectinload(Meeting.host), selectinload(Meeting.participants))
            .where(Meeting.id == id)
        )
        return result.scalars().first()

    async def get_upcoming_meetings(self) -> List[Meeting]:
        now = datetime.now(timezone.utc)
        result = await self.session.execute(
            select(Meeting)
            .options(selectinload(Meeting.host), selectinload(Meeting.participants))
            .where(
                and_(
                    Meeting.status.in_(["SCHEDULED", "ACTIVE"]),
                    or_(
                        Meeting.scheduled_start >= now,
                        Meeting.status == "ACTIVE"
                    )
                )
            )
            .order_by(Meeting.scheduled_start.asc(), Meeting.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_recent_meetings(self, limit: int = 10) -> List[Meeting]:
        now = datetime.now(timezone.utc)
        result = await self.session.execute(
            select(Meeting)
            .options(selectinload(Meeting.host), selectinload(Meeting.participants))
            .where(
                or_(
                    Meeting.status == "ENDED",
                    and_(Meeting.status == "SCHEDULED", Meeting.scheduled_start < now)
                )
            )
            .order_by(desc(Meeting.started_at), desc(Meeting.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())
