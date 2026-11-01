from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_reference = Column(String(100), unique=True, index=True, nullable=False) # e.g. PAY-90218
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="UPI") # UPI, Card, NetBanking, COD, Marketplace_Wallet
    gateway_reference = Column(String(100), nullable=True) # Simulated gateway ID or bank UTR
    verification_status = Column(String(50), default="PENDING", index=True) # PENDING, VERIFIED, FAILED, MISMATCH, REFUNDED
    settlement_status = Column(String(50), default="PENDING") # PENDING, SETTLED, WITHHELD
    transaction_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    failure_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payments")

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    settlement_reference = Column(String(100), unique=True, index=True, nullable=False) # e.g. STL-AMZ-OCT-26
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    gross_amount = Column(Float, nullable=False)
    deductions = Column(Float, default=0.0) # Platform commission, shipping fees, GST
    net_settlement = Column(Float, nullable=False) # gross - deductions
    settlement_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="COMPLETED") # PENDING, COMPLETED, DISPUTED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    channel = relationship("Channel")
