from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProductVariantSchema(BaseModel):
    id: Optional[int] = None
    sku: str
    variant_name: str
    option_name: str
    option_value: str
    price: float
    stock_on_hand: int
    reserved_stock: int
    available_stock: int

    class Config:
        from_attributes = True

class ChannelListingSchema(BaseModel):
    id: int
    channel_id: int
    channel_name: Optional[str] = None
    channel_code: Optional[str] = None
    external_listing_id: str
    external_sku: Optional[str] = None
    channel_price: float
    sync_status: str
    last_synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    sku: str
    name: str
    category: str
    image_url: Optional[str] = None
    base_price: float
    stock_on_hand: int = 0
    reserved_stock: int = 0
    low_stock_threshold: int = 10
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    base_price: Optional[float] = None
    low_stock_threshold: Optional[int] = None
    description: Optional[str] = None

class StockAdjustmentRequest(BaseModel):
    change_qty: int # e.g. +10 or -5
    reason: str # RESTOCK, DAMAGE, AUDIT_CORRECTION, MANUAL_ADJUSTMENT
    notes: Optional[str] = None

class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    change_qty: int
    reason: str
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProductResponse(ProductBase):
    id: int
    available_stock: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    variants: List[ProductVariantSchema] = []
    channel_listings: List[ChannelListingSchema] = []

    class Config:
        from_attributes = True
