from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    avatar_initial = Column(String(5), default="S")
    plan = Column(String(50), default="Workplace Basic")
    pmi = Column(String(20), unique=True, index=True, nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    meetings = relationship("Meeting", back_populates="host", cascade="all, delete-orphan")
    participants = relationship("MeetingParticipant", back_populates="user")
