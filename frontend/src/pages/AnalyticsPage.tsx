import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { DashboardMetrics } from '../types';
import { api } from '../api/client';

export const AnalyticsPage: React.FC = () => {
  const [days, setDays] = useState(30);
  const [channel, setChannel] = useState('all');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardMetrics(days, channel);
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [days, channel]);

  if (loading || !metrics) {
    return (
      <div className="py-24 text-center text-ink-muted text-xs">
        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-medium text-ink-primary">Aggregating business analytics across channels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Timeframe & Channel Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-ink-muted" />
          <span className="text-xs font-semibold text-ink-primary">Reporting Range:</span>
          <div className="inline-flex rounded-xl border border-warm-200 p-0.5 bg-warm-50 text-xs">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  days === d
                    ? 'bg-purple-600 text-white font-semibold shadow-subtle'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-secondary">Channel Filter:</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-warm-200 rounded-lg bg-white text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-subtle"
          >
            <option value="all">All Channels Combined</option>
            <option value="amazon">Amazon India</option>
            <option value="flipkart">Flipkart</option>
            <option value="meesho">Meesho</option>
            <option value="swiggy">Swiggy (Food)</option>
            <option value="zomato">Zomato (Food)</option>
            <option value="whatsapp">WhatsApp Business</option>
            <option value="instagram">Instagram Direct</option>
            <option value="direct">Direct Store</option>
          </select>
        </div>
      </div>

      {/* Financial Definition Notice */}
      <div className="p-3.5 bg-warm-50 border border-warm-200 rounded-xl text-xs text-ink-secondary flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-ink-primary">Financial Metric Definitions:</strong> Figures reflect <em>Gross Merchandise Value (GMV)</em> and customer payments received. Net seller profit requires subtracting channel referral fees, courier shipping, returns, and GST. Exact deductions are reconciled under <strong>Payments & Payouts</strong>.
        </div>
      </div>

      {/* KPI Summary Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
          <span className="text-[11px] text-ink-secondary font-medium uppercase tracking-wider block mb-1">
            Gross Sales Value
          </span>
          <div className="text-2xl font-semibold text-ink-primary tabular-nums tracking-tight">
            ₹{metrics.sales_value.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-800 font-medium mt-1 inline-block">
            Net of order cancellations
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
          <span className="text-[11px] text-ink-secondary font-medium uppercase tracking-wider block mb-1">
            Orders Processed
          </span>
          <div className="text-2xl font-semibold text-ink-primary tabular-nums tracking-tight">{metrics.total_orders}</div>
          <span className="text-[11px] text-ink-muted mt-1 inline-block">
            Across 9 active channels
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
          <span className="text-[11px] text-ink-secondary font-medium uppercase tracking-wider block mb-1">
            Average Order Value
          </span>
          <div className="text-2xl font-semibold text-ink-primary tabular-nums tracking-tight">
            ₹{metrics.average_order_value.toLocaleString()}
          </div>
          <span className="text-[11px] text-ink-muted mt-1 inline-block">Per completed checkout</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
          <span className="text-[11px] text-ink-secondary font-medium uppercase tracking-wider block mb-1">
            Return & Cancel Rate
          </span>
          <div className="text-2xl font-semibold text-semantic-danger tabular-nums tracking-tight">
            {metrics.total_orders > 0
              ? `${Math.round((metrics.cancelled_returned_count / metrics.total_orders) * 100)}%`
              : '0%'}
          </div>
          <span className="text-[11px] text-ink-muted mt-1 inline-block tabular-nums">
            {metrics.cancelled_returned_count} order(s) cancelled/returned
          </span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Revenue Comparison (Royal Purple) */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-ink-primary">Channel Revenue Comparison</h3>
            <p className="text-xs text-ink-secondary mt-0.5">Gross revenue contribution per sales channel</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.channel_breakdown} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#706B78' }} stroke="#EBE7DF" tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#706B78' }} stroke="#EBE7DF" tickLine={false} tickFormatter={(v) => `₹${v}`} />
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
                <Bar dataKey="revenue" fill="#6C3CE9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Lifecycle Funnel Distribution (Primary Orange) */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-ink-primary">Order Lifecycle Stage Distribution</h3>
            <p className="text-xs text-ink-secondary mt-0.5">Order volume currently across operational stages</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.status_distribution}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <XAxis type="number" tick={{ fontSize: 11, fill: '#706B78' }} stroke="#EBE7DF" tickLine={false} />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: '#706B78' }} width={90} stroke="#EBE7DF" tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} orders`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#24212B',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                    padding: '8px 12px'
                  }}
                />
                <Bar dataKey="count" fill="#F05A28" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Velocity Products Table */}
      <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
        <div className="mb-3.5 pb-2 border-b border-warm-200">
          <h3 className="text-sm font-semibold text-ink-primary">Product Performance & Margin Matrix</h3>
          <p className="text-xs text-ink-secondary mt-0.5">Units sold, revenue contribution, and real-time inventory health</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-50/70 border-b border-warm-200 text-ink-muted font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Gross Revenue</th>
                <th className="py-2.5 px-3 text-center">Stock Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-200">
              {metrics.top_products.map((p) => (
                <tr key={p.sku} className="hover:bg-warm-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-ink-primary">{p.name}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-ink-secondary">{p.sku}</td>
                  <td className="py-2.5 px-3 text-ink-secondary">{p.category}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-ink-primary tabular-nums">{p.quantity_sold}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-ink-primary tabular-nums">₹{p.revenue.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.stock_status.includes('Low')
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {p.stock_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
