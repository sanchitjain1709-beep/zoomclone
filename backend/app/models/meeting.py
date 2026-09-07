from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_code = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False, default="My Meeting")
    description = Column(Text, nullable=True)
    host_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    meeting_type = Column(String(20), default="SCHEDULED")  # INSTANT, SCHEDULED, PMI
    status = Column(String(20), default="SCHEDULED")        # SCHEDULED, ACTIVE, ENDED
    scheduled_start = Column(DateTime, nullable=True, index=True)
    duration_minutes = Column(Integer, default=40)
    passcode = Column(String(20), nullable=True)
    host_token = Column(String(64), nullable=False, default=lambda: str(uuid.uuid4()))
    enable_waiting_room = Column(Boolean, default=False)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    host = relationship("User", back_populates="meetings")
    participants = relationship("MeetingParticipant", back_populates="meeting", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="meeting", cascade="all, delete-orphan")

    # Composite Index for upcoming/recent meeting queries
    __table_args__ = (
        Index("idx_meetings_status_start", "status", "scheduled_start"),
    )
