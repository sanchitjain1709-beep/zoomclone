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

        # Check if sample meetings exist
        result_meetings = await session.execute(select(Meeting))
        existing_meetings = result_meetings.scalars().all()

        if not existing_meetings:
            logger.info("Seeding sample upcoming and recent meetings...")
            now = datetime.now(timezone.utc)
            
            # 1. Upcoming Meeting Tomorrow
            upcoming_1 = Meeting(
                id=str(uuid.uuid4()),
                meeting_code="842 4910 2931",
                title="Weekly Engineering Sync",
                description="Review architecture milestones, release candidates, and WebRTC performance",
                host_id=user.id,
                meeting_type="SCHEDULED",
                status="SCHEDULED",
                scheduled_start=now + timedelta(days=1, hours=2),
                duration_minutes=45,
                passcode="gTfEu4",
                enable_waiting_room=True,
                created_at=now - timedelta(days=1)
            )

            # 2. Upcoming Meeting in 3 Days
            upcoming_2 = Meeting(
                id=str(uuid.uuid4()),
                meeting_code="519 2843 1072",
                title="Product Design Review",
                description="Walkthrough new waiting room and gallery UI mockups with design team",
                host_id=user.id,
                meeting_type="SCHEDULED",
                status="SCHEDULED",
                scheduled_start=now + timedelta(days=3, hours=4),
                duration_minutes=30,
                passcode="zoom2026",
                enable_waiting_room=False,
                created_at=now - timedelta(days=2)
            )

            # 3. Recent Completed Meeting Yesterday
            recent_1 = Meeting(
                id=str(uuid.uuid4()),
                meeting_code="392 1084 7561",
                title="Sprint Planning & Retrospective",
                description="Sprint backlog grooming and team velocity check-in",
                host_id=user.id,
                meeting_type="INSTANT",
                status="ENDED",
                scheduled_start=now - timedelta(days=1, hours=5),
                started_at=now - timedelta(days=1, hours=5),
                ended_at=now - timedelta(days=1, hours=4, minutes=15),
                duration_minutes=45,
                passcode="retrosprint",
                created_at=now - timedelta(days=1, hours=6)
            )

            session.add_all([upcoming_1, upcoming_2, recent_1])
            await session.commit()
            logger.info("Sample upcoming and recent meetings seeded successfully.")
        else:
            logger.info("Database already contains meetings. Skipping mock seed.")

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database_internal()
    await engine.dispose()
    print("Database seeding completed.")

if __name__ == "__main__":
    asyncio.run(main())
