import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  QrCode,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { PaymentRecord, SettlementRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PaymentCheckHelper } from '../components/payments/PaymentCheckHelper';
import { UpiQrGenerator } from '../components/payments/UpiQrGenerator';
import { api } from '../api/client';
import { useI18n } from '../i18n';

interface PaymentsPageProps {
  onOpenOrder: (orderId: number) => void;
  onRefreshAll: () => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ onOpenOrder, onRefreshAll }) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'check_helper' | 'upi_qr' | 'payments' | 'settlements' | 'exceptions'>('check_helper');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, setRes] = await Promise.all([
        api.getPayments(),
        api.getSettlements(),
      ]);
      setPayments(payRes);
      setSettlements(setRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulate = async (orderId: number, action: 'verify' | 'fail' | 'mismatch') => {
    setIsSimulating(true);
    try {
      await api.simulatePayment(orderId, action);
      await fetchData();
      onRefreshAll();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const exceptionPayments = payments.filter(
    (p) => p.verification_status === 'MISMATCH' || p.verification_status === 'FAILED'
  );

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Top Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-warm-200 shadow-subtle">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'check_helper', label: 'Payment Check Helper', icon: Search },
            { id: 'upi_qr', label: 'UPI QR & Payment Link', icon: QrCode },
            { id: 'payments', label: `Customer Payments (${payments.length})`, icon: CreditCard },
            { id: 'settlements', label: `Marketplace Payouts (${settlements.length})`, icon: Building },
            { id: 'exceptions', label: `Exceptions (${exceptionPayments.length})`, icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-subtle shadow-brand-500/20'
                    : 'bg-warm-100/80 text-ink-secondary hover:bg-warm-200/70 hover:text-ink-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-xl border border-warm-200 text-ink-secondary hover:bg-warm-100 transition-colors self-end sm:self-auto shadow-subtle"
          title="Refresh payment records"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Security Best Practice Notice */}
      <div className="p-3.5 bg-warm-50 border border-warm-200 rounded-xl text-xs text-ink-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong className="text-ink-primary">Zero Sensitive Data Storage:</strong> SellSync does not ask for or store customer UPI PINs, CVVs, or bank logins. All operations rely on immutable UTR reference matching and local seller checks.
          </span>
        </div>
        <span className="text-[11px] text-ink-muted font-mono shrink-0">PCI-DSS / RBI Sandbox Safe</span>
      </div>

      {/* TAB 1: Payment Check Helper */}
      {activeTab === 'check_helper' && (
        <PaymentCheckHelper
          onOpenOrder={onOpenOrder}
          onRefreshAll={() => {
            fetchData();
            onRefreshAll();
          }}
        />
      )}

      {/* TAB 2: UPI QR & Link Generator */}
      {activeTab === 'upi_qr' && (
        <UpiQrGenerator />
      )}

      {/* TAB 3: Customer Payments Table */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-warm-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-50/70 border-b border-warm-200 text-ink-muted font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payment Ref</th>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Gateway / UTR</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Transaction Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-warm-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-ink-primary">{pay.payment_reference}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onOpenOrder(pay.order_id)}
                        className="font-semibold text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <span>Order #{pay.order_id}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-3 px-3 font-bold text-ink-primary text-sm tabular-nums">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-ink-secondary">{pay.payment_method}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-ink-muted">
                      {pay.gateway_reference || 'Pending Sync'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={pay.verification_status} type="payment" />
                    </td>
                    <td className="py-3 px-3 text-ink-muted text-[11px] tabular-nums">
                      {new Date(pay.transaction_date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {pay.verification_status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSimulate(pay.order_id, 'verify')}
                            disabled={isSimulating}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-subtle"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => handleSimulate(pay.order_id, 'mismatch')}
                            disabled={isSimulating}
                            className="px-2 py-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg"
                          >
                            Mismatch
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenOrder(pay.order_id)}
                          className="px-2.5 py-1 text-xs font-medium text-ink-secondary hover:text-ink-primary bg-warm-100 hover:bg-warm-200 rounded-lg shadow-subtle"
                        >
                          View Order
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Marketplace Settlements */}
      {activeTab === 'settlements' && (
        <div className="bg-white rounded-2xl border border-warm-200 shadow-subtle overflow-hidden">
          <div className="p-4 bg-warm-50/70 border-b border-warm-200 text-xs text-ink-secondary flex items-center justify-between">
            <span>
              Simulated marketplace payouts received from channels minus platform commissions.
            </span>
            <span className="font-bold text-ink-primary tabular-nums">
              Total Net Settled: ₹{settlements.reduce((a, b) => a + b.net_settlement, 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-50/70 border-b border-warm-200 text-ink-muted font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Settlement Reference</th>
                  <th className="py-3 px-3">Marketplace Partner</th>
                  <th className="py-3 px-3 text-right">Gross Amount</th>
                  <th className="py-3 px-3 text-right">Commissions</th>
                  <th className="py-3 px-3 text-right">Net Bank Payout</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-warm-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-ink-primary">{s.settlement_reference}</td>
                    <td className="py-3 px-3 font-semibold text-ink-primary">{s.channel_name}</td>
                    <td className="py-3 px-3 text-right text-ink-secondary tabular-nums">
                      ₹{s.gross_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-600 font-medium tabular-nums">
                      -₹{s.deductions.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-800 text-sm tabular-nums">
                      ₹{s.net_settlement.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-ink-muted font-mono text-[11px] tabular-nums">
                      {new Date(s.settlement_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-ink-muted text-[11px] max-w-xs truncate">{s.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Exceptions */}
      {activeTab === 'exceptions' && (
        <div className="bg-white rounded-2xl border border-warm-200 shadow-subtle p-6">
          <h3 className="text-sm font-bold text-ink-primary mb-1">Payment Verification Exceptions</h3>
          <p className="text-xs text-ink-secondary mb-4">Orders with mismatched settlement amounts or failed gateway callbacks.</p>

          {exceptionPayments.length === 0 ? (
            <div className="py-12 text-center text-ink-muted text-xs">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-ink-primary">No payment exceptions</p>
              <p className="text-xs text-ink-secondary mt-0.5">All customer transactions reconciled without mismatches.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exceptionPayments.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-rose-200 bg-white shadow-subtle flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-ink-primary">{p.payment_reference}</span>
                      <StatusBadge status={p.verification_status} type="payment" />
                    </div>
                    <p className="text-xs text-ink-secondary mt-1">{p.failure_reason || 'Amount difference between order and bank intent.'}</p>
                  </div>
                  <button
                    onClick={() => onOpenOrder(p.order_id)}
                    className="px-3 py-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 border border-brand-200 rounded-lg shadow-subtle"
                  >
                    Resolve Order #{p.order_id}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
