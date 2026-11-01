from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.automation_service import AutomationService
from app.schemas.automation import AutomationRuleResponse, AutomationLogResponse, AutomationToggleRequest
from typing import List

router = APIRouter(prefix="/automations", tags=["Automation Centre"])

@router.get("", response_model=List[AutomationRuleResponse])
def get_rules(db: Session = Depends(get_db)):
    rules = AutomationService.get_all_rules(db)
    return [AutomationRuleResponse.from_orm(r) for r in rules]

@router.post("/{rule_id}/toggle", response_model=AutomationRuleResponse)
def toggle_rule(rule_id: int, request: AutomationToggleRequest, db: Session = Depends(get_db)):
    updated = AutomationService.toggle_rule(db, rule_id, request.is_enabled)
    if not updated:
        raise HTTPException(status_code=404, detail="Rule not found")
    return AutomationRuleResponse.from_orm(updated)

@router.get("/logs", response_model=List[AutomationLogResponse])
def get_logs(db: Session = Depends(get_db)):
    logs = AutomationService.get_recent_logs(db)
    return [AutomationLogResponse.from_orm(l) for l in logs]
