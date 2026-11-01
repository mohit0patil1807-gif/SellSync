from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.payment import Payment

class PaymentHelperService:
    @staticmethod
    def match_payment(
        db: Session,
        amount: float,
        reference: Optional[str] = None,
        customer_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Assists micro-sellers in matching payments from UPI/bank notifications with pending orders.
        Returns matching candidate orders and flags mismatches in plain Indian commerce language.
        Clearly labelled as a manual cross-check assistant (Zero live bank credential storage).
        """
        amount = round(float(amount), 2)
        ref_clean = (reference or "").strip().lower()
        hint_clean = (customer_hint or "").strip().lower()

        # Query pending orders
        pending_orders = db.query(Order).filter(
            Order.payment_status.in_(["PENDING", "MISMATCH", "FAILED"])
        ).all()

        candidates: List[Dict[str, Any]] = []

        for ord_obj in pending_orders:
            diff = round(amount - ord_obj.total_amount, 2)
            score = 0
            status_word = "NOT_PAID"
            plain_message = ""

            # Check reference match if provided
            ref_matched = False
            if ref_clean:
                # Check order number or external order id
                if ref_clean in ord_obj.order_number.lower() or ref_clean in ord_obj.external_order_id.lower():
                    ref_matched = True
                    score += 50
                # Check payment records
                for p in ord_obj.payments:
                    if (p.payment_reference and ref_clean in p.payment_reference.lower()) or \
                       (p.gateway_reference and ref_clean in p.gateway_reference.lower()):
                        ref_matched = True
                        score += 50
                        break

            # Check customer name match if hint provided
            if hint_clean and ord_obj.customer_name and hint_clean in ord_obj.customer_name.lower():
                score += 30

            # Amount matching
            if abs(diff) < 0.01:
                # Exact match
                score += 50
                status_word = "PAID"
                plain_message = f"Exact match: Order #{ord_obj.order_number} for {ord_obj.customer_name} is ₹{ord_obj.total_amount:,.2f}."
            elif diff < 0:
                # Underpaid
                shortfall = abs(diff)
                # Proportional score if reasonably close
                pct_diff = (shortfall / ord_obj.total_amount) if ord_obj.total_amount > 0 else 1.0
                if pct_diff <= 0.5:
                    score += int(30 * (1.0 - pct_diff))
                status_word = "PLEASE_CHECK"
                plain_message = f"Please check: Customer paid ₹{amount:,.2f} but order #{ord_obj.order_number} is ₹{ord_obj.total_amount:,.2f} (Shortfall of ₹{shortfall:,.2f})."
            else:
                # Overpaid
                excess = diff
                status_word = "PLEASE_CHECK"
                score += 20
                plain_message = f"Please check: Customer paid ₹{amount:,.2f} but order #{ord_obj.order_number} is ₹{ord_obj.total_amount:,.2f} (Excess of ₹{excess:,.2f})."

            if score > 0 or abs(diff) <= 200.0:
                candidates.append({
                    "order_id": ord_obj.id,
                    "order_number": ord_obj.order_number,
                    "customer_name": ord_obj.customer_name,
                    "channel_name": ord_obj.channel.name if ord_obj.channel else "Direct",
                    "channel_code": ord_obj.channel.code if ord_obj.channel else "direct",
                    "order_amount": ord_obj.total_amount,
                    "paid_amount": amount,
                    "difference": diff,
                    "match_status": status_word, # "PAID" | "NOT_PAID" | "PLEASE_CHECK"
                    "plain_message": plain_message,
                    "score": score,
                    "ref_matched": ref_matched
                })

        # Sort by confidence score descending, then by smallest absolute difference
        candidates.sort(key=lambda x: (x["score"], -abs(x["difference"])), reverse=True)

        return {
            "query_amount": amount,
            "query_reference": reference,
            "total_pending_checked": len(pending_orders),
            "candidates": candidates[:10],
            "best_match": candidates[0] if candidates else None,
            "disclaimer": "Manual check assistant for micro-sellers. Verify in your UPI/banking app before packing."
        }
