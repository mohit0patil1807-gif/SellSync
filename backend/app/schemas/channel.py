from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class ChannelBase(BaseModel):
    code: str
    name: str
    category: str
    status: str
    icon_slug: Optional[str] = None
    description: Optional[str] = None
    is_demo: bool = True

class ChannelResponse(ChannelBase):
    id: int
    capabilities_json: str
    last_sync_at: Optional[datetime] = None
    error_details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChannelToggleDemoRequest(BaseModel):
    status: str # CONNECTED, DEMO_MODE, NOT_CONNECTED, SYNC_ISSUE
