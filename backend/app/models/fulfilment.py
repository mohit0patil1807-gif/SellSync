from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    tracking_number = Column(String(100), unique=True, index=True, nullable=True) # e.g. DEL-90218302
    courier_name = Column(String(100), nullable=True) # Delhivery, BlueDart, Xpressbees, Shadowfax, Rider Delivery
    tracking_url = Column(String(500), nullable=True)
    shipping_label_id = Column(String(100), nullable=True)
    packing_status = Column(String(50), default="PENDING") # PENDING, PACKED, HANDOVER_READY
    status = Column(String(50), default="LABEL_CREATED") # LABEL_CREATED, PICKED_UP, IN_TRANSIT, DELIVERED, EXCEPTION
    dispatch_date = Column(DateTime, nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    delivery_handover_code = Column(String(50), nullable=True) # OTP / Handover PIN for restaurant riders
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="shipments")
