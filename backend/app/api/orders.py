from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.order_service import OrderService
from app.services.chat_parser_service import ChatParserService
from app.schemas.order import OrderResponse, OrderStatusUpdate, ManualOrderCreate, ChatParseRequest
from typing import List, Optional

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=dict)
def get_orders(
    search: Optional[str] = Query(None),
    channel: Optional[str] = Query("all"),
    status: Optional[str] = Query("all"),
    payment_status: Optional[str] = Query("all"),
    fulfilment_status: Optional[str] = Query("all"),
    sort_by: str = Query("newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    orders, total = OrderService.get_orders(
        db=db,
        search=search,
        channel_code=channel,
        status=status,
        payment_status=payment_status,
        fulfilment_status=fulfilment_status,
        sort_by=sort_by,
        page=page,
        limit=limit
    )
    return {
        "items": [OrderResponse.from_orm(o) for o in orders],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = OrderService.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderResponse.from_orm(order)

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db)):
    try:
        updated = OrderService.update_order_status(db, order_id, status_update.status, status_update.notes)
        return OrderResponse.from_orm(updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/manual", response_model=OrderResponse)
def create_manual_order(order_in: ManualOrderCreate, db: Session = Depends(get_db)):
    try:
        created = OrderService.create_manual_order(db, order_in)
        return OrderResponse.from_orm(created)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/parse-chat")
def parse_chat_message(request: ChatParseRequest, db: Session = Depends(get_db)):
    """
    Parses a pasted customer chat message (WhatsApp, Instagram DM, SMS) using rule-based parsing.
    Validates Indian 10-digit phone and 6-digit PIN code.
    Matches product titles against current catalog without external AI API calls.
    """
    return ChatParserService.parse_chat_message(request.chat_text, db=db)
