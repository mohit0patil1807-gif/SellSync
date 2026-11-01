import React, { useState } from 'react';
import { X, MessageSquare, CheckCircle, AlertCircle, ShoppingBag, ArrowRight, ShieldCheck, Copy } from 'lucide-react';
import { api } from '../../api/client';
import { useI18n } from '../../i18n';

interface ChatToOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: () => void;
}

export const ChatToOrderModal: React.FC<ChatToOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { t } = useI18n();
  const [chatText, setChatText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form override fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [channelCode, setChannelCode] = useState('whatsapp');
  const [paymentStatus, setPaymentStatus] = useState('PENDING');

  const sampleChats = [
    {
      label: 'WhatsApp Kurti Order',
      text: `Hi didi! Need this urgently:\nName: Ananya Sharma\nPhone: 98201 12345\nAddress: Flat 402, Sunshine Heights, Linking Road, Bandra West, Mumbai 400050\nItem: 1 pc of Gulab Jamun Pink Kurti Set size M\nPlease send your UPI QR code!`,
    },
    {
      label: 'Instagram Cake Order',
      text: `Hey! Booking a cake for my anniversary:\nName: Rohan Mehra\nMob: 9811223344\nAddress: 14B, Green Park Main, Delhi 110016\nItem: Belgian Chocolate Truffle Cake 1kg\nI have already GPay-ed you ₹1250, ref: UPI/439201!`,
    },
    {
      label: 'Reseller Household Utility',
      text: `Order details:\nPooja Hegde, 9765432100\nHouse 12, Indiranagar 1st Stage, Bengaluru 560038\nItem: 2 pcs of Airtight Spice Box Container\nCOD please.`,
    },
  ];

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || chatText;
    if (!text.trim()) {
      setError('Please paste a chat message first');
      return;
    }

    setParsing(true);
    setError(null);
    try {
      const res = await api.parseChat(text);
      setParsedData(res);
      setCustomerName(res.customer_name);
      setCustomerPhone(res.customer_phone);
      setDeliveryAddress(res.delivery_address);
      setDeliveryCity(res.delivery_city);
      setDeliveryPincode(res.delivery_pincode);
    } catch (e: any) {
      setError(e.message || 'Failed to parse chat message');
    } finally {
      setParsing(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!customerName || !customerPhone) {
      setError('Customer name and phone number are required');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const itemsToSubmit = parsedData?.items && parsedData.items.length > 0
        ? parsedData.items.map((it: any) => ({
            product_id: it.product_id,
            sku: it.sku,
            quantity: it.quantity || 1,
            unit_price: it.unit_price || 0,
          }))
        : [];

      await api.createOrder({
        channel_code: channelCode,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: '',
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity || 'Mumbai',
        delivery_pincode: deliveryPincode || '400001',
        payment_status: paymentStatus,
        internal_notes: `Created via Quick Chat-to-Order parser. Raw: ${chatText.slice(0, 150)}...`,
        items: itemsToSubmit.length > 0 ? itemsToSubmit : [
          {
            product_id: 1,
            sku: 'DIRECT-ITEM',
            quantity: 1,
            unit_price: 500,
          }
        ],
      });

      if (onOrderCreated) {
        onOrderCreated();
      }
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-primary/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-warm-200 shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-50/50 to-white border-b border-warm-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ink-primary tracking-tight">
                  {t('paste_chat')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {t('local_feature')}
                </span>
              </div>
              <p className="text-xs text-ink-secondary">
                Converts messy WhatsApp & Instagram DM chats into structured orders in 2 seconds
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

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Paste Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-ink-primary">
                Customer Message
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-ink-muted">Try sample:</span>
                {sampleChats.map((sc, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setChatText(sc.text);
                      handleParse(sc.text);
                    }}
                    className="text-[11px] text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    {sc.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Paste customer message with Name, Phone, Address, PIN code and Item..."
              rows={4}
              className="w-full px-3.5 py-2.5 text-xs text-ink-primary bg-warm-50 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-sans resize-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-ink-muted">
                Extracts Indian 10-digit mobile, 6-digit PIN & matching product SKUs locally.
              </span>
              <button
                onClick={() => handleParse()}
                disabled={parsing || !chatText.trim()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-subtle transition-all disabled:opacity-50"
              >
                {parsing ? 'Extracting...' : 'Parse Message'}
              </button>
            </div>
          </div>

          {/* Parsed Extracted Form */}
          {parsedData && (
            <div className="p-4 rounded-xl bg-warm-50/70 border border-warm-200 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-warm-200/80 pb-2">
                <span className="text-xs font-bold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Extracted Details (Review & Edit)
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  parsedData.confidence === 'HIGH' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {parsedData.confidence} Confidence
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-ink-secondary block mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-warm-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-ink-secondary block mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-warm-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    {parsedData.phone_valid && (
                      <span className="absolute right-2 top-1.5 text-[10px] font-semibold text-emerald-600">
                        10-Digit Valid
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-ink-secondary block mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-warm-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-ink-secondary block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-warm-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-ink-secondary block mb-1">
                    PIN Code (6 digits)
                  </label>
                  <input
                    type="text"
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-warm-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-ink-secondary block mb-1">
                    Channel Source
                  </label>
                  <select
                    value={channelCode}
                    onChange={(e) => setChannelCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-warm-200 rounded-lg focus:outline-none"
                  >
                    <option value="whatsapp">WhatsApp Order</option>
                    <option value="instagram">Instagram DM</option>
                    <option value="direct">Direct / Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-ink-secondary block mb-1">
                    Initial Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-warm-200 rounded-lg focus:outline-none"
                  >
                    <option value="PENDING">Pending (UPI / Check)</option>
                    <option value="PAID">Already Paid (GPay / PhonePe)</option>
                  </select>
                </div>
              </div>

              {/* Matched Products */}
              <div>
                <label className="text-[11px] font-medium text-ink-secondary block mb-1.5">
                  Matched Catalog Items
                </label>
                {parsedData.items && parsedData.items.length > 0 ? (
                  <div className="space-y-1.5">
                    {parsedData.items.map((it: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-white rounded-lg border border-warm-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-3.5 h-3.5 text-brand-500" />
                          <div>
                            <span className="font-semibold text-ink-primary">{it.name}</span>
                            <span className="text-[10px] text-ink-muted ml-2 font-mono">[{it.sku}]</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-ink-secondary">Qty: {it.quantity}</span>
                          <span className="font-semibold text-ink-primary">₹{it.total_price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                    No exact SKU match found in catalog. Order will be created with default direct sale item.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-[11px] text-ink-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Zero third-party AI APIs used. Operates 100% locally via deterministic Indian commerce rules.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-warm-50 border-t border-warm-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink-primary bg-white border border-warm-200 rounded-lg shadow-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateOrder}
            disabled={creating || !parsedData}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-subtle shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{creating ? 'Creating Order...' : 'Create Confirmed Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
