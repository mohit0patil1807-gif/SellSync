import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Calendar,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { DashboardMetrics } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { NavItem } from '../components/layout/Sidebar';

interface OverviewPageProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  onNavigateTab: (tab: NavItem) => void;
  onOpenOrder: (orderId: number) => void;
  onResolveAlert: (alertId: number) => void;
  daysFilter: number;
  onChangeDaysFilter: (days: number) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  metrics,
  loading,
  onNavigateTab,
  onOpenOrder,
  onResolveAlert,
  daysFilter,
  onChangeDaysFilter,
}) => {
  if (loading || !metrics) {
    return (
      <div className="py-24 text-center text-ink-muted text-xs">
        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-medium text-ink-primary">Reconciling multi-channel operational metrics...</p>
      </div>
    );
  }

  // Refined harmonious channel color mapping
  const CHANNEL_COLORS: Record<string, string> = {
    amazon: '#FF9900',
    flipkart: '#2874F0',
    meesho: '#E03B7C',
    swiggy: '#FC8019',
    zomato: '#CB202D',
    instagram: '#E1306C',
    whatsapp: '#25D366',
    direct: '#6C3CE9',
    myntra: '#F13AB1',
  };

  return (
    <div className="space-y-6">
      {/* 1. Command Header with Ambient Glow & Timeframe Selector */}
      <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-card ambient-glow relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded">
                Operational Command
              </span>
              <span className="text-[11px] text-ink-muted">SpiceCraft & Co. Store</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
              Unified Commerce Dashboard
            </h1>
            <p className="text-xs text-ink-secondary mt-1 max-w-xl leading-relaxed">
              Real-time synchronization across e-commerce marketplaces, food delivery apps, and social DMs.
            </p>
          </div>

          {/* Timeframe Selector & Sync Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="inline-flex rounded-xl border border-warm-200 p-1 bg-warm-50 text-xs">
              {[
                { label: '7 Days', val: 7 },
                { label: '30 Days', val: 30 },
                { label: '90 Days', val: 90 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => onChangeDaysFilter(opt.val)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    daysFilter === opt.val
                      ? 'bg-white text-ink-primary shadow-subtle font-semibold'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warm-50 border border-warm-200 text-xs text-ink-secondary">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[11px]">9 Channels Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Compact Row of 6 Meaningful KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Gross Sales (GMV) */}
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[11px] font-medium text-ink-secondary">Gross Sales</span>
            <div className="w-6 h-6 rounded-md bg-warm-100 text-brand-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-ink-primary tracking-tight tabular-nums">
              ₹{metrics.sales_value.toLocaleString()}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5 tabular-nums">
              AOV: ₹{metrics.average_order_value.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-4 rounded-xl border border-warm-200 shadow-card hover:border-warm-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[11px] font-medium text-ink-secondary">Total Orders</span>
            <div className="w-6 h-6 rounded-md bg-warm-100 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-ink-primary tracking-tight group-hover:text-purple-600 transition-colors tabular-nums">
              {metrics.total_orders}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5 flex items-center gap-1">
              <span>View in Inbox</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Awaiting Payment */}
        <div
          onClick={() => onNavigateTab('orders')}
          className={`p-4 rounded-xl border shadow-card transition-all cursor-pointer group flex flex-col justify-between ${
            metrics.awaiting_payment_count > 0
              ? 'bg-white border-semantic-warning-border hover:border-semantic-warning'
              : 'bg-white border-warm-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-ink-secondary">Awaiting Pay</span>
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-amber-900 tracking-tight tabular-nums">
              {metrics.awaiting_payment_count}
            </div>
            <div className="text-[11px] text-amber-800/80 mt-0.5 font-medium">
              Pending UPI verify
            </div>
          </div>
        </div>

        {/* To Fulfil */}
        <div
          onClick={() => onNavigateTab('fulfilment')}
          className="bg-white p-4 rounded-xl border border-warm-200 shadow-card hover:border-warm-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[11px] font-medium text-ink-secondary">To Fulfil</span>
            <div className="w-6 h-6 rounded-md bg-warm-100 text-brand-500 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-ink-primary tracking-tight group-hover:text-brand-500 transition-colors tabular-nums">
              {metrics.requiring_fulfilment_count}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">Ready for label run</div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className={`p-4 rounded-xl border shadow-card transition-all cursor-pointer group flex flex-col justify-between ${
            metrics.low_stock_count > 0
              ? 'bg-white border-semantic-danger-border hover:border-semantic-danger'
              : 'bg-white border-warm-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-ink-secondary">Low Stock</span>
            <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-rose-900 tracking-tight tabular-nums">
              {metrics.low_stock_count}
            </div>
            <div className="text-[11px] text-rose-800/80 mt-0.5 font-medium">Below buffer threshold</div>
          </div>
        </div>

        {/* Returns / Cancellations */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-4 rounded-xl border border-warm-200 shadow-card hover:border-warm-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[11px] font-medium text-ink-secondary">Returns / Cancels</span>
            <div className="w-6 h-6 rounded-md bg-warm-100 text-ink-secondary flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-ink-primary tracking-tight tabular-nums">
              {metrics.cancelled_returned_count}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">Restocked</div>
          </div>
        </div>
      </div>

      {/* 3. Operational Priority Section (Prioritizing Pending Action Over Vanity) */}
      {metrics.needs_attention.length > 0 && (
        <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-semantic-warning" />
              <h3 className="text-sm font-semibold text-ink-primary">
                Operational Priorities ({metrics.needs_attention.length} Pending Actions)
              </h3>
            </div>
            <span className="text-xs text-ink-secondary">
              Resolve to prevent delivery delays or stockouts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {metrics.needs_attention.slice(0, 3).map((item) => {
              const isCrit = item.severity === 'CRITICAL';
              return (
                <div
                  key={item.id}
                  className="bg-warm-50/70 p-3.5 rounded-xl border border-warm-200 flex flex-col justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-ink-primary truncate">{item.title}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                          isCrit ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-ink-secondary line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-warm-200 flex items-center justify-between">
                    {item.reference_type === 'ORDER' && item.reference_id ? (
                      <button
                        onClick={() => onOpenOrder(Number(item.reference_id))}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <span>Process Order</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigateTab('inventory')}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <span>Restock SKU</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={() => onResolveAlert(item.id)}
                      className="text-[11px] text-ink-muted hover:text-ink-primary font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Disciplined Grid: Sales by Channel & Daily Revenue Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Channel Donut */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink-primary">Revenue by Sales Channel</h3>
            <p className="text-xs text-ink-secondary mt-0.5">Multi-channel revenue contribution</p>
          </div>

          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.channel_breakdown}
                  dataKey="revenue"
                  nameKey="channel_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {metrics.channel_breakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHANNEL_COLORS[entry.code] || '#9E9687'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#24212B',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                    padding: '8px 12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pt-2 border-t border-warm-200">
            {metrics.channel_breakdown.map((item) => (
              <div key={item.code} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: CHANNEL_COLORS[item.code] || '#9E9687' }}
                  />
                  <span className="font-medium text-ink-primary">{item.channel_name}</span>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="text-ink-muted text-[11px]">{item.orders} ord</span>
                  <span className="font-semibold text-ink-primary">₹{item.revenue.toLocaleString()}</span>
                  <span className="text-[11px] text-ink-muted w-8 text-right font-mono">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Revenue Trajectory Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-warm-200 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Order Volume & Revenue Trajectory</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Reconciled daily sales across all connected platforms</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-ink-secondary text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Revenue (₹)
              </span>
            </div>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.daily_trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F05A28" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#F05A28" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#706B78' }}
                  stroke="#EBE7DF"
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#706B78' }}
                  stroke="#EBE7DF"
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Daily Revenue']}
                  contentStyle={{
                    backgroundColor: '#24212B',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                    padding: '8px 12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F05A28"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#brandGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Bottom Two Columns: Top Moving SKUs & Operational Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Moving Products */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-warm-200">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Top Moving Catalog SKUs</h3>
              <p className="text-xs text-ink-secondary">Velocity and allocated stock status</p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              Full Inventory →
            </button>
          </div>

          <div className="divide-y divide-warm-200">
            {metrics.top_products.map((p, i) => (
              <div key={p.sku} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-warm-100 text-ink-secondary flex items-center justify-center font-bold text-[10px]">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-ink-primary block">{p.name}</span>
                    <span className="text-[11px] text-ink-muted font-mono">
                      {p.sku} · {p.category}
                    </span>
                  </div>
                </div>

                <div className="text-right tabular-nums">
                  <div className="font-semibold text-ink-primary">₹{p.revenue.toLocaleString()}</div>
                  <div className="text-[11px] text-ink-muted">
                    {p.quantity_sold} sold ·{' '}
                    <span
                      className={
                        p.stock_status.includes('Low')
                          ? 'text-semantic-danger font-semibold'
                          : 'text-emerald-700'
                      }
                    >
                      {p.stock_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Timeline Audit Log */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-warm-200">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Live Operational Audit Trail</h3>
              <p className="text-xs text-ink-secondary">Traceable channel events and status transitions</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Unified Inbox →
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {metrics.recent_activity.map((act) => (
              <div
                key={act.id}
                onClick={() => onOpenOrder(act.order_id)}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-warm-50 border border-transparent hover:border-warm-200 cursor-pointer transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                <div className="flex-1 text-xs min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink-primary">{act.order_number}</span>
                    <span className="text-[10px] text-ink-muted tabular-nums shrink-0">{act.created_at}</span>
                  </div>
                  <p className="text-ink-secondary mt-0.5 leading-relaxed truncate">{act.description}</p>
                  <span className="text-[10px] text-ink-muted mt-0.5 inline-block font-mono">
                    Actor: {act.actor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
