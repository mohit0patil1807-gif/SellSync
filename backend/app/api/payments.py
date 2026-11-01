from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.payment_service import PaymentService
from app.services.payment_helper_service import PaymentHelperService
from app.schemas.payment import PaymentResponse, SettlementResponse, PaymentSimulateRequest, PaymentMatchRequest
from app.schemas.order import OrderResponse
from typing import List, Optional

router = APIRouter(prefix="/payments", tags=["Payments & Settlements"])

@router.post("/match-helper")
def match_payment_helper(request: PaymentMatchRequest, db: Session = Depends(get_db)):
    """
    Micro-seller payment match assistant.
    Cross-checks amount and reference against pending orders to flag 'PAID' or 'PLEASE_CHECK'.
    """
    return PaymentHelperService.match_payment(
        db=db,
        amount=request.amount,
        reference=request.reference,
        customer_hint=request.customer_hint
    )


@router.get("", response_model=List[PaymentResponse])
def get_payments(status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    payments = PaymentService.get_payments(db, status=status)
    return [PaymentResponse.from_orm(p) for p in payments]

@router.get("/settlements", response_model=List[SettlementResponse])
def get_settlements(db: Session = Depends(get_db)):
    settlements = PaymentService.get_settlements(db)
    results = []
    for s in settlements:
        res = SettlementResponse.from_orm(s)
        res.channel_name = s.channel.name if s.channel else "Marketplace"
        results.append(res)
    return results

@router.post("/{order_id}/simulate", response_model=OrderResponse)
def simulate_payment(order_id: int, request: PaymentSimulateRequest, db: Session = Depends(get_db)):
    try:
        updated_order = PaymentService.simulate_payment_action(
            db=db,
            order_id=order_id,
            action=request.action,
            notes=request.notes
        )
        return OrderResponse.from_orm(updated_order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
