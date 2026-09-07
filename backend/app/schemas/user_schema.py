from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    display_name: str
    plan: Optional[str] = "Workplace Basic"
    pmi: str
    avatar_initial: Optional[str] = "S"
    avatar_url: Optional[str] = None

class UserOut(UserBase):
    id: str
    is_default: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
