from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # e.g. Apparel & Fashion, Food & Beverages, Home & Kitchen
    image_url = Column(String(500), nullable=True)
    base_price = Column(Float, nullable=False)
    stock_on_hand = Column(Integer, default=0, nullable=False)
    reserved_stock = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=10, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def available_stock(self) -> int:
        return max(0, self.stock_on_hand - self.reserved_stock)

    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    channel_listings = relationship("ChannelListing", back_populates="product", cascade="all, delete-orphan")
    stock_movements = relationship("StockMovement", back_populates="product", cascade="all, delete-orphan")

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    variant_name = Column(String(100), nullable=False) # e.g. "Size M / Olive Green"
    option_name = Column(String(50), default="Size")
    option_value = Column(String(50), nullable=False) # e.g. "M"
    price = Column(Float, nullable=False)
    stock_on_hand = Column(Integer, default=0, nullable=False)
    reserved_stock = Column(Integer, default=0, nullable=False)

    @property
    def available_stock(self) -> int:
        return max(0, self.stock_on_hand - self.reserved_stock)

    product = relationship("Product", back_populates="variants")

class ChannelListing(Base):
    __tablename__ = "channel_listings"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    channel_id = Column(Integer, ForeignKey("channels.id", ondelete="CASCADE"), nullable=False)
    external_listing_id = Column(String(100), nullable=False) # e.g. "B09WXYZ123" on Amazon
    external_sku = Column(String(100), nullable=True)
    channel_price = Column(Float, nullable=False)
    sync_status = Column(String(50), default="SYNCED") # SYNCED, PENDING, SYNC_FAILED
    last_synced_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="channel_listings")
    channel = relationship("Channel")

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    change_qty = Column(Integer, nullable=False) # positive or negative
    reason = Column(String(100), nullable=False) # ORDER_RESERVED, ORDER_FULFILLED, RESTOCK, MANUAL_ADJUSTMENT, RETURN
    reference_type = Column(String(50), nullable=True) # ORDER, ADJUSTMENT, SHIPMENT
    reference_id = Column(String(100), nullable=True) # e.g. Order ID
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="stock_movements")
