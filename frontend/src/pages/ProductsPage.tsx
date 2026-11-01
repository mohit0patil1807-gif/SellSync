import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Product } from '../types';
import { StockAdjustModal } from '../components/modals/StockAdjustModal';
import { StockMovementModal } from '../components/modals/StockMovementModal';
import { AddProductModal } from '../components/modals/AddProductModal';
import { api } from '../api/client';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts(
        categoryFilter !== 'all' ? categoryFilter : undefined,
        lowStockOnly
      );
      setProducts(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, lowStockOnly]);

  const handleAdjustStockConfirm = async (
    productId: number,
    changeQty: number,
    reason: string,
    notes?: string
  ) => {
    await api.adjustStock(productId, changeQty, reason, notes);
    await fetchProducts();
  };

  const handleQuickAdjust = async (productId: number, changeQty: number) => {
    try {
      await api.adjustStock(
        productId,
        changeQty,
        'QUICK_UPDATE',
        changeQty > 0 ? 'Stock added via 1-tap quick stepper' : 'Stock reduced via 1-tap quick stepper'
      );
      await fetchProducts();
    } catch (e: any) {
      alert(`Stock adjustment failed: ${e.message}`);
    }
  };

  const handleAddProductSubmit = async (data: any) => {
    await api.createProduct(data);
    await fetchProducts();
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, product name, or category..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-warm-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 bg-warm-50/70 text-ink-primary placeholder:text-ink-muted"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors shadow-subtle ${
                lowStockOnly
                  ? 'bg-rose-50 text-rose-800 border-rose-300 font-semibold'
                  : 'bg-white text-ink-secondary border-warm-200 hover:bg-warm-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-semantic-danger" />
              <span>Low Stock Alerts</span>
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle shadow-brand-500/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-warm-200 text-xs">
          <span className="text-ink-muted font-semibold uppercase text-[10px] tracking-wider shrink-0">Category:</span>
          {['all', 'Apparel & Fashion', 'Food & Beverages', 'Home & Kitchen', 'Accessories'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap text-xs transition-colors ${
                categoryFilter === cat
                  ? 'bg-purple-600 text-white font-medium shadow-subtle'
                  : 'bg-warm-100 text-ink-secondary hover:bg-warm-200/70 hover:text-ink-primary'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Central Formula Information Banner */}
      <div className="p-3.5 bg-warm-50 border border-warm-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-ink-secondary">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-purple-600" />
          <span>
            <strong className="text-ink-primary">Central Allocation Engine:</strong> Available Stock = Stock on Hand − Reserved Stock
          </span>
        </div>
        <div className="text-[11px] text-ink-muted">
          Real-time webhook sync broadcasted automatically across 9 connected channels
        </div>
      </div>

      {/* Central Catalog Table */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-50/70 border-b border-warm-200 text-ink-muted font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Base Price</th>
                <th className="py-3 px-3 text-center">On Hand</th>
                <th className="py-3 px-3 text-center">Reserved</th>
                <th className="py-3 px-3 text-center">Available</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Channels</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-warm-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-ink-muted">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading central product catalogue...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-ink-muted">
                    <Boxes className="w-8 h-8 text-warm-300 mx-auto mb-2" />
                    <p className="font-semibold text-ink-primary">No products match search criteria</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.available_stock <= p.low_stock_threshold;
                  const isOut = p.available_stock === 0;
                  const isExpanded = expandedRow === p.id;

                  return (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-warm-50/70 transition-colors">
                        {/* Name & Image */}
                        <td className="py-3 px-4 max-w-[240px]">
                          <div className="flex items-center gap-3">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-10 h-10 rounded-xl object-cover border border-warm-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center text-ink-muted font-bold shrink-0">
                                {p.name[0]}
                              </div>
                            )}
                            <div className="truncate">
                              <span className="font-semibold text-ink-primary block truncate">{p.name}</span>
                              <span className="text-[11px] text-ink-secondary">{p.category}</span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-3 font-mono text-[11px] text-ink-secondary font-medium">
                          {p.sku}
                        </td>

                        {/* Base Price */}
                        <td className="py-3 px-3 font-semibold text-ink-primary tabular-nums">
                          ₹{p.base_price.toLocaleString()}
                        </td>

                        {/* On Hand */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-warm-50 px-1.5 py-0.5 rounded-lg border border-warm-200">
                            <button
                              onClick={() => handleQuickAdjust(p.id, -1)}
                              disabled={p.stock_on_hand <= 0}
                              className="w-5 h-5 rounded bg-white hover:bg-warm-100 border border-warm-200 text-ink-primary font-bold text-xs flex items-center justify-center transition-colors disabled:opacity-40"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <span className="font-bold text-ink-primary tabular-nums min-w-[20px] text-center text-xs">
                              {p.stock_on_hand}
                            </span>
                            <button
                              onClick={() => handleQuickAdjust(p.id, 1)}
                              className="w-5 h-5 rounded bg-white hover:bg-warm-100 border border-warm-200 text-ink-primary font-bold text-xs flex items-center justify-center transition-colors"
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Reserved */}
                        <td className="py-3 px-3 text-center font-semibold text-amber-700 tabular-nums">
                          {p.reserved_stock}
                        </td>

                        {/* Available */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-xs tabular-nums ${
                              isOut
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : isLow
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {p.available_stock}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {isOut ? (
                            <span className="text-[11px] font-semibold text-semantic-danger">Out of Stock</span>
                          ) : isLow ? (
                            <span className="text-[11px] font-semibold text-semantic-warning flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-semantic-warning" />
                              <span>Low ({p.low_stock_threshold} min)</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-semantic-success">Healthy</span>
                          )}
                        </td>

                        {/* Channel Listings */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {p.channel_listings.map((cl) => (
                              <span
                                key={cl.id}
                                className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-warm-100 text-ink-secondary border border-warm-200"
                                title={`External ID: ${cl.external_listing_id}`}
                              >
                                {cl.external_listing_id.split('-')[0]}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.variants.length > 0 && (
                              <button
                                onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                                className="p-1.5 text-ink-muted hover:text-ink-primary rounded-lg hover:bg-warm-100 transition-colors"
                                title="View variants"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedProduct(p);
                                setMovementModalOpen(true);
                              }}
                              className="p-1.5 text-ink-secondary hover:text-ink-primary hover:bg-warm-100 rounded-lg transition-colors"
                              title="View stock movement history"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedProduct(p);
                                setAdjustModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors shadow-subtle"
                            >
                              Adjust Stock
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Variant Sub-rows */}
                      {isExpanded && p.variants.length > 0 && (
                        <tr className="bg-warm-50/50">
                          <td colSpan={9} className="px-8 py-3.5 border-b border-warm-200">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2">
                              Product Variants for {p.name}
                            </div>
                            <div className="space-y-1.5">
                              {p.variants.map((v) => (
                                <div
                                  key={v.id}
                                  className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-warm-200 text-xs shadow-subtle"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-ink-primary">{v.variant_name}</span>
                                    <span className="text-[11px] text-ink-muted font-mono">({v.sku})</span>
                                  </div>
                                  <div className="flex items-center gap-6 tabular-nums">
                                    <span className="text-ink-secondary">On Hand: {v.stock_on_hand}</span>
                                    <span className="text-amber-700">Reserved: {v.reserved_stock}</span>
                                    <span className="font-semibold text-emerald-800">Available: {v.available_stock}</span>
                                    <span className="font-semibold text-ink-primary">₹{v.price.toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        product={selectedProduct}
        onConfirm={handleAdjustStockConfirm}
      />

      {/* Stock Movement History Modal */}
      <StockMovementModal
        isOpen={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        product={selectedProduct}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddProductSubmit}
      />
    </div>
  );
};
