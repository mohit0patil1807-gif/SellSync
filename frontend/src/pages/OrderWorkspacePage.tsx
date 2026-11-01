import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Truck,
  Package,
  Printer,
  MessageSquare,
  AlertTriangle,
  Utensils
} from 'lucide-react';
import { Order } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ChannelBadge } from '../components/common/ChannelBadge';
import { ShippingLabelModal } from '../components/modals/ShippingLabelModal';
import { TrackingPreviewModal } from '../components/modals/TrackingPreviewModal';
import { api } from '../api/client';

interface OrderWorkspacePageProps {
  orderId: number;
  onBack: () => void;
  onOrderUpdated: () => void;
}

export const OrderWorkspacePage: React.FC<OrderWorkspacePageProps> = ({
  orderId,
  onBack,
  onOrderUpdated,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [labelData, setLabelData] = useState<any>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.getOrder(orderId);
      setOrder(res);
    } catch (e: any) {
      setError(e.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Simulate Payment Action
  const handleSimulatePayment = async (action: 'verify' | 'fail' | 'mismatch') => {
    setIsProcessing(true);
    setError(null);
    try {
      const updated = await api.simulatePayment(orderId, action);
      setOrder(updated);
      onOrderUpdated();
    } catch (e: any) {
      setError(e.message || 'Payment simulation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Shipping Label
  const handleGenerateLabel = async () => {
    setIsProcessing(true);
    try {
      const data = await api.getShippingLabel(orderId);
      setLabelData(data);
      setLabelModalOpen(true);
      fetchOrder();
      onOrderUpdated();
    } catch (e: any) {
      setError(e.message || 'Failed to generate shipping label');
    } finally {
      setIsProcessing(false);
    }
  };

  // Dispatch Order
  const handleDispatch = async () => {
    setIsProcessing(true);
    try {
      const updated = await api.dispatchOrder(orderId);
      setOrder(updated);
      onOrderUpdated();
    } catch (e: any) {
      setError(e.message || 'Failed to dispatch order');
    } finally {
      setIsProcessing(false);
    }
  };

  // Preview Tracking Notification
  const handlePreviewTracking = async () => {
    setIsProcessing(true);
    try {
      const preview = await api.getTrackingPreview(orderId);
      setTrackingData(preview);
      setTrackingModalOpen(true);
    } catch (e: any) {
      setError(e.message || 'Failed to generate tracking notification preview');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-ink-muted text-xs">
        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-medium text-ink-primary">Loading Order Workspace...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-ink-muted text-xs">
        <p>Order #{orderId} not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 text-xs font-semibold text-brand-600 hover:text-brand-700">
          ← Back to Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-warm-200 hover:bg-warm-100 text-ink-secondary transition-colors shadow-subtle"
            title="Return to order inbox"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-ink-primary tracking-tight">{order.order_number}</h2>
              {order.channel && (
                <ChannelBadge code={order.channel.code} name={order.channel.name} showCategory />
              )}
              {order.order_type === 'handover' && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1">
                  <Utensils className="w-3 h-3" />
                  <span>Restaurant Order</span>
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted mt-0.5 font-mono">
              Ref: {order.external_order_id} · Placed on{' '}
              {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        {/* Current State Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} type="order" size="md" />
          <StatusBadge status={order.payment_status} type="payment" size="md" />
          <StatusBadge status={order.fulfilment_status} type="fulfilment" size="md" />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Details & Right Actions/Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Manifest, Customer, & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table Card */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-warm-200 bg-warm-50/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Manifest Items ({order.items.length})
              </span>
              <span className="text-xs text-ink-muted font-mono">Normalized Catalog SKUs</span>
            </div>

            <div className="p-5">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-warm-200 text-ink-muted font-semibold uppercase text-[10px]">
                    <th className="pb-2">Item Description</th>
                    <th className="pb-2">SKU Code</th>
                    <th className="pb-2 text-center">Quantity</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-200">
                  {order.items.map((it) => (
                    <tr key={it.id} className="py-3">
                      <td className="py-3 pr-2">
                        <div className="font-semibold text-ink-primary">{it.title}</div>
                        <div className="text-[11px] text-ink-secondary">{it.variant_title || 'Default Variant'}</div>
                      </td>
                      <td className="py-3 pr-2 font-mono text-[11px] text-ink-secondary">{it.sku}</td>
                      <td className="py-3 text-center font-semibold text-ink-primary tabular-nums">{it.quantity}</td>
                      <td className="py-3 text-right text-ink-secondary tabular-nums">₹{it.unit_price.toLocaleString()}</td>
                      <td className="py-3 text-right font-semibold text-ink-primary tabular-nums">₹{it.total_price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Calculation Breakdown */}
              <div className="mt-4 pt-4 border-t border-warm-200 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-ink-secondary">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-medium text-ink-primary">₹{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-ink-secondary">
                    <span>Shipping Fee</span>
                    <span className="tabular-nums font-medium text-ink-primary">₹{order.shipping_fee.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-semantic-success">
                      <span>Discount Applied</span>
                      <span className="tabular-nums">-₹{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {order.tax > 0 && (
                    <div className="flex justify-between text-ink-secondary">
                      <span>Tax (GST)</span>
                      <span className="tabular-nums font-medium text-ink-primary">₹{order.tax.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-warm-200 flex justify-between font-bold text-sm text-ink-primary">
                    <span>Total Amount</span>
                    <span className="tabular-nums">₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Info */}
            <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
              <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                <span>Customer Details</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-ink-primary text-sm">{order.customer_name}</div>
                <div className="text-ink-secondary font-mono">{order.customer_phone || 'No phone provided'}</div>
                <div className="text-ink-muted">{order.customer_email || 'No email provided'}</div>
              </div>
            </div>

            {/* Destination Address */}
            <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
              <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Delivery Address</span>
              </div>
              <div className="space-y-1 text-xs text-ink-secondary">
                <div>{order.delivery_address || 'Customer Pick-up'}</div>
                <div className="font-semibold text-ink-primary">
                  {order.delivery_city} {order.delivery_pincode ? `— ${order.delivery_pincode}` : ''}
                </div>
                <div className="text-[11px] text-ink-muted pt-1">
                  Type: {order.order_type === 'handover' ? 'Instant Rider Handover' : 'Standard Courier Parcel'}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment Settlement Record</span>
              </div>
              <StatusBadge status={order.payment_status} type="payment" />
            </div>

            <div className="p-3.5 bg-warm-50/70 border border-warm-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Invoice Total:</span>
                <span className="font-semibold text-ink-primary tabular-nums">₹{order.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Verification Status:</span>
                <span className="font-medium text-ink-primary">{order.payment_status}</span>
              </div>
              {order.internal_notes && (
                <div className="pt-2 border-t border-warm-200 text-ink-secondary font-mono text-[11px]">
                  Internal Notes: {order.internal_notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Demo Action Panel & Chronological Timeline */}
        <div className="space-y-6">
          {/* Action Hub */}
          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
                Operational Controls
              </span>
              <span className="text-[10px] bg-warm-100 text-ink-secondary font-medium px-2 py-0.5 rounded border border-warm-200">
                SANDBOX
              </span>
            </div>

            {/* 1. Payment Verification Simulation */}
            {order.payment_status !== 'VERIFIED' && (
              <div className="p-3.5 rounded-xl bg-warm-50/80 border border-warm-200 space-y-2">
                <div className="text-xs font-semibold text-ink-primary flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-brand-500" />
                  <span>Simulate Payment Verification</span>
                </div>
                <p className="text-[11px] text-ink-secondary leading-snug">
                  Simulate verifying the buyer's UPI transaction or marketplace payout relay without leaving SellSync.
                </p>

                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  <button
                    onClick={() => handleSimulatePayment('verify')}
                    disabled={isProcessing}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-subtle transition-all"
                  >
                    ✓ Simulate Successful UPI Verification
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleSimulatePayment('mismatch')}
                      disabled={isProcessing}
                      className="py-1.5 px-2 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg"
                    >
                      Simulate Mismatch
                    </button>
                    <button
                      onClick={() => handleSimulatePayment('fail')}
                      disabled={isProcessing}
                      className="py-1.5 px-2 text-[11px] font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                    >
                      Simulate Failure
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Fulfilment Hub */}
            <div className="p-3.5 rounded-xl bg-warm-50/80 border border-warm-200 space-y-2.5">
              <div className="text-xs font-semibold text-ink-primary flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-purple-600" />
                <span>Fulfilment & Carrier Dispatch</span>
              </div>

              <div className="space-y-2">
                {/* Generate Shipping Label */}
                <button
                  onClick={handleGenerateLabel}
                  disabled={isProcessing || order.status === 'AWAITING_PAYMENT'}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-ink-primary bg-white hover:bg-warm-100 border border-warm-200 rounded-xl shadow-subtle transition-colors disabled:opacity-40"
                >
                  <Printer className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Generate Shipping Label</span>
                </button>

                {/* Mark as Dispatched (Commit stock) */}
                {order.status !== 'DISPATCHED' && order.status !== 'DELIVERED' && (
                  <button
                    onClick={handleDispatch}
                    disabled={isProcessing || order.payment_status !== 'VERIFIED'}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle shadow-brand-500/20 transition-all disabled:opacity-40"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Mark Dispatched (Commit Stock)</span>
                  </button>
                )}

                {/* Preview Tracking Notification */}
                <button
                  onClick={handlePreviewTracking}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  <span>Preview Customer Notification</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chronological Activity Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-warm-200">
              <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
                Order Activity Timeline
              </span>
              <span className="text-[10px] text-ink-muted font-mono">Audit Log</span>
            </div>

            <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-warm-200">
              {order.activity_logs.map((log) => (
                <div key={log.id} className="relative text-xs">
                  <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-brand-500 ring-4 ring-white" />
                  <div className="font-semibold text-ink-primary">{log.action.replace(/_/g, ' ')}</div>
                  <p className="text-ink-secondary mt-0.5 leading-relaxed text-[11px]">{log.description}</p>
                  <div className="text-[10px] text-ink-muted mt-1 flex items-center justify-between tabular-nums">
                    <span>Actor: {log.actor}</span>
                    <span>
                      {new Date(log.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Label Modal */}
      <ShippingLabelModal
        isOpen={labelModalOpen}
        onClose={() => setLabelModalOpen(false)}
        labelData={labelData}
      />

      {/* Tracking Preview Modal */}
      <TrackingPreviewModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        previewData={trackingData}
      />
    </div>
  );
};
