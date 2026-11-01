from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.channel import ChannelResponse

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    sku: str
    title: str
    variant_title: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True

class OrderActivityResponse(BaseModel):
    id: int
    order_id: int
    action: str
    description: str
    actor: str
    created_at: datetime

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    external_order_id: str
    channel_id: int
    channel: Optional[ChannelResponse] = None
    
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_address: Optional[str] = None
    delivery_city: Optional[str] = None
    delivery_pincode: Optional[str] = None
    
    order_type: str
    channel_status: Optional[str] = None
    status: str
    payment_status: str
    fulfilment_status: str
    
    currency: str
    subtotal: float
    discount: float
    shipping_fee: float
    tax: float
    total_amount: float
    
    internal_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    items: List[OrderItemResponse] = []
    activity_logs: List[OrderActivityResponse] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class ManualOrderItemCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = 1

class ManualOrderCreate(BaseModel):
    channel_code: str = "direct"
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_address: str
    delivery_city: str
    delivery_pincode: str
    order_type: str = "courier"
    items: List[ManualOrderItemCreate]
    internal_notes: Optional[str] = None

class ChatParseRequest(BaseModel):
    chat_text: str

class QuickChatOrderCreate(BaseModel):
    channel_code: str = "whatsapp"
    customer_name: str
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    delivery_address: str
    delivery_city: str = "Mumbai"
    delivery_pincode: str
    order_type: str = "courier"
    items: List[ManualOrderItemCreate]
    internal_notes: Optional[str] = None
    shipping_fee: float = 0.0
