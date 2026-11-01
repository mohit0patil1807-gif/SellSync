from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False) # Internal ID: SS-1001
    external_order_id = Column(String(100), index=True, nullable=False) # e.g. AMZ-403-918231
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    
    customer_name = Column(String(150), nullable=False)
    customer_email = Column(String(150), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    delivery_address = Column(Text, nullable=True)
    delivery_city = Column(String(100), nullable=True)
    delivery_pincode = Column(String(20), nullable=True)
    
    order_type = Column(String(50), default="courier") # "courier" for ecommerce physical, "handover" for restaurant food
    channel_status = Column(String(100), nullable=True) # Native marketplace status string
    status = Column(String(50), default="NEW", index=True) # Normalized status: NEW, AWAITING_PAYMENT, CONFIRMED, PROCESSING, READY_TO_DISPATCH, DISPATCHED, DELIVERED, CANCELLED, RETURNED, REFUNDED, EXCEPTION
    payment_status = Column(String(50), default="PENDING", index=True) # PENDING, VERIFIED, FAILED, MISMATCH, REFUNDED
    fulfilment_status = Column(String(50), default="UNFULFILLED", index=True) # UNFULFILLED, PACKED, SHIPPED, DELIVERED, CANCELLED
    
    currency = Column(String(10), default="INR")
    subtotal = Column(Float, default=0.0, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    shipping_fee = Column(Float, default=0.0, nullable=False)
    tax = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, default=0.0, nullable=False)
    
    internal_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    channel = relationship("Channel")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    activity_logs = relationship("OrderActivityLog", back_populates="order", cascade="all, delete-orphan", order_by="OrderActivityLog.created_at.desc()")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    shipments = relationship("Shipment", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    
    sku = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    variant_title = Column(String(100), nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, default=0.0, nullable=False)
    total_price = Column(Float, default=0.0, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")

class OrderActivityLog(Base):
    __tablename__ = "order_activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=False) # e.g. ORDER_CREATED, PAYMENT_VERIFIED, SHIPMENT_DISPATCHED
    description = Column(Text, nullable=False)
    actor = Column(String(100), default="System") # System, Seller Admin, Automation Rule, Connector
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="activity_logs")
