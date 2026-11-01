from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.schemas.alert import AlertResponse

class ChannelMetric(BaseModel):
    channel: str
    channel_name: str
    code: str
    revenue: float
    orders: int
    percentage: float

class StatusMetric(BaseModel):
    status: str
    label: str
    count: int

class TrendMetric(BaseModel):
    date: str
    revenue: float
    orders: int

class TopProductMetric(BaseModel):
    sku: str
    name: str
    category: str
    quantity_sold: int
    revenue: float
    stock_status: str

class RecentActivityMetric(BaseModel):
    id: int
    order_id: int
    order_number: str
    action: str
    description: str
    actor: str
    created_at: str

class DashboardOverviewResponse(BaseModel):
    total_orders: int
    sales_value: float
    awaiting_payment_count: int
    requiring_fulfilment_count: int
    low_stock_count: int
    cancelled_returned_count: int
    average_order_value: float
    channel_breakdown: List[ChannelMetric]
    status_distribution: List[StatusMetric]
    daily_trends: List[TrendMetric]
    top_products: List[TopProductMetric]
    recent_activity: List[RecentActivityMetric]
    needs_attention: List[AlertResponse]
    is_demo_mode: bool = True

class DayEndSummaryOrder(BaseModel):
    id: int
    order_number: str
    customer_name: str
    channel_name: str
    total_amount: float
    payment_status: str
    payment_method: str
    status: str
    items_summary: str

class DayEndSummaryResponse(BaseModel):
    summary_date: str
    total_orders: int
    total_sales: float
    total_collected: float
    pending_collection: float
    pending_payment_count: int
    ready_to_pack_count: int
    ready_to_ship_count: int
    shipped_today_count: int
    delivered_today_count: int
    low_stock_items: List[Dict[str, Any]]
    orders_today: List[DayEndSummaryOrder]
    is_demo_mode: bool = True

