from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.fulfilment_service import FulfilmentService
from app.schemas.fulfilment import ShipmentResponse, DispatchOrderRequest, TrackingNotificationPreview
from app.schemas.order import OrderResponse
from typing import List, Dict, Any

router = APIRouter(prefix="/fulfilment", tags=["Fulfilment & Shipping"])

@router.get("/shipments", response_model=List[ShipmentResponse])
def get_shipments(db: Session = Depends(get_db)):
    shipments = FulfilmentService.get_shipments(db)
    return [ShipmentResponse.from_orm(s) for s in shipments]

@router.get("/{order_id}/label", response_model=Dict[str, Any])
def get_shipping_label(order_id: int, db: Session = Depends(get_db)):
    try:
        label_data = FulfilmentService.generate_shipping_label(db, order_id)
        return label_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{order_id}/dispatch", response_model=OrderResponse)
def dispatch_order(order_id: int, request: DispatchOrderRequest, db: Session = Depends(get_db)):
    try:
        updated_order = FulfilmentService.dispatch_order(db, order_id, request.courier_name)
        return OrderResponse.from_orm(updated_order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{order_id}/tracking-preview", response_model=TrackingNotificationPreview)
def get_tracking_preview(order_id: int, db: Session = Depends(get_db)):
    try:
        preview = FulfilmentService.get_tracking_notification_preview(db, order_id)
        return TrackingNotificationPreview(**preview)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
