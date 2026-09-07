import asyncio
from datetime import datetime, timedelta, timezone
import uuid
import logging

from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User
from app.models.meeting import Meeting
from app.models.participant import MeetingParticipant
from app.config import settings

logger = logging.getLogger("seeder")

async def seed_database_internal():
    """Idempotent seeder that populates default user and realistic mock meetings."""
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        
        # Check if default user exists
        result = await session.execute(select(User).where(User.email == settings.DEFAULT_USER_EMAIL))
        user = result.scalars().first()

        if not user:
            logger.info(f"Seeding default user: {settings.DEFAULT_USER_NAME}...")
            user = User(
                id=str(uuid.uuid4()),
                email=settings.DEFAULT_USER_EMAIL,
                display_name=settings.DEFAULT_USER_NAME,
                plan=settings.DEFAULT_USER_PLAN,
                pmi=settings.DEFAULT_USER_PMI,
                avatar_initial=settings.DEFAULT_USER_AVATAR,
                is_default=True
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            logger.info("Default user seeded successfully.")

        # Check if meetings exist
        result = await session.execute(select(Meeting).where(Meeting.host_id == user.id))
        meetings = result.scalars().all()

        if len(meetings) == 0:
            logger.info("Seeding realistic upcoming and past meetings...")
            now = datetime.now(timezone.utc)

            # Upcoming Meeting 1 (In 2 hours)
            m1 = Meeting(
                id=str(uuid.uuid4()),
                meeting_code="842 4910 2931",
                title="Sprint Planning & Demo Review",
                description="Review sprint deliverables and demonstrate Zoom Clone features.",
                host_id=user.id,
                meeting_type="SCHEDULED",
                status="SCHEDULED",
                scheduled_start=now + timedelta(hours=2),
                duration_minutes=40,
                passcode="gTfEu4",
                host_token=str(uuid.uuid4()),
                enable_waiting_room=False
            )

            # Upcoming Meeting 2 (Tomorrow 10:00 AM)
            tomorrow = (now + timedelta(days=1)).replace(hour=4, minute=30, second=0, microsecond=0) # 10:00 AM IST
            m2 = Meeting(
                id=str(uuid.uuid4()),
                meeting_code="519 3028 4710",
                title="Architecture Review: Scaler Video Engine",
                description="Technical review of WebRTC mesh topology, signaling latency, and SQLite WAL.",
                host_id=user.id,
                meeting_type="SCHEDULED",
                status="SCHEDULED",
                scheduled_start=tomorrow,
                duration_minutes=60,
                passcode="x8KdP2",
                host_token=str(uuid.uuid4()),
                enable_waiting_room=True
            )

            # Upcoming Meeting 3 (Weekly All-Hands in 3 days)
            all_hands = now + timedelta(days=3)
            m3 = Meeting(
                id=str(uuid.uuid4()),
                meeting_code="739 1048 2901",
                title="Weekly Engineering All-Hands",
                description="Company-wide updates and Q&A session.",
                host_id=user.id,
                meeting_type="SCHEDULED",
                status="SCHEDULED",
                scheduled_start=all_hands,
                duration_minutes=45,
                passcode="zoom99",
                host_token=str(uuid.uuid4()),
                enable_waiting_room=False
            )

            # Past Meeting 1 (Completed Yesterday)
            yesterday = now - timedelta(days=1)
            m4 = Meeting(
                id=str(uuid.uuid4()),
                meeting_code="620 9481 3820",
                title="Client Product Demo & Discussion",
                description="Live demonstration of video streaming and screen sharing capabilities.",
                host_id=user.id,
                meeting_type="SCHEDULED",
                status="ENDED",
                scheduled_start=yesterday,
                duration_minutes=45,
                passcode="demo12",
                host_token=str(uuid.uuid4()),
                enable_waiting_room=False,
                started_at=yesterday,
                ended_at=yesterday + timedelta(minutes=45)
            )

            # Past Meeting 2 (Completed 2 days ago)
            two_days_ago = now - timedelta(days=2)
            m5 = Meeting(
                id=str(uuid.uuid4()),
                meeting_code="491 2840 1928",
                title="Design System Alignment: Zoom Workplace",
                description="Alignment on UI tokens, color palettes, and component responsiveness.",
                host_id=user.id,
                meeting_type="SCHEDULED",
                status="ENDED",
                scheduled_start=two_days_ago,
                duration_minutes=30,
                passcode="ui2026",
                host_token=str(uuid.uuid4()),
                enable_waiting_room=False,
                started_at=two_days_ago,
                ended_at=two_days_ago + timedelta(minutes=30)
            )

            session.add_all([m1, m2, m3, m4, m5])
            await session.commit()
            logger.info("Sample upcoming and past meetings seeded successfully.")

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database_internal()
    await engine.dispose()
    print("Database seeding completed.")

if __name__ == "__main__":
    asyncio.run(main())
