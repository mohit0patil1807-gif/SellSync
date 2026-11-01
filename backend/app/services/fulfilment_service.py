from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from app.models.fulfilment import Shipment
from app.models.order import Order, OrderActivityLog
from app.services.inventory_service import InventoryService
from app.services.automation_service import AutomationService
from typing import Optional, Dict, Any

class FulfilmentService:
    @staticmethod
    def get_shipments(db: Session):
        return db.query(Shipment).order_by(Shipment.created_at.desc()).all()

    @staticmethod
    def get_order_shipment(db: Session, order_id: int) -> Optional[Shipment]:
        return db.query(Shipment).filter(Shipment.order_id == order_id).first()

    @staticmethod
    def generate_shipping_label(db: Session, order_id: int) -> Dict[str, Any]:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order #{order_id} not found")

        shipment = db.query(Shipment).filter(Shipment.order_id == order_id).first()
        if not shipment:
            tracking_num = f"DEL-EXP-{random.randint(10000000, 99999999)}"
            courier = "Delhivery Express" if order.order_type == "courier" else "Swiggy / Zomato Fleet"
            shipment = Shipment(
                order_id=order.id,
                tracking_number=tracking_num,
                courier_name=courier,
                tracking_url=f"https://track.sellsync.demo/pkg/{tracking_num}",
                shipping_label_id=f"LBL-{order.order_number}",
                packing_status="PACKED",
                status="LABEL_CREATED",
                estimated_delivery=datetime.utcnow() + timedelta(days=2 if order.order_type == "courier" else 0, hours=1 if order.order_type == "handover" else 0),
                delivery_handover_code=f"{random.randint(1000, 9999)}" if order.order_type == "handover" else None,
                notes="Sample label generated for demo"
            )
            db.add(shipment)
            
            # Transition order status to READY_TO_DISPATCH if CONFIRMED or PROCESSING
            if order.status in ["CONFIRMED", "PROCESSING"]:
                order.status = "READY_TO_DISPATCH"
                order.fulfilment_status = "PACKED"

            activity = OrderActivityLog(
                order_id=order.id,
                action="SHIPPING_LABEL_GENERATED",
                description=f"Shipping label {shipment.shipping_label_id} generated for {shipment.courier_name}. Tracking: {shipment.tracking_number}.",
                actor="Fulfilment Hub"
            )
            db.add(activity)
            db.commit()
            db.refresh(shipment)

        label_data = {
            "label_id": shipment.shipping_label_id,
            "order_number": order.order_number,
            "external_order_id": order.external_order_id,
            "channel_name": order.channel.name if order.channel else "Direct",
            "order_type": order.order_type,
            "sender": {
                "name": "SellSync Hub / Micro-Seller Store",
                "address": "Unit 402, Trade Hub Towers, Lower Parel",
                "city": "Mumbai",
                "pincode": "400013",
                "phone": "+91 98200 12345"
            },
            "recipient": {
                "name": order.customer_name,
                "address": order.delivery_address or "Customer Residence",
                "city": order.delivery_city or "Mumbai",
                "pincode": order.delivery_pincode or "400001",
                "phone": order.customer_phone or "+91 98765 43210"
            },
            "shipment_details": {
                "courier": shipment.courier_name,
                "tracking_number": shipment.tracking_number,
                "tracking_url": shipment.tracking_url,
                "weight_kg": 0.65,
                "payment_mode": "Prepaid" if order.payment_status == "VERIFIED" else "COD",
                "items_count": sum(item.quantity for item in order.items),
                "handover_otp": shipment.delivery_handover_code
            }
        }
        return label_data

    @staticmethod
    def dispatch_order(db: Session, order_id: int, courier_name: Optional[str] = None) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order #{order_id} not found")

        # Find or create shipment
        shipment = db.query(Shipment).filter(Shipment.order_id == order_id).first()
        if not shipment:
            tracking_num = f"DEL-EXP-{random.randint(10000000, 99999999)}"
            shipment = Shipment(
                order_id=order.id,
                tracking_number=tracking_num,
                courier_name=courier_name or ("Delhivery Express" if order.order_type == "courier" else "Swiggy / Zomato Fleet"),
                tracking_url=f"https://track.sellsync.demo/pkg/{tracking_num}",
                shipping_label_id=f"LBL-{order.order_number}",
                packing_status="PACKED",
                status="PICKED_UP",
                dispatch_date=datetime.utcnow(),
                estimated_delivery=datetime.utcnow() + timedelta(days=2 if order.order_type == "courier" else 0, hours=1 if order.order_type == "handover" else 0)
            )
            db.add(shipment)
        else:
            shipment.status = "PICKED_UP"
            shipment.dispatch_date = datetime.utcnow()
            if courier_name:
                shipment.courier_name = courier_name

        order.status = "DISPATCHED"
        order.fulfilment_status = "SHIPPED"

        # Commit stock dispatch from central inventory!
        for item in order.items:
            if item.product_id:
                InventoryService.commit_stock_dispatch(db, item.product_id, item.quantity, order.id)

        activity = OrderActivityLog(
            order_id=order.id,
            action="ORDER_DISPATCHED",
            description=f"Package dispatched via {shipment.courier_name}. Tracking #{shipment.tracking_number}.",
            actor="Warehouse Dispatch"
        )
        db.add(activity)

        # Trigger automation for dispatch notification
        AutomationService.trigger_event(db, "SHIPMENT_DISPATCHED", {
            "order_id": order.id,
            "customer_name": order.customer_name,
            "tracking_number": shipment.tracking_number,
            "courier_name": shipment.courier_name
        })

        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_tracking_notification_preview(db: Session, order_id: int) -> Dict[str, Any]:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order #{order_id} not found")

        shipment = db.query(Shipment).filter(Shipment.order_id == order_id).first()
        tracking_num = shipment.tracking_number if shipment else f"DEL-EXP-{random.randint(10000000, 99999999)}"
        courier = shipment.courier_name if shipment else "Delhivery Express"
        tracking_url = shipment.tracking_url if shipment else f"https://track.sellsync.demo/pkg/{tracking_num}"
        eta = (datetime.utcnow() + timedelta(days=2)).strftime("%B %d, %Y")

        item_names = ", ".join([f"{it.quantity}x {it.title}" for it in order.items])

        message = (
            f"Hi {order.customer_name}! 🚀 Your SellSync order {order.order_number} ({item_names}) "
            f"has been dispatched via {courier}.\n\n"
            f"📦 Tracking Number: {tracking_num}\n"
            f"📍 Track live: {tracking_url}\n"
            f"🕒 Estimated Delivery: {eta}\n\n"
            f"Thank you for shopping with us!"
        )

        return {
            "recipient_name": order.customer_name,
            "recipient_phone": order.customer_phone or "+91 98765 43210",
            "recipient_email": order.customer_email or "customer@example.com",
            "tracking_number": tracking_num,
            "courier_name": courier,
            "tracking_url": tracking_url,
            "estimated_delivery": eta,
            "message_body": message,
            "channel_type": "WhatsApp Business" if order.channel and order.channel.code == "whatsapp" else "SMS / Email"
        }
