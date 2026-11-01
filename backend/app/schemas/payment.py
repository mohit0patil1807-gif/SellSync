from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentResponse(BaseModel):
    id: int
    payment_reference: str
    order_id: int
    amount: float
    payment_method: str
    gateway_reference: Optional[str] = None
    verification_status: str
    settlement_status: str
    transaction_date: datetime
    notes: Optional[str] = None
    failure_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SettlementResponse(BaseModel):
    id: int
    settlement_reference: str
    channel_id: int
    channel_name: Optional[str] = None
    gross_amount: float
    deductions: float
    net_settlement: float
    settlement_date: datetime
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentSimulateRequest(BaseModel):
    action: str # "verify", "fail", "mismatch"
    simulated_amount: Optional[float] = None
    notes: Optional[str] = None

class PaymentMatchRequest(BaseModel):
    amount: float
    reference: Optional[str] = None
    customer_hint: Optional[str] = None

