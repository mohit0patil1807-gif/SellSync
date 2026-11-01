from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ShipmentResponse(BaseModel):
    id: int
    order_id: int
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    tracking_url: Optional[str] = None
    shipping_label_id: Optional[str] = None
    packing_status: str
    status: str
    dispatch_date: Optional[datetime] = None
    estimated_delivery: Optional[datetime] = None
    delivery_handover_code: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DispatchOrderRequest(BaseModel):
    courier_name: Optional[str] = "Delhivery Express"
    notes: Optional[str] = None

class TrackingNotificationPreview(BaseModel):
    recipient_name: str
    recipient_phone: Optional[str] = None
    recipient_email: Optional[str] = None
    tracking_number: str
    courier_name: str
    tracking_url: str
    estimated_delivery: str
    message_body: str
    channel_type: str # WhatsApp, SMS, Email
