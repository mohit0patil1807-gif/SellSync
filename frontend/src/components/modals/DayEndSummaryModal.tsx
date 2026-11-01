import React, { useState, useEffect } from 'react';
import { X, Download, CheckCircle2, AlertTriangle, Clock, Truck, ShieldCheck, IndianRupee } from 'lucide-react';
import { api } from '../../api/client';
import { useI18n } from '../../i18n';

interface DayEndSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const DayEndSummaryModal: React.FC<DayEndSummaryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSummary();
    }
  }, [isOpen]);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDayEndSummary();
      setSummary(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load day-end summary');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!summary || !summary.orders_today || summary.orders_today.length === 0) return;

    const headers = ['Order Number', 'Customer Name', 'Channel', 'Amount (INR)', 'Payment Status', 'Payment Method', 'Status', 'Items'];
    const rows = summary.orders_today.map((o: any) => [
      `"${o.order_number}"`,
      `"${o.customer_name}"`,
      `"${o.channel_name}"`,
      o.total_amount,
      `"${o.payment_status}"`,
      `"${o.payment_method}"`,
      `"${o.status}"`,
      `"${o.items_summary.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sellsync_day_end_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-primary/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-warm-200 shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-warm-50 to-white border-b border-warm-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-primary tracking-tight">
                {t('day_end_close')}
              </h2>
              <p className="text-xs text-ink-secondary">
                {summary?.summary_date || 'Today’s Close'} • Complete reconciliation of money & parcels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink-primary hover:bg-warm-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-ink-secondary text-sm">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Calculating today's cash, orders, and fulfillment stats...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          ) : summary ? (
            <>
              {/* Financial Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                    Cash / UPI Collected
                  </span>
                  <div className="text-2xl font-bold text-emerald-950 mt-1 flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    <span>{summary.total_collected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 mt-0.5 block">
                    Verified into account
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
                    Pending Collection
                  </span>
                  <div className="text-2xl font-bold text-amber-950 mt-1 flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    <span>{summary.pending_collection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <span className="text-[11px] text-amber-700 mt-0.5 block">
                    {summary.pending_payment_count} orders awaiting payment / COD
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                  <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block">
                    Total Booked Sales
                  </span>
                  <div className="text-2xl font-bold text-ink-primary mt-1 flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    <span>{summary.total_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <span className="text-[11px] text-ink-muted mt-0.5 block">
                    Across {summary.total_orders} orders received
                  </span>
                </div>
              </div>

              {/* Fulfilment Status Checklist */}
              <div className="p-4 rounded-xl bg-white border border-warm-200 shadow-subtle space-y-3">
                <h3 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                  Parcel & Handover Status
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 bg-warm-50 rounded-lg border border-warm-200">
                    <div className="text-lg font-bold text-ink-primary">{summary.ready_to_pack_count}</div>
                    <div className="text-[11px] text-ink-secondary">To pack</div>
                  </div>
                  <div className="p-2.5 bg-warm-50 rounded-lg border border-warm-200">
                    <div className="text-lg font-bold text-ink-primary">{summary.ready_to_ship_count}</div>
                    <div className="text-[11px] text-ink-secondary">Packed / Ready</div>
                  </div>
                  <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-blue-900">
                    <div className="text-lg font-bold">{summary.shipped_today_count}</div>
                    <div className="text-[11px]">Given to Courier</div>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900">
                    <div className="text-lg font-bold">{summary.delivered_today_count}</div>
                    <div className="text-[11px]">Delivered</div>
                  </div>
                </div>
              </div>

              {/* Low Stock Warning */}
              {summary.low_stock_items && summary.low_stock_items.length > 0 && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-900">
                    <span className="font-semibold">
                      {summary.low_stock_items.length} items low in stock tonight:{' '}
                    </span>
                    {summary.low_stock_items.map((it: any) => `${it.title} (${it.available_stock} left)`).join(', ')}
                    . Remember to restock or mark sold out before morning!
                  </div>
                </div>
              )}

              {/* Today's Orders Log */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                    Today's Orders ({summary.orders_today?.length || 0})
                  </h3>
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
                <div className="border border-warm-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto text-xs">
                  <table className="w-full text-left divide-y divide-warm-200">
                    <thead className="bg-warm-50 text-ink-secondary font-semibold">
                      <tr>
                        <th className="px-3 py-2">Order #</th>
                        <th className="px-3 py-2">Customer</th>
                        <th className="px-3 py-2">Channel</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-100 bg-white">
                      {summary.orders_today?.map((ord: any) => (
                        <tr key={ord.id} className="hover:bg-warm-50/50">
                          <td className="px-3 py-2 font-mono font-medium text-ink-primary">{ord.order_number}</td>
                          <td className="px-3 py-2 text-ink-secondary">{ord.customer_name}</td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-warm-100 text-ink-secondary">
                              {ord.channel_name}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-semibold text-ink-primary">₹{ord.total_amount.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              ord.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[11px] text-ink-muted flex items-center gap-1.5 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Micro-seller close summary. Generated from your local order ledger.</span>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-warm-50 border-t border-warm-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink-primary bg-white border border-warm-200 rounded-lg shadow-subtle transition-colors"
          >
            Done
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-subtle shadow-brand-500/20 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>{t('download_orders_csv')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
