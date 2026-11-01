import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Channel } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck, Key, HelpCircle } from 'lucide-react';

interface ChannelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel | null;
  onToggleDemo: (code: string, newStatus: string) => Promise<void>;
  onRetrySync: (code: string) => Promise<void>;
}

export const ChannelDetailModal: React.FC<ChannelDetailModalProps> = ({
  isOpen,
  onClose,
  channel,
  onToggleDemo,
  onRetrySync,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!channel) return null;

  let capabilities: string[] = [];
  try {
    capabilities = JSON.parse(channel.capabilities_json || '[]');
  } catch {
    capabilities = ['Order Ingestion', 'Inventory Sync'];
  }

  const handleToggle = async (status: string) => {
    setIsProcessing(true);
    try {
      await onToggleDemo(channel.code, status);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = async () => {
    setIsProcessing(true);
    try {
      await onRetrySync(channel.code);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${channel.name} — Channel Integration`}
      subtitle={`Category: ${channel.category.replace(/_/g, ' ').toUpperCase()}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between p-3.5 bg-warm-50 border border-warm-200 rounded-xl">
          <div>
            <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider block mb-1">
              Current Connection Status
            </span>
            <StatusBadge status={channel.status} type="channel" size="md" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider block mb-1">
              Last Synchronized
            </span>
            <span className="text-xs font-mono text-ink-primary">
              {channel.last_sync_at
                ? new Date(channel.last_sync_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Never'}
            </span>
          </div>
        </div>

        {/* Integration Architecture Explanation */}
        <div className="p-3 bg-purple-50/60 border border-purple-200/60 rounded-xl text-xs text-purple-950 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-purple-900">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Simulated Sandbox Environment (Prototype Safe)</span>
          </div>
          <p className="text-ink-secondary">
            In production, SellSync uses a dedicated channel adapter architecture to connect directly to {channel.name}'s verified merchant APIs. In demo mode, live orders and synchronization payloads are simulated against local persistent state without transmitting unverified calls.
          </p>
        </div>

        {/* Channel Description */}
        <div>
          <h4 className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">Channel Overview</h4>
          <p className="text-xs text-ink-secondary leading-relaxed">{channel.description}</p>
        </div>

        {/* Supported Capabilities */}
        <div>
          <h4 className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2">
            Supported Capabilities on {channel.name}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {capabilities.map((cap, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg border border-warm-200 bg-white text-xs text-ink-primary font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Production Requirements Notice */}
        <div className="border border-warm-200 rounded-xl p-3 bg-warm-50/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-primary">
            <Key className="w-4 h-4 text-ink-muted" />
            <span>Production Credentials Architecture</span>
          </div>
          <div className="text-[11px] text-ink-secondary space-y-1">
            <p>To transition this connector to live production status later:</p>
            <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px] text-ink-secondary">
              {channel.code === 'amazon' && (
                <>
                  <li>AWS LWA Client ID & Secret</li>
                  <li>Amazon SP-API Refresh Token & Role ARN</li>
                  <li>Merchant Token (Seller ID)</li>
                </>
              )}
              {channel.code === 'flipkart' && (
                <>
                  <li>Flipkart Developer App ID</li>
                  <li>Application Secret & Location ID</li>
                </>
              )}
              {channel.code === 'swiggy' || channel.code === 'zomato' ? (
                <>
                  <li>Restaurant Partner API Key</li>
                  <li>Outlet ID & Webhook Secret</li>
                </>
              ) : null}
              {channel.code === 'whatsapp' || channel.code === 'instagram' ? (
                <>
                  <li>Meta Developer Cloud App Token</li>
                  <li>WhatsApp Business Account ID (WABA)</li>
                  <li>Webhook Verification Token</li>
                </>
              ) : null}
              {channel.code === 'direct' && (
                <>
                  <li>Native Storefront / Shopify Custom App Secret</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Sync Issues if any */}
        {channel.error_details && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            <span className="font-bold block mb-1">Recent Sync Exception</span>
            <p className="font-mono text-[11px]">{channel.error_details}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-warm-200">
          <div>
            {channel.status === 'SYNC_ISSUE' ? (
              <button
                onClick={handleRetry}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Synchronization</span>
              </button>
            ) : channel.status === 'NOT_CONNECTED' ? (
              <button
                onClick={() => handleToggle('DEMO_MODE')}
                disabled={isProcessing}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors"
              >
                Enable Demo Connection
              </button>
            ) : (
              <button
                onClick={() => handleToggle('NOT_CONNECTED')}
                disabled={isProcessing}
                className="px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-rose-600 hover:bg-rose-50 border border-warm-200 rounded-lg transition-colors"
              >
                Disconnect Channel
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-ink-secondary bg-warm-100 hover:bg-warm-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
