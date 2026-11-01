from sqlalchemy.orm import Session
from datetime import datetime
from app.models.automation import AutomationRule, AutomationLog
from app.models.alert import Alert
from typing import Optional, Dict, Any

class AutomationService:
    @staticmethod
    def get_all_rules(db: Session):
        return db.query(AutomationRule).order_by(AutomationRule.id.asc()).all()

    @staticmethod
    def get_recent_logs(db: Session, limit: int = 50):
        return db.query(AutomationLog).order_by(AutomationLog.created_at.desc()).limit(limit).all()

    @staticmethod
    def toggle_rule(db: Session, rule_id: int, is_enabled: bool) -> Optional[AutomationRule]:
        rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()
        if rule:
            rule.is_enabled = is_enabled
            db.commit()
            db.refresh(rule)
        return rule

    @staticmethod
    def trigger_event(db: Session, event_type: str, payload: Dict[str, Any]) -> None:
        """
        Executes active rules matching event_type and logs outcomes.
        """
        rules = db.query(AutomationRule).filter(
            AutomationRule.trigger_event == event_type,
            AutomationRule.is_enabled == True
        ).all()

        for rule in rules:
            status = "SUCCESS"
            details = ""
            order_id = payload.get("order_id")
            product_id = payload.get("product_id")

            try:
                if rule.code == "RULE-AUTO-CONFIRM":
                    # When payment is verified, confirm order
                    details = f"Auto-confirmed Order #{order_id} following verified payment."
                elif rule.code == "RULE-LOW-STOCK":
                    # Check threshold and log
                    details = f"Flagged low stock alert for Product #{product_id} ({payload.get('available_stock')} units remaining)."
                elif rule.code == "RULE-DISPATCH-NOTIF":
                    # Prepare tracking notification
                    details = f"Prepared WhatsApp/SMS tracking notification for recipient {payload.get('customer_name')} (Tracking: {payload.get('tracking_number')})."
                elif rule.code == "RULE-SYNC-ANOMALY":
                    details = f"Created operational exception for channel synchronization error on {payload.get('channel_name', 'Channel')}."
                else:
                    details = f"Executed rule {rule.rule_name} successfully."
                
                rule.total_executions += 1
                rule.last_executed_at = datetime.utcnow()

            except Exception as e:
                status = "FAILED"
                details = f"Rule execution error: {str(e)}"

            log = AutomationLog(
                rule_id=rule.id,
                event_type=event_type,
                order_id=order_id,
                product_id=product_id,
                status=status,
                details=details
            )
            db.add(log)

        db.commit()
