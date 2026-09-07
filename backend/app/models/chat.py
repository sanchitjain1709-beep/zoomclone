from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sender_name = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    is_private = Column(Boolean, default=False)
    recipient_id = Column(String(64), nullable=True)
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    meeting = relationship("Meeting", back_populates="chat_messages")
