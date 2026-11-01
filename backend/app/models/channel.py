from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from app.db.session import Base

class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. amazon, flipkart, meesho, myntra, swiggy, zomato, instagram, whatsapp, direct
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False) # marketplace, food_delivery, social_commerce, direct
    status = Column(String(50), default="DEMO_MODE") # CONNECTED, DEMO_MODE, NOT_CONNECTED, SYNC_ISSUE
    icon_slug = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    capabilities_json = Column(Text, default="[]") # JSON list of supported capabilities
    last_sync_at = Column(DateTime, default=datetime.utcnow)
    error_details = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=True)
    connection_config_json = Column(Text, default="{}") # Safe non-secret simulated config
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
