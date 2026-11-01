from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    rule_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    trigger_event = Column(String(100), nullable=False) # PAYMENT_VERIFIED, STOCK_BELOW_THRESHOLD, SHIPMENT_DISPATCHED, CHANNEL_SYNC_ERROR
    action_type = Column(String(100), nullable=False) # CONFIRM_ORDER, CREATE_STOCK_ALERT, PREPARE_TRACKING_NOTIFICATION, CREATE_EXCEPTION_ALERT
    condition_config_json = Column(Text, default="{}")
    is_enabled = Column(Boolean, default=True)
    total_executions = Column(Integer, default=0)
    last_executed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    logs = relationship("AutomationLog", back_populates="rule", cascade="all, delete-orphan", order_by="AutomationLog.created_at.desc()")

class AutomationLog(Base):
    __tablename__ = "automation_logs"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("automation_rules.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False)
    order_id = Column(Integer, nullable=True)
    product_id = Column(Integer, nullable=True)
    status = Column(String(50), default="SUCCESS") # SUCCESS, SKIPPED, FAILED
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    rule = relationship("AutomationRule", back_populates="logs")
