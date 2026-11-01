import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Box, X, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { Order, Product } from '../../types';
import { StatusBadge } from './StatusBadge';
import { ChannelBadge } from './ChannelBadge';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (orderId: number) => void;
  onSelectProduct: (productId: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setOrders([]);
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length >= 1) {
        setLoading(true);
        try {
          const [orderRes, productRes] = await Promise.all([
            api.getOrders({ search: query, limit: 5 }),
            api.getProducts(),
          ]);
          setOrders(orderRes.items);
          const matchedProds = productRes.filter(
            (p) =>
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              p.sku.toLowerCase().includes(query.toLowerCase()) ||
              p.category.toLowerCase().includes(query.toLowerCase())
          );
          setProducts(matchedProds.slice(0, 5));
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setOrders([]);
        setProducts([]);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-modal border border-warm-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-warm-200 gap-3 bg-warm-50/60">
          <Search className="w-5 h-5 text-ink-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, customers, SKUs, products, or channels..."
            className="w-full bg-transparent text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-ink-muted hover:text-ink-primary">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 divide-y divide-warm-200">
          {loading && (
            <div className="py-8 text-center text-xs text-ink-muted">Searching records...</div>
          )}

          {!loading && query && orders.length === 0 && products.length === 0 && (
            <div className="py-8 text-center text-xs text-ink-muted">
              No matching orders or products found for "{query}".
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 text-center text-xs text-ink-muted">
              Type at least 1 character to search across all operational data.
            </div>
          )}

          {/* Orders Match Section */}
          {orders.length > 0 && (
            <div className="pb-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2 px-2">
                Orders ({orders.length})
              </div>
              <div className="space-y-1">
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => {
                      onSelectOrder(ord.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-warm-50 border border-transparent hover:border-warm-200 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/60">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-ink-primary">{ord.order_number}</span>
                          <span className="text-xs text-ink-secondary">· {ord.customer_name}</span>
                          {ord.channel && <ChannelBadge code={ord.channel.code} name={ord.channel.name} />}
                        </div>
                        <div className="text-[11px] text-ink-muted mt-0.5 truncate max-w-sm">
                          {ord.items.map((i) => i.title).join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-ink-primary tabular-nums">
                          ₹{ord.total_amount.toLocaleString()}
                        </div>
                        <StatusBadge status={ord.status} type="order" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-ink-primary transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Match Section */}
          {products.length > 0 && (
            <div className="pt-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2 px-2">
                Products ({products.length})
              </div>
              <div className="space-y-1">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-warm-50 border border-transparent hover:border-warm-200 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60">
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-ink-primary">{p.name}</div>
                        <div className="text-[11px] text-ink-muted mt-0.5 font-mono">
                          {p.sku} · {p.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-ink-primary tabular-nums">
                          ₹{p.base_price.toLocaleString()}
                        </div>
                        <span
                          className={`text-[11px] font-medium tabular-nums ${
                            p.available_stock <= p.low_stock_threshold ? 'text-semantic-danger' : 'text-ink-muted'
                          }`}
                        >
                          {p.available_stock} in stock
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-ink-primary transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
