import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Product, StockMovement } from '../../types';
import { api } from '../../api/client';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setLoading(true);
      api
        .getStockMovements(product.id)
        .then(setMovements)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, product]);

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Inventory Movement History — ${product.name}`}
      subtitle={`SKU: ${product.sku} · Complete audit log`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-ink-muted">Loading audit log...</div>
        ) : movements.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink-muted">
            No stock movements recorded for this product yet.
          </div>
        ) : (
          <div className="divide-y divide-warm-100 border border-warm-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-warm-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted grid grid-cols-12 gap-2">
              <span className="col-span-3">Timestamp</span>
              <span className="col-span-2">Change</span>
              <span className="col-span-4">Reason & Type</span>
              <span className="col-span-3">Details / Reference</span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-warm-100">
              {movements.map((m) => {
                const isPositive = m.change_qty > 0;
                const isZero = m.change_qty === 0;

                return (
                  <div
                    key={m.id}
                    className="px-4 py-2.5 text-xs grid grid-cols-12 gap-2 items-center hover:bg-warm-50/60 transition-colors"
                  >
                    <span className="col-span-3 text-ink-secondary font-mono text-[11px] tabular-nums">
                      {new Date(m.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <span className="col-span-2">
                      <span
                        className={`inline-flex items-center gap-1 font-bold font-mono tabular-nums ${
                          isPositive
                            ? 'text-emerald-600'
                            : isZero
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : isZero ? (
                          <History className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isPositive ? `+${m.change_qty}` : m.change_qty === 0 ? 'Reserve' : m.change_qty}
                        </span>
                      </span>
                    </span>

                    <span className="col-span-4 font-medium text-ink-primary">
                      {m.reason.replace(/_/g, ' ')}
                    </span>

                    <span className="col-span-3 text-ink-muted text-[11px] truncate">
                      {m.notes || (m.reference_id ? `Ref: #${m.reference_id}` : '—')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-ink-secondary bg-warm-100 hover:bg-warm-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
