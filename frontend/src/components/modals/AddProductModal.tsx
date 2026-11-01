import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AlertCircle } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Apparel & Fashion');
  const [basePrice, setBasePrice] = useState<number>(999);
  const [stockOnHand, setStockOnHand] = useState<number>(20);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sku.trim() || !name.trim()) {
      setError('Please provide SKU and Product Title.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        base_price: Number(basePrice),
        stock_on_hand: Number(stockOnHand),
        reserved_stock: 0,
        low_stock_threshold: Number(lowStockThreshold),
        description: description || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Product to Central Catalog"
      subtitle="Creates a unified SKU referenced across all connected sales channels"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Internal SKU *</label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. SKU-SHIRT-02"
              className="w-full px-3 py-2 text-xs font-mono border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase bg-white text-ink-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
            >
              <option value="Apparel & Fashion">Apparel & Fashion</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Accessories">Accessories</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">Product Title *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Handcrafted Ceramic Teapot"
            className="w-full px-3 py-2 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Base Price (₹) *</label>
            <input
              type="number"
              min="1"
              required
              value={basePrice}
              onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Initial Stock *</label>
            <input
              type="number"
              min="0"
              required
              value={stockOnHand}
              onChange={(e) => setStockOnHand(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Alert Threshold</label>
            <input
              type="number"
              min="1"
              required
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">Product Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key product attributes, materials, and seller notes..."
            className="w-full px-3 py-2 text-xs border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-ink-primary"
          />
        </div>

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
            {isSubmitting ? 'Adding...' : 'Save Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
