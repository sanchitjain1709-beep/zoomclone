from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user_schema import UserOut, UserUpdate
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserOut)
async def get_current_user(db: AsyncSession = Depends(get_db)):
    """Fetch the default logged-in evaluator user (Sanchit Jain)."""
    user_repo = UserRepository(db)
    user = await user_repo.get_default_user()
    if not user:
        raise HTTPException(status_code=404, detail="Default user not initialized. Please seed the database.")
    return user

@router.put("/me", response_model=UserOut)
async def update_current_user(update: UserUpdate, db: AsyncSession = Depends(get_db)):
    """Update profile information."""
    user_repo = UserRepository(db)
    user = await user_repo.get_default_user()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if update.display_name is not None:
        user.display_name = update.display_name
    if update.avatar_url is not None:
        user.avatar_url = update.avatar_url
    await db.commit()
    await db.refresh(user)
    return user
