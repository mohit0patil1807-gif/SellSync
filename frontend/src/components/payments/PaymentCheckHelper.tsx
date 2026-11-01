import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Info,
  IndianRupee,
  Sparkles,
  Check
} from 'lucide-react';
import { api } from '../../api/client';
import { useI18n } from '../../i18n';

interface PaymentCheckHelperProps {
  onOpenOrder: (orderId: number) => void;
  onRefreshAll: () => void;
}

export const PaymentCheckHelper: React.FC<PaymentCheckHelperProps> = ({
  onOpenOrder,
  onRefreshAll,
}) => {
  const { t } = useI18n();
  const [amountStr, setAmountStr] = useState('');
  const [reference, setReference] = useState('');
  const [customerHint, setCustomerHint] = useState('');
  const [searching, setSearching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSearchMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid received payment amount (e.g. 1450)');
      return;
    }

    setSearching(true);
    setMatchResult(null);
    try {
      const res = await api.matchPaymentHelper(parsedAmount, reference || undefined, customerHint || undefined);
      setMatchResult(res);
    } catch (err: any) {
      alert(`Search failed: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };

  const handleConfirmPaid = async (orderId: number) => {
    setConfirmingId(orderId);
    try {
      await api.simulatePayment(orderId, 'verify', `Verified via UPI Helper. UTR: ${reference || 'Manual check'}`);
      setSuccessToast(`Order #${orderId} marked as PAID! Stock is reserved.`);
      setTimeout(() => setSuccessToast(null), 3000);
      onRefreshAll();
      // Re-run match to reflect updated status
      if (amountStr) {
        await handleSearchMatch();
      }
    } catch (err: any) {
      alert(`Confirmation failed: ${err.message}`);
    } finally {
      setConfirmingId(null);
    }
  };

  const fillSample = (amt: number, ref: string, name: string) => {
    setAmountStr(amt.toString());
    setReference(ref);
    setCustomerHint(name);
  };

  return (
    <div className="space-y-4">
      {/* Verification Guardrail Notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Manual Verification Assistant:</strong> {t('manual_assistant_disclaimer')}{' '}
          SellSync never asks for your bank password or UPI PIN. Enter the amount and reference from your Google Pay, PhonePe, or Paytm notification to instantly cross-check with pending orders.
        </div>
      </div>

      {/* Input Form & Quick Samples */}
      <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-ink-primary">Check Incoming UPI / Bank Payment</h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Paste the payment amount and UTR number from your SMS / bank notification.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-ink-muted">Quick test:</span>
            <button
              type="button"
              onClick={() => fillSample(2499, 'UPI/40289128312', 'Pooja')}
              className="px-2 py-0.5 text-[10px] bg-warm-100 hover:bg-warm-200 text-ink-secondary rounded-lg font-medium transition-colors"
            >
              ₹2,499 (Pooja)
            </button>
            <button
              type="button"
              onClick={() => fillSample(480, 'UPI/40289199887', 'Rahul')}
              className="px-2 py-0.5 text-[10px] bg-warm-100 hover:bg-warm-200 text-ink-secondary rounded-lg font-medium transition-colors"
            >
              ₹480 (Rahul)
            </button>
          </div>
        </div>

        <form onSubmit={handleSearchMatch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-ink-primary mb-1">
              Amount Received (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted font-bold text-xs">₹</span>
              <input
                type="number"
                step="any"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="e.g. 1450"
                className="w-full pl-7 pr-3 py-2 text-xs border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-primary mb-1">
              UTR / Bank Reference (Optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. 402819871234"
              className="w-full px-3 py-2 text-xs border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-primary mb-1">
              Customer Name / Phone (Optional)
            </label>
            <input
              type="text"
              value={customerHint}
              onChange={(e) => setCustomerHint(e.target.value)}
              placeholder="e.g. Ananya or 98201"
              className="w-full px-3 py-2 text-xs border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={searching}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50 h-[34px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{searching ? 'Checking...' : 'Check Matches'}</span>
            </button>
          </div>
        </form>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Results Section */}
      {matchResult && (
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-warm-100 pb-3">
            <div>
              <h4 className="text-xs font-bold text-ink-primary">
                Match Results for ₹{matchResult.query_amount.toLocaleString('en-IN')}
              </h4>
              <p className="text-[11px] text-ink-secondary mt-0.5">
                Checked against {matchResult.total_pending_checked} pending orders in your database.
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-warm-100 text-ink-secondary">
              {matchResult.candidates.length} candidate{matchResult.candidates.length === 1 ? '' : 's'}
            </span>
          </div>

          {matchResult.candidates.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-secondary">
              <HelpCircle className="w-8 h-8 text-warm-300 mx-auto mb-2" />
              <p className="font-semibold text-ink-primary">No pending orders match this amount.</p>
              <p className="text-[11px] text-ink-muted mt-1">
                The customer may have made a typo in the amount, or the order may already be marked as PAID.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-warm-100">
              {matchResult.candidates.map((cand: any) => {
                const isExact = cand.match_status === 'PAID';
                return (
                  <div key={cand.order_id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-warm-50/50 rounded-xl px-2 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => onOpenOrder(cand.order_id)}
                          className="font-mono font-bold text-ink-primary hover:text-brand-600 text-xs flex items-center gap-1"
                        >
                          <span>{cand.order_number}</span>
                          <ArrowRight className="w-3 h-3 text-ink-muted" />
                        </button>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isExact
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isExact ? 'EXACT AMOUNT MATCH' : 'PLEASE CHECK AMOUNT'}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-100 text-ink-secondary">
                          {cand.channel_name}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-ink-primary">
                        {cand.customer_name} {cand.customer_phone ? `(${cand.customer_phone})` : ''}
                      </div>

                      <div className="text-[11px] text-ink-secondary flex items-center gap-3">
                        <span>Order Total: <strong>₹{cand.order_total.toLocaleString('en-IN')}</strong></span>
                        <span>Already Paid: <strong>₹{cand.already_paid.toLocaleString('en-IN')}</strong></span>
                        <span>Pending: <strong>₹{cand.balance_due.toLocaleString('en-IN')}</strong></span>
                      </div>

                      {!isExact && (
                        <div className="text-[11px] text-amber-800 font-medium">
                          {cand.diff < 0
                            ? `⚠️ Shortfall of ₹${Math.abs(cand.diff).toLocaleString('en-IN')}. Customer sent less than balance due.`
                            : `⚠️ Excess payment of ₹${cand.diff.toLocaleString('en-IN')}.`}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => onOpenOrder(cand.order_id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary bg-warm-100 hover:bg-warm-200 rounded-xl transition-colors"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => handleConfirmPaid(cand.order_id)}
                        disabled={confirmingId === cand.order_id}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl shadow-subtle transition-all active:scale-[0.98] ${
                          isExact
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {confirmingId === cand.order_id
                            ? 'Confirming...'
                            : isExact
                            ? 'Confirm as PAID'
                            : 'Accept & Mark Paid'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
