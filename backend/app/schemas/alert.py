from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertResponse(BaseModel):
    id: int
    alert_type: str
    title: str
    description: str
    severity: str
    status: str
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AlertResolveRequest(BaseModel):
    status: str = "RESOLVED"
