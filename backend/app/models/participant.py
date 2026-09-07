from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.database import Base

class MeetingParticipant(Base):
    __tablename__ = "meeting_participants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    peer_id = Column(String(64), nullable=False)
    display_name = Column(String(100), nullable=False)
    role = Column(String(20), default="PARTICIPANT")  # HOST, CO_HOST, PARTICIPANT
    is_muted = Column(Boolean, default=True)
    is_video_off = Column(Boolean, default=True)
    is_screen_sharing = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    left_at = Column(DateTime, nullable=True)

    # Relationships
    meeting = relationship("Meeting", back_populates="participants")
    user = relationship("User", back_populates="participants")

    __table_args__ = (
        Index("idx_participants_meeting_active", "meeting_id", "left_at"),
    )
