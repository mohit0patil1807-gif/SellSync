from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.order import Order, OrderItem, OrderActivityLog
from app.models.channel import Channel
from app.models.product import Product
from app.models.alert import Alert
from app.schemas.analytics import (
    DashboardOverviewResponse,
    ChannelMetric,
    StatusMetric,
    TrendMetric,
    TopProductMetric,
    RecentActivityMetric,
    AlertResponse,
    DayEndSummaryResponse,
    DayEndSummaryOrder
)
from typing import Optional, List, Dict, Any


class AnalyticsService:
    @staticmethod
    def get_dashboard_overview(db: Session, days: int = 30, channel_code: Optional[str] = None) -> DashboardOverviewResponse:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = db.query(Order).filter(Order.created_at >= start_date)
        if channel_code and channel_code != "all":
            query = query.join(Channel).filter(Channel.code == channel_code)

        orders = query.all()

        total_orders = len(orders)
        # Only non-cancelled orders count towards sales value
        valid_orders = [o for o in orders if o.status not in ["CANCELLED", "REFUNDED"]]
        sales_value = sum(o.total_amount for o in valid_orders)
        aov = round(sales_value / len(valid_orders), 2) if valid_orders else 0.0

        awaiting_payment_count = sum(1 for o in orders if o.status == "AWAITING_PAYMENT" or o.payment_status == "PENDING")
        requiring_fulfilment_count = sum(1 for o in orders if o.status in ["CONFIRMED", "PROCESSING", "READY_TO_DISPATCH"])
        cancelled_returned_count = sum(1 for o in orders if o.status in ["CANCELLED", "RETURNED", "REFUNDED"])

        # Low stock count across catalog
        all_products = db.query(Product).filter(Product.is_active == True).all()
        low_stock_count = sum(1 for p in all_products if p.available_stock <= p.low_stock_threshold)

        # Channel Breakdown
        channels = db.query(Channel).all()
        channel_metrics = []
        for ch in channels:
            ch_orders = [o for o in orders if o.channel_id == ch.id]
            ch_rev = sum(o.total_amount for o in ch_orders if o.status not in ["CANCELLED", "REFUNDED"])
            pct = round((ch_rev / sales_value * 100), 1) if sales_value > 0 else 0.0
            if ch_orders:
                channel_metrics.append(ChannelMetric(
                    channel=ch.name,
                    channel_name=ch.name,
                    code=ch.code,
                    revenue=round(ch_rev, 2),
                    orders=len(ch_orders),
                    percentage=pct
                ))
        channel_metrics.sort(key=lambda x: x.revenue, reverse=True)

        # Status Distribution
        status_counts = {}
        for o in orders:
            status_counts[o.status] = status_counts.get(o.status, 0) + 1
        
        status_distribution = [
            StatusMetric(status=st, label=st.replace("_", " ").title(), count=cnt)
            for st, cnt in sorted(status_counts.items(), key=lambda x: x[1], reverse=True)
        ]

        # Daily Trends (Last 7 days)
        trend_metrics = []
        for i in range(6, -1, -1):
            day_target = (datetime.utcnow() - timedelta(days=i)).date()
            day_orders = [o for o in orders if o.created_at.date() == day_target]
            day_rev = sum(o.total_amount for o in day_orders if o.status not in ["CANCELLED", "REFUNDED"])
            trend_metrics.append(TrendMetric(
                date=day_target.strftime("%b %d"),
                revenue=round(day_rev, 2),
                orders=len(day_orders)
            ))

        # Top Products
        item_sales = {}
        for o in valid_orders:
            for it in o.items:
                if it.sku not in item_sales:
                    item_sales[it.sku] = {"name": it.title, "qty": 0, "rev": 0.0, "product_id": it.product_id}
                item_sales[it.sku]["qty"] += it.quantity
                item_sales[it.sku]["rev"] += it.total_price

        top_products = []
        for sku, data in sorted(item_sales.items(), key=lambda x: x[1]["rev"], reverse=True)[:5]:
            prod = db.query(Product).filter(Product.sku == sku).first()
            stock_stat = "In Stock"
            if prod:
                if prod.available_stock <= 0:
                    stock_stat = "Out of Stock"
                elif prod.available_stock <= prod.low_stock_threshold:
                    stock_stat = f"Low ({prod.available_stock} left)"
            
            top_products.append(TopProductMetric(
                sku=sku,
                name=data["name"],
                category=prod.category if prod else "General",
                quantity_sold=data["qty"],
                revenue=round(data["rev"], 2),
                stock_status=stock_stat
            ))

        # Recent Activity (Last 10 events)
        recent_logs = db.query(OrderActivityLog).order_by(OrderActivityLog.created_at.desc()).limit(10).all()
        recent_activity = []
        for log in recent_logs:
            order_ref = log.order.order_number if log.order else f"Order #{log.order_id}"
            recent_activity.append(RecentActivityMetric(
                id=log.id,
                order_id=log.order_id,
                order_number=order_ref,
                action=log.action,
                description=log.description,
                actor=log.actor,
                created_at=log.created_at.strftime("%b %d, %H:%M")
            ))

        # Needs Attention (Open Alerts)
        open_alerts = db.query(Alert).filter(Alert.status == "OPEN").order_by(Alert.created_at.desc()).limit(10).all()
        needs_attention = [AlertResponse.from_orm(a) for a in open_alerts]

        return DashboardOverviewResponse(
            total_orders=total_orders,
            sales_value=round(sales_value, 2),
            awaiting_payment_count=awaiting_payment_count,
            requiring_fulfilment_count=requiring_fulfilment_count,
            low_stock_count=low_stock_count,
            cancelled_returned_count=cancelled_returned_count,
            average_order_value=aov,
            channel_breakdown=channel_metrics,
            status_distribution=status_distribution,
            daily_trends=trend_metrics,
            top_products=top_products,
            recent_activity=recent_activity,
            needs_attention=needs_attention,
            is_demo_mode=True
        )

    @staticmethod
    def get_day_end_summary(db: Session) -> DayEndSummaryResponse:
        now = datetime.utcnow()
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Check orders created today or fallback to recent 2 days to ensure rich demo data
        today_orders = db.query(Order).filter(Order.created_at >= start_of_today).all()
        if len(today_orders) < 3:
            today_orders = db.query(Order).filter(Order.created_at >= now - timedelta(days=2)).all()

        valid_orders = [o for o in today_orders if o.status not in ["CANCELLED", "REFUNDED"]]
        total_sales = sum(o.total_amount for o in valid_orders)
        
        # Total collected: verified payments or PAID payment status
        paid_orders = [o for o in valid_orders if o.payment_status == "PAID"]
        total_collected = sum(o.total_amount for o in paid_orders)
        pending_collection = total_sales - total_collected

        pending_payment_count = sum(1 for o in today_orders if o.payment_status in ["PENDING", "MISMATCH"])
        ready_to_pack_count = sum(1 for o in today_orders if o.status in ["CONFIRMED", "PROCESSING"])
        ready_to_ship_count = sum(1 for o in today_orders if o.status == "READY_TO_DISPATCH")
        shipped_today_count = sum(1 for o in today_orders if o.status == "DISPATCHED")
        delivered_today_count = sum(1 for o in today_orders if o.status == "DELIVERED")

        # Low stock items
        all_active_prods = db.query(Product).filter(Product.is_active == True).all()
        low_stock_prods = [p for p in all_active_prods if p.available_stock <= p.low_stock_threshold]

        low_stock_items = [
            {
                "id": p.id,
                "sku": p.sku,
                "title": p.name,
                "available_stock": p.available_stock,

                "low_stock_threshold": p.low_stock_threshold
            }
            for p in low_stock_prods
        ]

        order_rows = []
        for o in today_orders:
            items_str = ", ".join([f"{it.title} x{it.quantity}" for it in o.items]) if o.items else "Direct sale"
            order_rows.append(DayEndSummaryOrder(
                id=o.id,
                order_number=o.order_number,
                customer_name=o.customer_name or "Direct Customer",
                channel_name=o.channel.name if o.channel else "Direct",
                total_amount=round(o.total_amount, 2),
                payment_status=o.payment_status,
                payment_method=(o.payments[0].payment_method if (o.payments and len(o.payments) > 0) else "UPI"),
                status=o.status,
                items_summary=items_str
            ))


        return DayEndSummaryResponse(
            summary_date=now.strftime("%A, %d %b %Y"),
            total_orders=len(today_orders),
            total_sales=round(total_sales, 2),
            total_collected=round(total_collected, 2),
            pending_collection=round(max(0.0, pending_collection), 2),
            pending_payment_count=pending_payment_count,
            ready_to_pack_count=ready_to_pack_count,
            ready_to_ship_count=ready_to_ship_count,
            shipped_today_count=shipped_today_count,
            delivered_today_count=delivered_today_count,
            low_stock_items=low_stock_items,
            orders_today=order_rows,
            is_demo_mode=True
        )

