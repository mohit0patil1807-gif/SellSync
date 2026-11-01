import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Product } from '../../types';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (productId: number, changeQty: number, reason: string, notes?: string) => Promise<void>;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [qty, setQty] = useState<number>(5);
  const [reason, setReason] = useState<string>('RESTOCK');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const changeQty = adjustmentType === 'add' ? Number(qty) : -Number(qty);
  const newOnHand = product.stock_on_hand + changeQty;
  const newAvailable = Math.max(0, newOnHand - product.reserved_stock);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (qty <= 0) {
      setError('Please enter a quantity greater than zero.');
      return;
    }

    if (newOnHand < 0) {
      setError('Stock on hand cannot become negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(product.id, changeQty, reason, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock — ${product.name}`}
      subtitle={`SKU: ${product.sku} · Central Inventory`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Current State Indicator */}
        <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-warm-50 border border-warm-200 rounded-xl text-center text-xs">
          <div>
            <span className="text-ink-muted block text-[10px] uppercase font-bold tracking-wider">On Hand</span>
            <span className="text-base font-bold text-ink-primary font-mono tabular-nums">{product.stock_on_hand}</span>
          </div>
          <div>
            <span className="text-ink-muted block text-[10px] uppercase font-bold tracking-wider">Reserved</span>
            <span className="text-base font-bold text-amber-600 font-mono tabular-nums">{product.reserved_stock}</span>
          </div>
          <div>
            <span className="text-ink-muted block text-[10px] uppercase font-bold tracking-wider">Available</span>
            <span className="text-base font-bold text-emerald-600 font-mono tabular-nums">{product.available_stock}</span>
          </div>
        </div>

        {/* Adjustment Type Segment */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1.5">Adjustment Direction</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setAdjustmentType('add');
                setReason('RESTOCK');
              }}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                adjustmentType === 'add'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-white text-ink-secondary border-warm-200 hover:bg-warm-50'
              }`}
            >
              + Add Stock (Restock / Return)
            </button>
            <button
              type="button"
              onClick={() => {
                setAdjustmentType('remove');
                setReason('DAMAGE');
              }}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                adjustmentType === 'remove'
                  ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-white text-ink-secondary border-warm-200 hover:bg-warm-50'
              }`}
            >
              - Remove Stock (Damage / Loss)
            </button>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Quantity to {adjustmentType === 'add' ? 'Add' : 'Remove'}
          </label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
            required
          />
        </div>

        {/* Reason Select */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">Reason for Adjustment</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
          >
            {adjustmentType === 'add' ? (
              <>
                <option value="RESTOCK">Supplier Restock Shipment</option>
                <option value="RETURN_RESTOCK">Customer Return to Inventory</option>
                <option value="AUDIT_CORRECTION">Audit Count Discrepancy (Found Extra)</option>
                <option value="MANUAL_ADJUSTMENT">Other Manual Adjustment</option>
              </>
            ) : (
              <>
                <option value="DAMAGE">Damaged / Expired Goods</option>
                <option value="LOSS">Shrinkage / Inventory Loss</option>
                <option value="SAMPLE_DISPATCH">Marketing Sample / Promotion</option>
                <option value="AUDIT_CORRECTION">Audit Discrepancy (Missing)</option>
                <option value="MANUAL_ADJUSTMENT">Other Manual Reduction</option>
              </>
            )}
          </select>
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">Internal Notes (Optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. PO-8910 received from Tirupur warehouse"
            className="w-full px-3 py-2 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
          />
        </div>

        {/* Projection Box */}
        <div className="p-3.5 bg-brand-50/40 border border-brand-200/50 rounded-xl flex items-center justify-between text-xs">
          <span className="text-ink-secondary font-medium">Updated Available Stock:</span>
          <div className="flex items-center gap-2">
            <span className="text-ink-muted line-through font-mono tabular-nums">{product.available_stock}</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-500" />
            <span className="font-bold text-sm text-brand-600 font-mono tabular-nums">{newAvailable} units</span>
          </div>
        </div>

        {/* Actions */}
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
            disabled={isSubmitting || newOnHand < 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Apply Stock Change'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
