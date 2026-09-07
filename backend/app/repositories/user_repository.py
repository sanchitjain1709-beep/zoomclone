from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.repositories.base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_default_user(self) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.is_default == True))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_by_pmi(self, pmi: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.pmi == pmi))
        return result.scalars().first()
