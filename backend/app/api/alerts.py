from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertResponse, AlertResolveRequest
from typing import List

router = APIRouter(prefix="/alerts", tags=["Alerts & Exceptions"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(status: str = "OPEN", db: Session = Depends(get_db)):
    query = db.query(Alert)
    if status != "all":
        query = query.filter(Alert.status == status)
    alerts = query.order_by(Alert.created_at.desc()).all()
    return [AlertResponse.from_orm(a) for a in alerts]

@router.post("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(alert_id: int, request: AlertResolveRequest, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = request.status
    db.commit()
    db.refresh(alert)
    return AlertResponse.from_orm(alert)
