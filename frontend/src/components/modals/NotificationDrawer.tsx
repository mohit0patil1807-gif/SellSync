import React from 'react';
import { X, AlertTriangle, AlertCircle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { AlertItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  onResolveAlert: (id: number) => void;
  onNavigateToOrder?: (orderId: number) => void;
  onNavigateToProduct?: (productId: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onResolveAlert,
  onNavigateToOrder,
  onNavigateToProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-modal border-l border-warm-200 flex flex-col z-10 animate-in slide-in-from-right duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-warm-200 flex items-center justify-between bg-warm-50/70">
          <div>
            <h2 className="text-base font-semibold text-ink-primary tracking-tight">Operational Exceptions</h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              {alerts.length} item{alerts.length === 1 ? '' : 's'} requiring attention
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink-primary hover:bg-warm-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {alerts.length === 0 ? (
            <div className="py-14 text-center text-ink-muted text-xs">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2.5 opacity-80" />
              <p className="font-semibold text-ink-primary text-sm">All operations cleared</p>
              <p className="text-xs text-ink-secondary mt-1">No open exceptions or low-stock alerts right now.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              const isWarn = alert.severity === 'WARNING';

              const borderAccent = isCrit
                ? 'border-l-4 border-l-semantic-danger'
                : isWarn
                ? 'border-l-4 border-l-semantic-warning'
                : 'border-l-4 border-l-purple-500';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border border-warm-200 bg-white shadow-subtle ${borderAccent} text-left transition-all`}
                >
                  <div className="flex items-start gap-2.5">
                    {isCrit ? (
                      <AlertCircle className="w-4 h-4 text-semantic-danger shrink-0 mt-0.5" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-4 h-4 text-semantic-warning shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-ink-primary truncate">
                          {alert.title}
                        </span>
                        <span className="text-[10px] text-ink-muted tabular-nums shrink-0">
                          {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                        {alert.description}
                      </p>

                      <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-warm-200">
                        {alert.reference_type === 'ORDER' && alert.reference_id && onNavigateToOrder ? (
                          <button
                            onClick={() => {
                              onNavigateToOrder(Number(alert.reference_id));
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                          >
                            <span>Inspect Order</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : alert.reference_type === 'PRODUCT' && alert.reference_id && onNavigateToProduct ? (
                          <button
                            onClick={() => {
                              onNavigateToProduct(Number(alert.reference_id));
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700"
                          >
                            <span>Inspect Product</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span />
                        )}

                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="px-2.5 py-1 text-xs font-medium bg-warm-50 hover:bg-warm-100 border border-warm-200 rounded-lg shadow-subtle text-ink-primary transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
