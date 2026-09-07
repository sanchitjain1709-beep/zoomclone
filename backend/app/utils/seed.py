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

        logger.info("Database initialized with user profile (no mock meetings).")

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database_internal()
    await engine.dispose()
    print("Database seeding completed.")

if __name__ == "__main__":
    asyncio.run(main())
