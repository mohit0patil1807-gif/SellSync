from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AutomationLogResponse(BaseModel):
    id: int
    rule_id: int
    event_type: str
    order_id: Optional[int] = None
    product_id: Optional[int] = None
    status: str
    details: str
    created_at: datetime

    class Config:
        from_attributes = True

class AutomationRuleResponse(BaseModel):
    id: int
    code: str
    rule_name: str
    description: str
    trigger_event: str
    action_type: str
    is_enabled: bool
    total_executions: int
    last_executed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AutomationToggleRequest(BaseModel):
    is_enabled: bool
