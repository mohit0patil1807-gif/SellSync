export type OrderStatus =
  | 'NEW'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_TO_DISPATCH'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED'
  | 'EXCEPTION';

export type PaymentStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'FAILED'
  | 'MISMATCH'
  | 'REFUNDED';

export type FulfilmentStatus =
  | 'UNFULFILLED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ChannelStatus =
  | 'CONNECTED'
  | 'DEMO_MODE'
  | 'NOT_CONNECTED'
  | 'SYNC_ISSUE';

export interface Channel {
  id: number;
  code: string;
  name: string;
  category: 'marketplace' | 'food_delivery' | 'social_commerce' | 'direct';
  status: ChannelStatus;
  icon_slug?: string;
  description?: string;
  capabilities_json: string;
  last_sync_at?: string;
  error_details?: string;
  is_demo: boolean;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  variant_id?: number;
  sku: string;
  title: string;
  variant_title?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderActivity {
  id: number;
  order_id: number;
  action: string;
  description: string;
  actor: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  external_order_id: string;
  channel_id: number;
  channel?: Channel;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_pincode?: string;
  order_type: 'courier' | 'handover';
  channel_status?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfilment_status: FulfilmentStatus;
  currency: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total_amount: number;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  activity_logs: OrderActivity[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  variant_name: string;
  option_name: string;
  option_value: string;
  price: number;
  stock_on_hand: number;
  reserved_stock: number;
  available_stock: number;
}

export interface ChannelListing {
  id: number;
  channel_id: number;
  channel_name?: string;
  channel_code?: string;
  external_listing_id: string;
  external_sku?: string;
  channel_price: number;
  sync_status: string;
  last_synced_at?: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  image_url?: string;
  base_price: number;
  stock_on_hand: number;
  reserved_stock: number;
  available_stock: number;
  low_stock_threshold: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variants: ProductVariant[];
  channel_listings: ChannelListing[];
}

export interface StockMovement {
  id: number;
  product_id: number;
  change_qty: number;
  reason: string;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export interface PaymentRecord {
  id: number;
  payment_reference: string;
  order_id: number;
  amount: number;
  payment_method: string;
  gateway_reference?: string;
  verification_status: PaymentStatus;
  settlement_status: string;
  transaction_date: string;
  notes?: string;
  failure_reason?: string;
  created_at: string;
}

export interface SettlementRecord {
  id: number;
  settlement_reference: string;
  channel_id: number;
  channel_name?: string;
  gross_amount: number;
  deductions: number;
  net_settlement: number;
  settlement_date: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface ShipmentRecord {
  id: number;
  order_id: number;
  tracking_number?: string;
  courier_name?: string;
  tracking_url?: string;
  shipping_label_id?: string;
  packing_status: string;
  status: string;
  dispatch_date?: string;
  estimated_delivery?: string;
  delivery_handover_code?: string;
  notes?: string;
  created_at: string;
}

export interface AutomationRule {
  id: number;
  code: string;
  rule_name: string;
  description: string;
  trigger_event: string;
  action_type: string;
  is_enabled: boolean;
  total_executions: number;
  last_executed_at?: string;
  created_at: string;
}

export interface AutomationLog {
  id: number;
  rule_id: number;
  event_type: string;
  order_id?: number;
  product_id?: number;
  status: string;
  details: string;
  created_at: string;
}

export interface AlertItem {
  id: number;
  alert_type: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  reference_type?: string;
  reference_id?: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_orders: number;
  sales_value: number;
  awaiting_payment_count: number;
  requiring_fulfilment_count: number;
  low_stock_count: number;
  cancelled_returned_count: number;
  average_order_value: number;
  channel_breakdown: Array<{
    channel: string;
    channel_name: string;
    code: string;
    revenue: number;
    orders: number;
    percentage: number;
  }>;
  status_distribution: Array<{
    status: string;
    label: string;
    count: number;
  }>;
  daily_trends: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  top_products: Array<{
    sku: string;
    name: string;
    category: string;
    quantity_sold: number;
    revenue: number;
    stock_status: string;
  }>;
  recent_activity: Array<{
    id: number;
    order_id: number;
    order_number: string;
    action: string;
    description: string;
    actor: string;
    created_at: string;
  }>;
  needs_attention: AlertItem[];
  is_demo_mode: boolean;
}

// ----------------- Startup Strategy & Customer Validation Types -----------------
export interface CustomerInterview {
  id: number;
  seller_name: string;
  seller_type: string;
  sales_channels: string;
  approx_order_volume: string;
  current_process: string;
  most_time_consuming_task: string;
  current_tools: string;
  operational_mistakes?: string;
  most_requested_feature: string;
  willingness_to_pilot: boolean;
  pricing_feedback?: string;
  follow_up_notes?: string;
  interview_date: string;
  created_at: string;
}

export interface ValidationDashboardStats {
  total_interviews: number;
  segments_represented: Array<{ segment: string; count: number }>;
  frequent_problems: Array<{ problem: string; count: number }>;
  requested_features: Array<{ feature: string; count: number }>;
  pilot_interested_count: number;
  pilot_percentage: number;
  pricing_summaries: string[];
}

export interface BusinessAssumption {
  id: number;
  assumption_code: string;
  description: string;
  category: string;
  evidence_available: string;
  confidence_level: 'Low' | 'Medium' | 'High';
  validation_method: string;
  status: 'Untested' | 'Testing' | 'Supported' | 'Rejected';
  next_action?: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationExperiment {
  id: number;
  experiment_code: string;
  hypothesis: string;
  target_segment: string;
  experiment_description: string;
  success_metric: string;
  target_threshold: string;
  actual_result?: string;
  decision: 'Pending' | 'Validated' | 'Invalidated' | 'Iterate';
  next_action?: string;
  created_at: string;
  updated_at: string;
}

export interface BreakEvenResult {
  monthly_rev_per_seller: number;
  variable_cost_per_seller: number;
  contribution_per_seller: number;
  contribution_margin_percentage: number;
  fixed_costs: number;
  break_even_customers: number;
  revenue_at_selected_count: number;
  variable_cost_at_selected_count: number;
  total_cost_at_selected_count: number;
  operating_surplus_deficit: number;
  status: 'SURPLUS' | 'DEFICIT' | 'BREAK_EVEN';
  is_illustrative_assumption: boolean;
}

