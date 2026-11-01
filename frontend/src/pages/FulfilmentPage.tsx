import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  Printer,
  MessageSquare,
  Utensils,
  ArrowRight,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { Order, ShipmentRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ChannelBadge } from '../components/common/ChannelBadge';
import { ShippingLabelModal } from '../components/modals/ShippingLabelModal';
import { TrackingPreviewModal } from '../components/modals/TrackingPreviewModal';
import { api } from '../api/client';

interface FulfilmentPageProps {
  onOpenOrder: (orderId: number) => void;
  onRefreshAll: () => void;
}

export const FulfilmentPage: React.FC<FulfilmentPageProps> = ({ onOpenOrder, onRefreshAll }) => {
  const [activeWorkflow, setActiveWorkflow] = useState<'all' | 'courier' | 'restaurant'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [labelData, setLabelData] = useState<any>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [copiedAddressId, setCopiedAddressId] = useState<number | null>(null);

  const handleCopyCourierAddress = (ord: Order) => {
    const text = `${ord.customer_name}\nPhone: ${ord.customer_phone || ''}\n${ord.delivery_address || ''}\n${ord.delivery_city}, ${ord.delivery_pincode || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedAddressId(ord.id);
    setTimeout(() => setCopiedAddressId(null), 2500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderRes, shipRes] = await Promise.all([
        api.getOrders({ limit: 50 }),
        api.getShipments(),
      ]);
      setOrders(orderRes.items);
      setShipments(shipRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateLabel = async (orderId: number) => {
    try {
      const data = await api.getShippingLabel(orderId);
      setLabelData(data);
      setLabelModalOpen(true);
      await fetchData();
      onRefreshAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatch = async (orderId: number) => {
    try {
      await api.dispatchOrder(orderId);
      await fetchData();
      onRefreshAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreviewTracking = async (orderId: number) => {
    try {
      const preview = await api.getTrackingPreview(orderId);
      setTrackingData(preview);
      setTrackingModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const fulfilmentOrders = orders.filter((o) => {
    if (activeWorkflow === 'courier' && o.order_type !== 'courier') return false;
    if (activeWorkflow === 'restaurant' && o.order_type !== 'handover') return false;
    return o.status !== 'CANCELLED';
  });

  return (
    <div className="space-y-5">
      {/* Top Filter and Workflow Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider shrink-0 mr-1">Mode:</span>
          {[
            { id: 'all', label: 'All Fulfilment', icon: Package },
            { id: 'courier', label: 'E-Commerce Courier Parcels', icon: Truck },
            { id: 'restaurant', label: 'Restaurant / Food Handover', icon: Utensils },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeWorkflow === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveWorkflow(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white font-semibold shadow-subtle'
                    : 'bg-warm-100 text-ink-secondary hover:bg-warm-200/70 hover:text-ink-primary'
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
          title="Refresh fulfilment queue"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Two Workflow Explanatory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60">
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <h4 className="font-semibold text-ink-primary text-sm">Physical Parcel Courier Workflow</h4>
            <p className="text-ink-secondary mt-1 leading-relaxed">
              For apparel and lifestyle goods from Amazon, Flipkart, Meesho, or WhatsApp. Generate carrier shipping labels, assign Delhivery or BlueDart, and commit central stock upon dispatch.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/60">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <h4 className="font-semibold text-ink-primary text-sm">Restaurant Kitchen & Handover Workflow</h4>
            <p className="text-ink-secondary mt-1 leading-relaxed">
              For Swiggy & Zomato food and beverage orders. Kitchen queue status, rider arrival estimation, and verification handover PIN without courier airway bills.
            </p>
          </div>
        </div>
      </div>

      {/* Fulfilment Table */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-50/70 border-b border-warm-200 text-ink-muted font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order & Channel</th>
                <th className="py-3 px-3">Recipient & Destination</th>
                <th className="py-3 px-3">Items Manifest</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Packing State</th>
                <th className="py-3 px-3">Carrier / Tracking</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-warm-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading fulfilment orders...</span>
                  </td>
                </tr>
              ) : fulfilmentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-ink-muted">
                    <Package className="w-8 h-8 text-warm-300 mx-auto mb-2" />
                    <p className="font-semibold text-ink-primary">No active fulfilment orders in this queue</p>
                  </td>
                </tr>
              ) : (
                fulfilmentOrders.map((ord) => {
                  const isDispatched = ord.status === 'DISPATCHED' || ord.status === 'DELIVERED';
                  const canLabel = ord.payment_status === 'VERIFIED' && ord.order_type === 'courier';

                  return (
                    <tr key={ord.id} className="hover:bg-warm-50/70 transition-colors">
                      {/* Order & Channel */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onOpenOrder(ord.id)}
                          className="font-semibold text-ink-primary hover:text-brand-600 flex items-center gap-1"
                        >
                          <span>{ord.order_number}</span>
                          <ArrowRight className="w-3 h-3 text-ink-muted" />
                        </button>
                        <div className="mt-1 flex items-center gap-1.5">
                          {ord.channel && <ChannelBadge code={ord.channel.code} name={ord.channel.name} />}
                        </div>
                      </td>

                      {/* Recipient & Destination */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-ink-primary block">{ord.customer_name}</span>
                        <span className="text-[11px] text-ink-secondary block">
                          {ord.delivery_city} {ord.delivery_pincode ? `(${ord.delivery_pincode})` : ''}
                        </span>
                        <button
                          onClick={() => handleCopyCourierAddress(ord)}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-1.5 py-0.5 rounded transition-colors"
                          title="Copy address formatted for courier label"
                        >
                          {copiedAddressId === ord.id ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Copy Address</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Items Manifest */}
                      <td className="py-3 px-3 max-w-[200px]">
                        <span className="truncate block font-medium text-ink-primary">
                          {ord.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                        </span>
                        <span className="text-[10px] text-ink-muted">
                          {ord.order_type === 'handover' ? 'Instant Kitchen Handover' : 'Standard Courier Parcel'}
                        </span>
                      </td>

                      {/* Payment State */}
                      <td className="py-3 px-3">
                        <StatusBadge status={ord.payment_status} type="payment" />
                      </td>

                      {/* Packing State */}
                      <td className="py-3 px-3">
                        <StatusBadge status={ord.fulfilment_status} type="fulfilment" />
                      </td>

                      {/* Carrier / Tracking Details */}
                      <td className="py-3 px-3">
                        {ord.order_type === 'handover' ? (
                          <div className="text-xs">
                            <span className="font-semibold text-brand-600">PIN: 8812</span>
                            <span className="text-[10px] text-ink-muted block font-mono">Swiggy/Zomato Rider</span>
                          </div>
                        ) : isDispatched ? (
                          <div className="text-xs">
                            <span className="font-mono text-ink-primary block">DEL-9812931</span>
                            <span className="text-[10px] text-ink-muted">Delhivery Express</span>
                          </div>
                        ) : (
                          <span className="text-ink-muted text-xs">Unassigned</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canLabel && (
                            <button
                              onClick={() => handleGenerateLabel(ord.id)}
                              className="p-1.5 text-ink-secondary hover:text-ink-primary bg-warm-100 hover:bg-warm-200 rounded-lg transition-colors shadow-subtle"
                              title="Print Shipping Label"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handlePreviewTracking(ord.id)}
                            className="p-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors shadow-subtle"
                            title="Preview WhatsApp tracking message"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {!isDispatched && ord.payment_status === 'VERIFIED' && (
                            <button
                              onClick={() => handleDispatch(ord.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-subtle shadow-brand-500/20 transition-all active:scale-[0.98]"
                            >
                              Dispatch
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping Label Modal */}
      <ShippingLabelModal
        isOpen={labelModalOpen}
        onClose={() => setLabelModalOpen(false)}
        labelData={labelData}
      />

      {/* Tracking Notification Preview Modal */}
      <TrackingPreviewModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        previewData={trackingData}
      />
    </div>
  );
};
