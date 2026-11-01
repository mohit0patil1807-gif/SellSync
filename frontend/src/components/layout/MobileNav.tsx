import React from 'react';
import {
  Calendar,
  ShoppingBag,
  Boxes,
  CreditCard,
  Truck,
  MoreHorizontal
} from 'lucide-react';
import { NavItem } from './Sidebar';
import { useI18n } from '../../i18n';

interface MobileNavProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  awaitingPaymentCount?: number;
  ordersToPackCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  awaitingPaymentCount = 0,
  ordersToPackCount = 0,
}) => {
  const { t } = useI18n();

  const navItems = [
    { id: 'overview' as NavItem, label: t('today'), icon: Calendar },
    {
      id: 'orders' as NavItem,
      label: t('orders'),
      icon: ShoppingBag,
      badge: ordersToPackCount > 0 ? ordersToPackCount : undefined
    },
    { id: 'inventory' as NavItem, label: t('stock'), icon: Boxes },
    {
      id: 'payments' as NavItem,
      label: t('payments'),
      icon: CreditCard,
      badge: awaitingPaymentCount > 0 ? awaitingPaymentCount : undefined
    },
    { id: 'fulfilment' as NavItem, label: t('shipping'), icon: Truck },
    { id: 'business' as NavItem, label: t('more'), icon: MoreHorizontal },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-warm-200 z-40 px-1 py-1 shadow-elevated">
      <div className="grid grid-cols-6 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (item.id === 'business' && ['business', 'validation', 'presentation', 'analytics', 'channels', 'automations', 'settings'].includes(currentTab));

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`min-h-[48px] py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                isActive
                  ? 'text-brand-600 bg-brand-50/70 font-semibold'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-warm-50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] bg-brand-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center px-0.5">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
