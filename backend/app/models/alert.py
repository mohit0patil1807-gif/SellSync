from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.db.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False) # LOW_STOCK, PAYMENT_MISMATCH, SYNC_FAILURE, EXCEPTION
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="WARNING") # CRITICAL, WARNING, INFO
    status = Column(String(20), default="OPEN") # OPEN, RESOLVED, DISMISSED
    reference_type = Column(String(50), nullable=True) # ORDER, PRODUCT, CHANNEL, PAYMENT
    reference_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
