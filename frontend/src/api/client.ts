import {
  Order,
  Product,
  StockMovement,
  PaymentRecord,
  SettlementRecord,
  ShipmentRecord,
  Channel,
  AutomationRule,
  AutomationLog,
  AlertItem,
  DashboardMetrics,
  CustomerInterview,
  ValidationDashboardStats,
  BusinessAssumption,
  ValidationExperiment,
  BreakEvenResult,
} from '../types';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorDetail = 'Network request failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch {
      errorDetail = `${res.status} ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Analytics
  getDashboardMetrics: (days: number = 30, channel: string = 'all') =>
    fetchJson<DashboardMetrics>(`/analytics/dashboard?days=${days}&channel=${channel}`),

  // Orders
  getOrders: (params: {
    search?: string;
    channel?: string;
    status?: string;
    payment_status?: string;
    fulfilment_status?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.channel) query.append('channel', params.channel);
    if (params.status) query.append('status', params.status);
    if (params.payment_status) query.append('payment_status', params.payment_status);
    if (params.fulfilment_status) query.append('fulfilment_status', params.fulfilment_status);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    return fetchJson<{ items: Order[]; total: number; page: number; limit: number }>(`/orders?${query.toString()}`);
  },

  getOrder: (id: number) => fetchJson<Order>(`/orders/${id}`),

  updateOrderStatus: (id: number, status: string, notes?: string) =>
    fetchJson<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  createManualOrder: (data: any) =>
    fetchJson<Order>(`/orders/manual`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createOrder: (data: any) =>
    fetchJson<Order>(`/orders/manual`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Products & Inventory
  getProducts: (category?: string, lowStock?: boolean) => {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (lowStock) query.append('low_stock', 'true');
    return fetchJson<Product[]>(`/products?${query.toString()}`);
  },

  getProduct: (id: number) => fetchJson<Product>(`/products/${id}`),

  createProduct: (data: Partial<Product>) =>
    fetchJson<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: number, data: Partial<Product>) =>
    fetchJson<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  adjustStock: (id: number, change_qty: number, reason: string, notes?: string) =>
    fetchJson<Product>(`/products/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify({ change_qty, reason, notes }),
    }),

  getStockMovements: (productId: number) =>
    fetchJson<StockMovement[]>(`/products/${productId}/movements`),

  // Payments & Settlements
  getPayments: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return fetchJson<PaymentRecord[]>(`/payments${query}`);
  },

  getSettlements: () => fetchJson<SettlementRecord[]>('/payments/settlements'),

  simulatePayment: (orderId: number, action: 'verify' | 'fail' | 'mismatch', notes?: string) =>
    fetchJson<Order>(`/payments/${orderId}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    }),

  // Fulfilment
  getShipments: () => fetchJson<ShipmentRecord[]>('/fulfilment/shipments'),

  getShippingLabel: (orderId: number) =>
    fetchJson<any>(`/fulfilment/${orderId}/label`),

  dispatchOrder: (orderId: number, courierName?: string) =>
    fetchJson<Order>(`/fulfilment/${orderId}/dispatch`, {
      method: 'POST',
      body: JSON.stringify({ courier_name: courierName }),
    }),

  getTrackingPreview: (orderId: number) =>
    fetchJson<any>(`/fulfilment/${orderId}/tracking-preview`),

  // Channels
  getChannels: () => fetchJson<Channel[]>('/channels'),

  getChannel: (code: string) => fetchJson<Channel>(`/channels/${code}`),

  toggleChannelStatus: (code: string, status: string) =>
    fetchJson<Channel>(`/channels/${code}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  retryChannelSync: (code: string) =>
    fetchJson<Channel>(`/channels/${code}/retry-sync`, {
      method: 'POST',
    }),

  // Automations
  getAutomations: () => fetchJson<AutomationRule[]>('/automations'),

  toggleAutomationRule: (ruleId: number, is_enabled: boolean) =>
    fetchJson<AutomationRule>(`/automations/${ruleId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ is_enabled }),
    }),

  getAutomationLogs: () => fetchJson<AutomationLog[]>('/automations/logs'),

  // Alerts
  getAlerts: (status: string = 'OPEN') =>
    fetchJson<AlertItem[]>(`/alerts?status=${status}`),

  resolveAlert: (alertId: number) =>
    fetchJson<AlertItem>(`/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status: 'RESOLVED' }),
    }),

  // Demo Status
  getDemoStatus: () => fetchJson<any>('/demo/status'),

  // Business Model & Customer Validation
  getInterviews: () => fetchJson<CustomerInterview[]>('/business/interviews'),

  createInterview: (data: Omit<CustomerInterview, 'id' | 'created_at'>) =>
    fetchJson<CustomerInterview>('/business/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateInterview: (id: number, data: Partial<CustomerInterview>) =>
    fetchJson<CustomerInterview>(`/business/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteInterview: (id: number) =>
    fetchJson<{ status: string; id: number }>(`/business/interviews/${id}`, {
      method: 'DELETE',
    }),

  getValidationStats: () => fetchJson<ValidationDashboardStats>('/business/validation-stats'),

  getAssumptions: () => fetchJson<BusinessAssumption[]>('/business/assumptions'),

  updateAssumption: (id: number, data: Partial<BusinessAssumption>) =>
    fetchJson<BusinessAssumption>(`/business/assumptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getExperiments: () => fetchJson<ValidationExperiment[]>('/business/experiments'),

  updateExperiment: (id: number, data: Partial<ValidationExperiment>) =>
    fetchJson<ValidationExperiment>(`/business/experiments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  calculateBreakEven: (params: {
    monthly_rev_per_seller: number;
    variable_cost_per_seller: number;
    fixed_costs: number;
    customer_count: number;
  }) =>
    fetchJson<BreakEvenResult>('/business/break-even', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // Micro-Seller & Demo Helpers
  getPersonas: () => fetchJson<{ personas: any[]; seller_types: any[] }>('/demo/personas'),

  resetDemoData: (personaId: string = 'boutique') =>
    fetchJson<{ status: string; persona: string; message: string; counts: any }>(
      `/demo/reset?persona=${encodeURIComponent(personaId)}`,
      { method: 'POST' }
    ),

  exportData: () => fetchJson<any>('/demo/export-data'),

  deleteData: () => fetchJson<any>('/demo/delete-data', { method: 'POST' }),

  parseChat: (chat_text: string) =>
    fetchJson<{
      customer_name: string;
      customer_phone: string;
      phone_valid: boolean;
      delivery_address: string;
      delivery_city: string;
      delivery_pincode: string;
      pincode_valid: boolean;
      items: Array<{
        product_id: number;
        sku: string;
        name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        matched: boolean;
      }>;
      confidence: string;
      raw_chat: string;
    }>('/orders/parse-chat', {
      method: 'POST',
      body: JSON.stringify({ chat_text }),
    }),

  matchPaymentHelper: (amount: number, reference?: string, customer_hint?: string) =>
    fetchJson<{
      query_amount: number;
      query_reference?: string;
      total_pending_checked: number;
      candidates: any[];
      best_match: any;
      disclaimer: string;
    }>('/payments/match-helper', {
      method: 'POST',
      body: JSON.stringify({ amount, reference, customer_hint }),
    }),

  getDayEndSummary: () =>
    fetchJson<{
      summary_date: string;
      total_orders: number;
      total_sales: number;
      total_collected: number;
      pending_collection: number;
      pending_payment_count: number;
      ready_to_pack_count: number;
      ready_to_ship_count: number;
      shipped_today_count: number;
      delivered_today_count: number;
      low_stock_items: Array<{
        id: number;
        sku: string;
        title: string;
        available_stock: number;
        low_stock_threshold: number;
      }>;
      orders_today: Array<{
        id: number;
        order_number: string;
        customer_name: string;
        channel_name: string;
        total_amount: number;
        payment_status: string;
        payment_method: string;
        status: string;
        items_summary: string;
      }>;
      is_demo_mode: boolean;
    }>('/analytics/day-end-summary'),
};


