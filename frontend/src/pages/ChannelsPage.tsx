import React, { useState, useEffect } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Settings2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Channel } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ChannelBadge } from '../components/common/ChannelBadge';
import { ChannelDetailModal } from '../components/modals/ChannelDetailModal';
import { api } from '../api/client';

export const ChannelsPage: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const data = await api.getChannels();
      setChannels(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleToggleDemo = async (code: string, newStatus: string) => {
    await api.toggleChannelStatus(code, newStatus);
    await fetchChannels();
  };

  const handleRetrySync = async (code: string) => {
    await api.retryChannelSync(code);
    await fetchChannels();
  };

  return (
    <div className="space-y-6">
      {/* Header and Architecture Info */}
      <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                Omnichannel Gateway
              </span>
              <span className="text-[11px] text-ink-muted">Unified Connector Architecture</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
              Channel Connectors Directory
            </h1>
            <p className="text-xs text-ink-secondary mt-1 max-w-2xl leading-relaxed">
              Multi-channel ingestion, catalog synchronization, and carrier routing from one central adapter architecture.
            </p>
          </div>
          <button
            onClick={fetchChannels}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-ink-primary bg-warm-100 hover:bg-warm-200 rounded-xl transition-colors self-start sm:self-auto border border-warm-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-ink-secondary ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Sync Status</span>
          </button>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-950">Demonstration Mode Active:</strong> Integrations marked <code className="px-1 py-0.5 bg-amber-100/70 rounded text-[11px] font-mono text-amber-900 font-semibold">DEMO MODE</code> run on realistic simulated payloads with persistent database records. When verified merchant API keys or OAuth tokens are added, SellSync switches the connector to verified <code className="px-1 py-0.5 bg-emerald-100/70 rounded text-[11px] font-mono text-emerald-900 font-semibold">CONNECTED</code> status.
          </div>
        </div>
      </div>

      {/* Grid of 9 Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {channels.map((ch) => {
          let capabilities: string[] = [];
          try {
            capabilities = JSON.parse(ch.capabilities_json || '[]');
          } catch {
            capabilities = ['Order Ingestion'];
          }

          return (
            <div
              key={ch.code}
              className="bg-white rounded-2xl border border-warm-200 shadow-card hover:shadow-float hover:border-warm-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3.5">
                {/* Channel Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <ChannelBadge code={ch.code} name={ch.name} showCategory />
                    <h3 className="font-semibold text-ink-primary text-sm mt-2">{ch.name}</h3>
                  </div>
                  <StatusBadge status={ch.status} type="channel" size="sm" />
                </div>

                {/* Description */}
                <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed">
                  {ch.description}
                </p>

                {/* Capabilities */}
                <div className="pt-2.5 border-t border-warm-100">
                  <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                    Supported Operations
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {capabilities.slice(0, 3).map((cap, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-warm-50 text-ink-secondary border border-warm-200"
                      >
                        ✓ {cap}
                      </span>
                    ))}
                    {capabilities.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] text-ink-muted">
                        +{capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Last Sync */}
                <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1 tabular-nums">
                  <span>Last Sync:</span>
                  <span className="font-medium text-ink-secondary">
                    {ch.last_sync_at
                      ? new Date(ch.last_sync_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Not synced'}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-warm-50/70 border-t border-warm-200 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedChannel(ch);
                    setModalOpen(true);
                  }}
                  className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Configure Connector</span>
                </button>

                {ch.status === 'NOT_CONNECTED' ? (
                  <button
                    onClick={() => handleToggleDemo(ch.code, 'DEMO_MODE')}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-subtle transition-colors"
                  >
                    Enable Demo
                  </button>
                ) : (
                  <span className="text-[10px] text-ink-muted uppercase font-semibold">
                    {ch.status === 'CONNECTED' ? 'Verified API' : 'Sandbox Ready'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Channel Detail & Settings Modal */}
      <ChannelDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        channel={selectedChannel}
        onToggleDemo={handleToggleDemo}
        onRetrySync={handleRetrySync}
      />
    </div>
  );
};
