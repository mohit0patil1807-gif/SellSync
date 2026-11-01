import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Package,
  Truck,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Clock,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle,
  IndianRupee,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Store,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../api/client';
import { useI18n } from '../i18n';
import { DayEndSummaryModal } from '../components/modals/DayEndSummaryModal';
import { ChatToOrderModal } from '../components/modals/ChatToOrderModal';

interface TodayPageProps {
  onNavigateTab: (tab: any) => void;
  onOpenNewOrder: () => void;
  activePersonaId?: string;
}

export const TodayPage: React.FC<TodayPageProps> = ({
  onNavigateTab,
  onOpenNewOrder,
  activePersonaId = 'boutique',
}) => {
  const { t } = useI18n();
  const [daySummary, setDaySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dayEndModalOpen, setDayEndModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const summary = await api.getDayEndSummary();
      setDaySummary(summary);
    } catch (e) {
      console.error('Failed to load today page summary:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activePersonaId]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner: Greeting, Context & Quick Utilities */}
      <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-bold text-ink-primary tracking-tight">
              {t('today')}: {daySummary?.summary_date || 'Operations Cockpit'}
            </h1>
          </div>
          <p className="text-xs text-ink-secondary mt-1">
            Focus on what needs action right now — no clutter, no complex enterprise menus.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Day-End Close Summary */}
          <button
            onClick={() => setDayEndModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 shadow-subtle transition-all active:scale-[0.98]"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('day_end_close')}</span>
          </button>

          {/* Paste WhatsApp/IG Chat */}
          <button
            onClick={() => setChatModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-ink-primary bg-warm-100/80 hover:bg-warm-200/70 rounded-xl border border-warm-300 shadow-subtle transition-all active:scale-[0.98]"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('paste_chat')}</span>
          </button>

          {/* New Order */}
          <button
            onClick={onOpenNewOrder}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle shadow-brand-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('new_order')}</span>
          </button>
        </div>
      </div>

      {copyFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{copyFeedback} copied to clipboard!</span>
        </div>
      )}

      {/* 4 PRIMARY ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Payments to Check */}
        <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">
                {t('payments_to_check')}
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-ink-primary">
              {loading ? '...' : daySummary?.pending_payment_count || 0}
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              ₹{daySummary?.pending_collection?.toLocaleString('en-IN') || 0} awaiting verification or customer UPI screenshot.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('payments')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-subtle shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            <span>{t('check_payments')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 2: Orders to Pack */}
        <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">
                {t('orders_to_pack')}
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-ink-primary">
              {loading ? '...' : daySummary?.ready_to_pack_count || 0}
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              Confirmed & paid orders ready to box, bubble-wrap, or plate.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('orders')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-subtle shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <span>{t('start_packing')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 3: Ready to Ship / Handover */}
        <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">
                {t('ready_to_ship')}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-ink-primary">
              {loading ? '...' : daySummary?.ready_to_ship_count || 0}
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              Packed parcels waiting for courier pickup or local delivery driver.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('shipping')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-subtle shadow-emerald-600/20 transition-all active:scale-[0.98]"
          >
            <span>{t('ship_orders')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 4: Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">
                {t('low_stock')}
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-ink-primary">
              {loading ? '...' : daySummary?.low_stock_items?.length || 0}
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              Products at or below reorder threshold. Avoid over-selling on Instagram!
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('stock')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-subtle shadow-rose-600/20 transition-all active:scale-[0.98]"
          >
            <span>{t('update_stock')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TODAY'S RECENT ORDERS LEDGER */}
      <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-primary uppercase tracking-wider">
              Today's Orders Ledger
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Live orders from your local register and connected channels.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-ink-secondary">Loading today's ledger...</div>
        ) : daySummary?.orders_today && daySummary.orders_today.length > 0 ? (
          <div className="divide-y divide-warm-100">
            {daySummary.orders_today.slice(0, 6).map((ord: any) => (
              <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-warm-50/40 rounded-xl px-2 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-ink-primary text-xs">
                      {ord.order_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      ord.channel_name.toLowerCase().includes('direct')
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-warm-100 text-ink-secondary border border-warm-200'
                    }`}>
                      {ord.channel_name.toLowerCase().includes('direct') ? t('local_feature') : 'DEMO MODE'} • {ord.channel_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      ord.payment_status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {ord.payment_status === 'PAID' ? 'PAID' : 'PAYMENT PENDING'}
                    </span>
                  </div>
                  <div className="text-xs text-ink-primary font-medium">
                    {ord.customer_name} • <span className="text-ink-secondary font-normal">{ord.items_summary}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <span className="text-sm font-bold text-ink-primary">
                    ₹{ord.total_amount.toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(`${ord.customer_name}, Order ${ord.order_number}`, 'Order Summary')}
                      className="p-1.5 text-ink-muted hover:text-ink-primary hover:bg-warm-100 rounded-lg transition-colors"
                      title="Copy order info"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onNavigateTab('orders')}
                      className="px-2.5 py-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-ink-secondary">
            No orders logged today yet. Click <strong>+ New Order</strong> or <strong>Paste Chat</strong> above to start!
          </div>
        )}
      </div>

      {/* Modals */}
      <DayEndSummaryModal
        isOpen={dayEndModalOpen}
        onClose={() => setDayEndModalOpen(false)}
        onNavigateToTab={onNavigateTab}
      />
      <ChatToOrderModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        onOrderCreated={() => {
          loadData();
          onNavigateTab('orders');
        }}
      />
    </div>
  );
};
