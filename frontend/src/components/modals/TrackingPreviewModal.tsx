import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { MessageSquare, Mail, Phone, ExternalLink, Check, Copy } from 'lucide-react';

interface TrackingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: any;
}

export const TrackingPreviewModal: React.FC<TrackingPreviewModalProps> = ({
  isOpen,
  onClose,
  previewData,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [copied, setCopied] = useState(false);

  if (!previewData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(previewData.message_body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Tracking Notification Preview"
      subtitle="Automated dispatch message triggered by the Fulfilment Engine"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Channel Selector */}
        <div className="flex border-b border-warm-200">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Business (Cloud API)</span>
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'sms'
                ? 'border-brand-500 text-brand-700 bg-brand-50/50'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-brand-500" />
            <span>SMS Notification (DLT)</span>
          </button>
        </div>

        {/* Message Simulator Box */}
        {activeTab === 'whatsapp' ? (
          <div className="bg-[#efeae2] p-4 rounded-xl border border-warm-300 space-y-2">
            <div className="text-[10px] text-center text-ink-muted font-medium mb-1">
              TODAY
            </div>

            {/* WhatsApp Chat Bubble */}
            <div className="max-w-[88%] bg-white rounded-xl rounded-tl-xs p-3.5 shadow-subtle text-xs text-ink-primary space-y-2 border border-warm-200">
              <div className="whitespace-pre-line leading-relaxed font-sans">
                {previewData.message_body}
              </div>

              <div className="pt-2 border-t border-warm-100 flex items-center justify-between text-[11px] text-brand-600 font-semibold">
                <a
                  href={previewData.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  <span>Track Package Live</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[9px] text-ink-muted">12:30 PM ✓✓</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-warm-100 p-4 rounded-xl border border-warm-200 text-xs font-mono text-ink-primary whitespace-pre-line leading-relaxed">
            {previewData.message_body}
          </div>
        )}

        {/* Dispatch Metadata Summary */}
        <div className="p-3.5 bg-warm-50 border border-warm-200 rounded-xl text-xs grid grid-cols-2 gap-2 text-ink-secondary">
          <div>
            <span className="text-ink-muted block text-[10px] uppercase font-bold tracking-wider">Recipient</span>
            <span className="font-semibold text-ink-primary">{previewData.recipient_name}</span>
            <span className="block text-[11px] text-ink-secondary font-mono">{previewData.recipient_phone}</span>
          </div>
          <div>
            <span className="text-ink-muted block text-[10px] uppercase font-bold tracking-wider">Courier & Tracking</span>
            <span className="font-semibold text-ink-primary">{previewData.courier_name}</span>
            <span className="block text-[11px] font-mono text-ink-secondary tabular-nums">{previewData.tracking_number}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-ink-muted">
            Simulated message dispatch payload
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-ink-secondary bg-warm-100 hover:bg-warm-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
