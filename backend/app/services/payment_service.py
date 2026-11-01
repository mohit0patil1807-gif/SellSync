from sqlalchemy.orm import Session
from datetime import datetime
from app.models.payment import Payment, Settlement
from app.models.order import Order, OrderActivityLog
from app.models.alert import Alert
from app.services.inventory_service import InventoryService
from app.services.automation_service import AutomationService
from typing import Optional, List

class PaymentService:
    @staticmethod
    def get_payments(db: Session, status: Optional[str] = None) -> List[Payment]:
        query = db.query(Payment)
        if status:
            query = query.filter(Payment.verification_status == status)
        return query.order_by(Payment.transaction_date.desc()).all()

    @staticmethod
    def get_settlements(db: Session) -> List[Settlement]:
        return db.query(Settlement).order_by(Settlement.settlement_date.desc()).all()

    @staticmethod
    def simulate_payment_action(db: Session, order_id: int, action: str, notes: Optional[str] = None):
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order #{order_id} not found")

        # Find or create payment record
        payment = db.query(Payment).filter(Payment.order_id == order_id).first()
        if not payment:
            payment = Payment(
                payment_reference=f"PAY-SIM-{order.id:04d}",
                order_id=order.id,
                amount=order.total_amount,
                payment_method="UPI",
                verification_status="PENDING",
                notes="Created for demo simulation"
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)

        if action == "verify":
            payment.verification_status = "VERIFIED"
            payment.settlement_status = "PENDING"
            payment.gateway_reference = f"UPI/SIM/REF-{datetime.utcnow().strftime('%H%M%S')}"
            payment.notes = notes or "Demo verification simulated successfully."
            
            order.payment_status = "VERIFIED"
            if order.status in ["NEW", "AWAITING_PAYMENT"]:
                order.status = "CONFIRMED"

            # Ensure inventory is reserved for this order
            for item in order.items:
                if item.product_id:
                    InventoryService.reserve_stock(db, item.product_id, item.quantity, order.id)

            # Add activity log
            activity = OrderActivityLog(
                order_id=order.id,
                action="PAYMENT_VERIFIED",
                description=f"Payment of ₹{order.total_amount:,.2f} verified via simulated UPI confirmation (Ref: {payment.gateway_reference}).",
                actor="Payment Service (Demo)"
            )
            db.add(activity)

            # Trigger automation
            AutomationService.trigger_event(db, "PAYMENT_VERIFIED", {
                "order_id": order.id,
                "customer_name": order.customer_name,
                "amount": order.total_amount
            })

        elif action == "fail":
            payment.verification_status = "FAILED"
            payment.failure_reason = notes or "Simulated payment failure (Insufficient funds / Timed out)."
            order.payment_status = "FAILED"
            
            activity = OrderActivityLog(
                order_id=order.id,
                action="PAYMENT_FAILED",
                description=f"Simulated payment verification failed: {payment.failure_reason}.",
                actor="Payment Gateway"
            )
            db.add(activity)

        elif action == "mismatch":
            payment.verification_status = "MISMATCH"
            simulated_paid = max(1.0, round(order.total_amount * 0.7, 2))
            payment.notes = f"Amount mismatch: Order total is ₹{order.total_amount:,.2f}, but received ₹{simulated_paid:,.2f}."
            order.payment_status = "MISMATCH"

            # Create an operational Alert
            alert = Alert(
                alert_type="PAYMENT_MISMATCH",
                title=f"Payment Mismatch: Order #{order.order_number}",
                description=f"Expected ₹{order.total_amount:,.2f}, received ₹{simulated_paid:,.2f} from {order.customer_name}.",
                severity="WARNING",
                status="OPEN",
                reference_type="ORDER",
                reference_id=str(order.id)
            )
            db.add(alert)

            activity = OrderActivityLog(
                order_id=order.id,
                action="PAYMENT_MISMATCH",
                description=f"Payment mismatch flagged: {payment.notes}",
                actor="Audit Engine"
            )
            db.add(activity)

        else:
            raise ValueError(f"Unknown simulation action: {action}")

        db.commit()
        db.refresh(order)
        db.refresh(payment)
        return order
