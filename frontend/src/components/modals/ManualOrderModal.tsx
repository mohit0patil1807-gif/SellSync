import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Product } from '../../types';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (data: any) => Promise<void>;
}

export const ManualOrderModal: React.FC<ManualOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Mumbai');
  const [deliveryPincode, setDeliveryPincode] = useState('400001');
  const [channelCode, setChannelCode] = useState('direct');
  const [orderType, setOrderType] = useState<'courier' | 'handover'>('courier');
  const [items, setItems] = useState<Array<{ product_id: number; quantity: number }>>([
    { product_id: products[0]?.id || 1, quantity: 1 },
  ]);
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (products.length > 0) {
      setItems([...items, { product_id: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'product_id' | 'quantity', value: number) => {
    const next = [...items];
    next[index][field] = value;
    setItems(next);
  };

  // Calculate live estimate
  const estimatedSubtotal = items.reduce((acc, it) => {
    const prod = products.find((p) => p.id === it.product_id);
    return acc + (prod ? prod.base_price * it.quantity : 0);
  }, 0);
  const estimatedShipping = orderType === 'courier' ? 50.0 : 20.0;
  const estimatedTax = Math.round(estimatedSubtotal * 0.05 * 100) / 100;
  const estimatedTotal = estimatedSubtotal + estimatedShipping + estimatedTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Please provide customer name.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please provide delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        channel_code: channelCode,
        customer_name: customerName,
        customer_email: customerEmail || undefined,
        customer_phone: customerPhone || undefined,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        delivery_pincode: deliveryPincode,
        order_type: orderType,
        items,
        internal_notes: internalNotes || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create manual order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Manual Sales Order"
      subtitle="Enter orders received via direct customer enquiry, phone, or offline store"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Channel & Order Type Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Sales Channel Source</label>
            <select
              value={channelCode}
              onChange={(e) => setChannelCode(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
            >
              <option value="direct">Direct Storefront / Website</option>
              <option value="whatsapp">WhatsApp Direct Enquiry</option>
              <option value="instagram">Instagram DM Enquiry</option>
              <option value="amazon">Amazon Manual Sync</option>
              <option value="swiggy">Swiggy Restaurant Takeaway</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Fulfillment Workflow</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
            >
              <option value="courier">Courier Parcel (Air / Surface Delivery)</option>
              <option value="handover">Restaurant Rider Handover (OTP)</option>
            </select>
          </div>
        </div>

        {/* Customer Details */}
        <div className="border border-warm-200 rounded-xl p-3.5 bg-warm-50/50 space-y-3">
          <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Customer Details</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full px-3 py-1.5 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary mb-1">Phone Number</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary mb-1">Email (Optional)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-1.5 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-ink-secondary mb-1">Delivery Address *</label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Apartment, Street address"
                className="w-full px-3 py-1.5 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary mb-1">City & Pincode</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  required
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-2 py-1.5 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
                />
                <input
                  type="text"
                  required
                  value={deliveryPincode}
                  onChange={(e) => setDeliveryPincode(e.target.value)}
                  placeholder="PIN"
                  className="w-full px-2 py-1.5 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Items List */}
        <div className="border border-warm-200 rounded-xl p-3.5 bg-warm-50/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Line Items</span>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => {
              const selectedProd = products.find((p) => p.id === it.product_id);

              return (
                <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-warm-200 text-xs">
                  <select
                    value={it.product_id}
                    onChange={(e) => handleItemChange(idx, 'product_id', parseInt(e.target.value))}
                    className="flex-1 px-2.5 py-1.5 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku}) — ₹{p.base_price} ({p.available_stock} in stock)
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5 w-28">
                    <span className="text-ink-muted text-[10px] font-medium">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      max={selectedProd ? selectedProd.available_stock : 99}
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-warm-300 rounded-lg text-center font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
                    />
                  </div>

                  <div className="w-24 text-right font-semibold text-ink-primary tabular-nums">
                    ₹{selectedProd ? (selectedProd.base_price * it.quantity).toLocaleString() : 0}
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-ink-muted hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pricing Summary */}
          <div className="pt-2.5 border-t border-warm-200 flex justify-end text-xs text-ink-secondary">
            <div className="text-right space-y-0.5">
              <div>Subtotal: <strong className="tabular-nums font-semibold text-ink-primary">₹{estimatedSubtotal.toLocaleString()}</strong></div>
              <div>Estimated Shipping: <strong className="tabular-nums font-semibold text-ink-primary">₹{estimatedShipping}</strong></div>
              <div>GST (5%): <strong className="tabular-nums font-semibold text-ink-primary">₹{estimatedTax}</strong></div>
              <div className="text-sm font-bold text-ink-primary pt-1 border-t border-warm-200 mt-1">
                Estimated Total: <span className="tabular-nums text-brand-600">₹{estimatedTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">Internal Instructions / Notes</label>
          <input
            type="text"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="e.g. Paid in cash at warehouse counter / Request urgent packaging"
            className="w-full px-3 py-2 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-warm-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-ink-secondary bg-warm-100 hover:bg-warm-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Creating Order...' : 'Confirm & Create Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
