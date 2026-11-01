import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  RefreshCw,
  Plus,
  Utensils,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { Order } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ChannelBadge } from '../components/common/ChannelBadge';
import { ChatToOrderModal } from '../components/modals/ChatToOrderModal';
import { api } from '../api/client';

interface OrdersPageProps {
  onSelectOrder: (orderId: number) => void;
  onOpenNewOrder: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onSelectOrder, onOpenNewOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [fulfilmentFilter, setFulfilmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [copiedAddressId, setCopiedAddressId] = useState<number | null>(null);

  const handleCopyAddress = (e: React.MouseEvent, ord: Order) => {
    e.stopPropagation();
    const formatted = `${ord.customer_name}\nPhone: ${ord.customer_phone || ''}\n${ord.delivery_address || ''}\n${ord.delivery_city}, ${ord.delivery_pincode}`;
    navigator.clipboard.writeText(formatted);
    setCopiedAddressId(ord.id);
    setTimeout(() => setCopiedAddressId(null), 2500);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({
        search: search || undefined,
        channel: channelFilter,
        status: statusFilter,
        payment_status: paymentFilter,
        fulfilment_status: fulfilmentFilter,
        sort_by: sortBy,
        page,
        limit,
      });
      setOrders(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, channelFilter, statusFilter, paymentFilter, fulfilmentFilter, sortBy, page]);

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getNextAction = (order: Order) => {
    if (order.status === 'AWAITING_PAYMENT') {
      return { label: 'Verify Payment', color: 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200' };
    }
    if (order.status === 'CONFIRMED' || order.status === 'PROCESSING') {
      return { label: 'Generate Label', color: 'text-purple-800 bg-purple-50 hover:bg-purple-100 border-purple-200' };
    }
    if (order.status === 'READY_TO_DISPATCH') {
      return { label: 'Dispatch', color: 'text-sky-800 bg-sky-50 hover:bg-sky-100 border-sky-200' };
    }
    if (order.status === 'DISPATCHED') {
      return { label: 'Track', color: 'text-ink-primary bg-warm-100 hover:bg-warm-200 border-warm-200' };
    }
    if (order.status === 'EXCEPTION') {
      return { label: 'Resolve Issue', color: 'text-rose-800 bg-rose-50 hover:bg-rose-100 border-rose-200 font-semibold' };
    }
    return { label: 'Inspect', color: 'text-ink-secondary bg-warm-50 hover:bg-warm-100 border-warm-200' };
  };

  return (
    <div className="space-y-5">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search order ID (SS-1001), customer name, phone, or channel reference..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-warm-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 bg-warm-50/70 text-ink-primary placeholder:text-ink-muted"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-2 border border-warm-200 hover:bg-warm-50 text-ink-secondary rounded-xl transition-colors shadow-subtle"
              title="Refresh inbox"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChatModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-ink-primary bg-warm-100 hover:bg-warm-200/80 rounded-xl border border-warm-300 shadow-subtle transition-all active:scale-[0.98]"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Paste Chat</span>
            </button>
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle shadow-brand-500/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Order</span>
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 pt-3 border-t border-warm-200">
          {/* Channel Select */}
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-1">Channel</label>
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-warm-200 rounded-lg bg-white text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Channels (Sample)</option>
              <option value="direct">Direct Storefront (Local)</option>
              <option value="whatsapp">WhatsApp (Demo Mode)</option>
              <option value="instagram">Instagram DM (Demo Mode)</option>
              <option value="meesho">Meesho (Demo Mode)</option>
              <option value="amazon">Amazon (Demo Mode)</option>
              <option value="flipkart">Flipkart (Demo Mode)</option>
              <option value="myntra">Myntra (Demo Mode)</option>
              <option value="swiggy">Swiggy (Demo Mode)</option>
              <option value="zomato">Zomato (Demo Mode)</option>
            </select>
          </div>

          {/* Order Status Select */}
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-warm-200 rounded-lg bg-white text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Lifecycle States</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY_TO_DISPATCH">Ready to Dispatch</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
              <option value="EXCEPTION">Needs Attention</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>

          {/* Payment Status Select */}
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-1">Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-warm-200 rounded-lg bg-white text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Payments</option>
              <option value="PENDING">Pending Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="MISMATCH">Amount Mismatch</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Fulfilment Status Select */}
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-1">Fulfilment</label>
            <select
              value={fulfilmentFilter}
              onChange={(e) => {
                setFulfilmentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-warm-200 rounded-lg bg-white text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Fulfilment</option>
              <option value="UNFULFILLED">Unfulfilled</option>
              <option value="PACKED">Packed</option>
              <option value="SHIPPED">In Transit</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-1">Sort Orders</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-warm-200 rounded-lg bg-white text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Highest Amount</option>
              <option value="amount_low">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-purple-900 animate-in fade-in duration-150 shadow-subtle">
          <span className="font-semibold">
            {selectedIds.length} order{selectedIds.length === 1 ? '' : 's'} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => alert(`Simulated batch action for ${selectedIds.length} orders`)}
              className="px-3 py-1 bg-white border border-purple-300 rounded-lg text-purple-800 hover:bg-purple-100 font-medium"
            >
              Batch Generate Labels
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1 text-ink-muted hover:text-ink-primary"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-50/70 border-b border-warm-200 text-ink-muted font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 w-8">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    onChange={toggleSelectAll}
                    className="rounded border-warm-300 text-brand-500 focus:ring-brand-500"
                  />
                </th>
                <th className="py-3 px-2">Order ID & Channel</th>
                <th className="py-3 px-3">Customer & Location</th>
                <th className="py-3 px-3">Items Summary</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Lifecycle State</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Fulfilment</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-warm-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-ink-muted">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading unified orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-ink-muted">
                    <ShoppingBag className="w-8 h-8 text-warm-300 mx-auto mb-2" />
                    <p className="font-semibold text-ink-primary">No orders match filter criteria</p>
                    <p className="text-xs mt-1">Try resetting the filters or searching a different term.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const action = getNextAction(order);
                  const isSelected = selectedIds.includes(order.id);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order.id)}
                      className={`hover:bg-warm-50/70 cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-50/40' : ''
                      }`}
                    >
                      <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(order.id)}
                          className="rounded border-warm-300 text-brand-500 focus:ring-brand-500"
                        />
                      </td>

                      {/* Order ID & Channel */}
                      <td className="py-3 px-2">
                        <div className="font-semibold text-ink-primary flex items-center gap-1.5">
                          <span>{order.order_number}</span>
                          {order.order_type === 'handover' && (
                            <span title="Restaurant / Food Order" className="text-brand-500">
                              <Utensils className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          {order.channel && (
                            <ChannelBadge code={order.channel.code} name={order.channel.name} />
                          )}
                        </div>
                        <div className="text-[10px] text-ink-muted font-mono mt-0.5 truncate max-w-[120px]">
                          {order.external_order_id}
                        </div>
                      </td>

                      {/* Customer & Location */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-ink-primary">{order.customer_name}</div>
                        <div className="text-[11px] text-ink-secondary">
                          {order.delivery_city || 'India'} {order.delivery_pincode ? `(${order.delivery_pincode})` : ''}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-ink-muted tabular-nums">
                            {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          <button
                            onClick={(e) => handleCopyAddress(e, order)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-1.5 py-0.5 rounded transition-colors"
                            title="Copy address formatted for courier label"
                          >
                            {copiedAddressId === order.id ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Items Summary */}
                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="truncate font-medium text-ink-primary">
                          {order.items.map((it) => `${it.quantity}x ${it.title}`).join(', ')}
                        </div>
                        <div className="text-[10px] text-ink-muted mt-0.5">
                          {order.items.reduce((acc, it) => acc + it.quantity, 0)} item{order.items.length === 1 ? '' : 's'} total
                        </div>
                      </td>

                      {/* Total Amount (Tabular) */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-ink-primary text-sm tabular-nums">
                          ₹{order.total_amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-ink-muted">
                          {order.payment_status === 'VERIFIED' ? 'Paid Online' : 'Pending Payment'}
                        </div>
                      </td>

                      {/* Normalized Lifecycle State */}
                      <td className="py-3 px-3">
                        <StatusBadge status={order.status} type="order" />
                        {order.channel_status && (
                          <div className="text-[10px] text-ink-muted mt-1 truncate max-w-[130px]" title={order.channel_status}>
                            Native: {order.channel_status}
                          </div>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-3">
                        <StatusBadge status={order.payment_status} type="payment" />
                      </td>

                      {/* Fulfilment */}
                      <td className="py-3 px-3">
                        <StatusBadge status={order.fulfilment_status} type="fulfilment" />
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectOrder(order.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors shadow-subtle ${action.color}`}
                        >
                          {action.label}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3 border-t border-warm-200 bg-warm-50/50 flex items-center justify-between text-xs text-ink-secondary">
          <div>
            Showing <strong className="text-ink-primary tabular-nums">{orders.length}</strong> of{' '}
            <strong className="text-ink-primary tabular-nums">{total}</strong> orders
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded-lg border border-warm-200 bg-white disabled:opacity-40 hover:bg-warm-100 transition-colors shadow-subtle"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 tabular-nums">
              Page <strong className="text-ink-primary">{page}</strong> of{' '}
              <strong className="text-ink-primary">{Math.ceil(total / limit) || 1}</strong>
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="p-1 rounded-lg border border-warm-200 bg-white disabled:opacity-40 hover:bg-warm-100 transition-colors shadow-subtle"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat to Order Modal */}
      <ChatToOrderModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        onOrderCreated={fetchOrders}
      />
    </div>
  );
};
