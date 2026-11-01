import React, { useState } from 'react';
import {
  QrCode,
  Copy,
  ExternalLink,
  CheckCircle,
  MessageSquare,
  Share2,
  Sparkles,
  Info
} from 'lucide-react';
import { useI18n } from '../../i18n';

interface UpiQrGeneratorProps {
  defaultUpiId?: string;
  defaultStoreName?: string;
}

export const UpiQrGenerator: React.FC<UpiQrGeneratorProps> = ({
  defaultUpiId = 'aurastudio@upi',
  defaultStoreName = 'Aura Boutique',
}) => {
  const { t } = useI18n();
  const [upiId, setUpiId] = useState(defaultUpiId);
  const [storeName, setStoreName] = useState(defaultStoreName);
  const [amount, setAmount] = useState('1450');
  const [orderRef, setOrderRef] = useState('SS-1002');
  const [customerName, setCustomerName] = useState('Pooja Shah');
  const [customerPhone, setCustomerPhone] = useState('9820112345');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Generate standard NPCI UPI Intent URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    storeName
  )}&am=${encodeURIComponent(amount)}&tn=${encodeURIComponent(
    `Order-${orderRef}`
  )}&cu=INR`;

  // Dynamic QR Code SVG endpoint (public standard chart API or SVG canvas)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiUri
  )}&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopyFeedback('UPI Deep Link copied! Customer can tap this on mobile to open GPay/PhonePe.');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleCopyMessage = () => {
    const text = `Hi ${customerName || 'there'}! Here is your payment request from ${storeName}:\n\nAmount: ₹${amount}\nFor Order: ${orderRef}\n\nPay via UPI:\n${upiUri}\n\nOr transfer to UPI ID: ${upiId}\n\nPlease share the screenshot or UTR number once paid so we can pack your parcel! 🙏`;
    navigator.clipboard.writeText(text);
    setCopyFeedback('Polite WhatsApp payment message copied to clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = `Hi ${customerName || 'there'}! Here is your payment link from ${storeName} for order ${orderRef}:\nAmount: ₹${amount}\n\nUPI Payment Link:\n${upiUri}\n\nUPI ID: ${upiId}\n\nPlease reply with the screenshot once paid so we can ship your order! 🙏`;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-subtle space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-base font-bold text-ink-primary">
            Instant UPI QR & WhatsApp Link Generator
          </h3>
        </div>
        <p className="text-xs text-ink-secondary">
          Generate an NPCI-compliant dynamic UPI QR code or WhatsApp payment request for your customer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Form Inputs (7 cols) */}
        <div className="md:col-span-7 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink-primary mb-1">Your UPI ID (VPA)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="store@upi"
                className="w-full px-3 py-2 border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-ink-primary mb-1">Store / Payee Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Business Name"
                className="w-full px-3 py-2 border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink-primary mb-1">Amount to Collect (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted font-bold">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary font-bold text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-ink-primary mb-1">Order Number / Note</label>
              <input
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="SS-1001"
                className="w-full px-3 py-2 border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink-primary mb-1">Customer Name (Optional)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ananya Roy"
                className="w-full px-3 py-2 border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-ink-primary mb-1">Customer Phone (WhatsApp)</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="9820112345"
                className="w-full px-3 py-2 border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-subtle shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-ink-primary bg-warm-100 hover:bg-warm-200/80 rounded-xl border border-warm-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-ink-muted" />
              <span>Copy Message Template</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy UPI Deep Link</span>
            </button>
          </div>

          {copyFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{copyFeedback}</span>
            </div>
          )}
        </div>

        {/* QR Code Card (5 cols) */}
        <div className="md:col-span-5 bg-warm-50/70 p-5 rounded-2xl border border-warm-200 flex flex-col items-center text-center space-y-3">
          <div className="bg-white p-3 rounded-2xl border border-warm-200 shadow-subtle">
            <img
              src={qrImageUrl}
              alt="UPI QR Code"
              className="w-44 h-44 object-contain rounded-xl"
              onError={(e: any) => {
                // Fallback visual if offline
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div>
            <div className="text-sm font-bold text-ink-primary">Scan with Any UPI App</div>
            <div className="text-[11px] text-ink-secondary mt-0.5">
              Google Pay • PhonePe • Paytm • BHIM • CRED
            </div>
          </div>

          <div className="w-full bg-white p-2.5 rounded-xl border border-warm-200 text-left text-[11px] font-mono space-y-1">
            <div className="text-ink-muted text-[10px] font-sans font-bold uppercase">NPCI Intent String</div>
            <div className="text-ink-primary truncate select-all">{upiUri}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
