from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from datetime import datetime
from app.models.order import Order, OrderItem, OrderActivityLog
from app.models.channel import Channel
from app.models.product import Product
from app.models.payment import Payment
from app.schemas.order import ManualOrderCreate
from app.services.inventory_service import InventoryService
from typing import Optional, List, Tuple

class OrderService:
    @staticmethod
    def get_orders(
        db: Session,
        search: Optional[str] = None,
        channel_code: Optional[str] = None,
        status: Optional[str] = None,
        payment_status: Optional[str] = None,
        fulfilment_status: Optional[str] = None,
        sort_by: str = "newest",
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[Order], int]:
        query = db.query(Order)

        if channel_code and channel_code != "all":
            query = query.join(Channel).filter(Channel.code == channel_code)

        if status and status != "all":
            query = query.filter(Order.status == status)

        if payment_status and payment_status != "all":
            query = query.filter(Order.payment_status == payment_status)

        if fulfilment_status and fulfilment_status != "all":
            query = query.filter(Order.fulfilment_status == fulfilment_status)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Order.order_number.ilike(search_term),
                    Order.external_order_id.ilike(search_term),
                    Order.customer_name.ilike(search_term),
                    Order.customer_email.ilike(search_term),
                    Order.customer_phone.ilike(search_term)
                )
            )

        total = query.count()

        if sort_by == "oldest":
            query = query.order_by(asc(Order.created_at))
        elif sort_by == "amount_high":
            query = query.order_by(desc(Order.total_amount))
        elif sort_by == "amount_low":
            query = query.order_by(asc(Order.total_amount))
        else: # newest
            query = query.order_by(desc(Order.created_at))

        offset = (page - 1) * limit
        orders = query.offset(offset).limit(limit).all()
        return orders, total

    @staticmethod
    def get_order_by_id(db: Session, order_id: int) -> Optional[Order]:
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def update_order_status(db: Session, order_id: int, new_status: str, notes: Optional[str] = None) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order #{order_id} not found")

        old_status = order.status
        order.status = new_status
        if notes:
            order.internal_notes = (order.internal_notes or "") + f"\n[{datetime.utcnow().strftime('%Y-%m-%d %H:%M')}] {notes}"

        # If order cancelled, release any reserved inventory
        if new_status == "CANCELLED" and old_status not in ["CANCELLED", "DELIVERED"]:
            for item in order.items:
                if item.product_id:
                    InventoryService.release_stock(db, item.product_id, item.quantity, order.id)

        activity = OrderActivityLog(
            order_id=order.id,
            action="STATUS_UPDATED",
            description=f"Status transitioned from {old_status} to {new_status}. {notes or ''}".strip(),
            actor="Seller Admin"
        )
        db.add(activity)
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def create_manual_order(db: Session, order_in: ManualOrderCreate) -> Order:
        channel = db.query(Channel).filter(Channel.code == order_in.channel_code).first()
        if not channel:
            channel = db.query(Channel).filter(Channel.code == "direct").first()

        order_count = db.query(Order).count()
        order_number = f"SS-{1000 + order_count + 1}"
        external_id = f"MANUAL-{int(datetime.utcnow().timestamp())}"

        order = Order(
            order_number=order_number,
            external_order_id=external_id,
            channel_id=channel.id,
            customer_name=order_in.customer_name,
            customer_email=order_in.customer_email,
            customer_phone=order_in.customer_phone,
            delivery_address=order_in.delivery_address,
            delivery_city=order_in.delivery_city,
            delivery_pincode=order_in.delivery_pincode,
            order_type=order_in.order_type,
            channel_status="Manual Entry",
            status="CONFIRMED",
            payment_status="VERIFIED",
            fulfilment_status="UNFULFILLED",
            internal_notes=order_in.internal_notes,
        )
        db.add(order)
        db.flush()

        subtotal = 0.0
        for item_data in order_in.items:
            product = db.query(Product).filter(Product.id == item_data.product_id).first()
            if not product:
                continue
            
            unit_price = product.base_price
            item_total = unit_price * item_data.quantity
            subtotal += item_total

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                variant_id=item_data.variant_id,
                sku=product.sku,
                title=product.name,
                variant_title="Standard",
                quantity=item_data.quantity,
                unit_price=unit_price,
                total_price=item_total
            )
            db.add(order_item)
            # Reserve stock
            InventoryService.reserve_stock(db, product.id, item_data.quantity, order.id)

        tax = round(subtotal * 0.05, 2)
        shipping_fee = 50.0 if order_in.order_type == "courier" else 20.0
        order.subtotal = subtotal
        order.tax = tax
        order.shipping_fee = shipping_fee
        order.total_amount = round(subtotal + tax + shipping_fee, 2)

        # Create payment record
        payment = Payment(
            payment_reference=f"PAY-{order_number}",
            order_id=order.id,
            amount=order.total_amount,
            payment_method="Direct Bank Transfer",
            verification_status="VERIFIED",
            notes="Manually confirmed order payment"
        )
        db.add(payment)

        activity = OrderActivityLog(
            order_id=order.id,
            action="ORDER_CREATED",
            description=f"Manual order created for {order.customer_name} across channel '{channel.name}'.",
            actor="Seller Admin"
        )
        db.add(activity)

        db.commit()
        db.refresh(order)
        return order
