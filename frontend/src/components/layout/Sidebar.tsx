import React from 'react';
import {
  Calendar,
  ShoppingBag,
  Boxes,
  CreditCard,
  Truck,
  BarChart3,
  Layers,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Users,
  Presentation,
  ShieldCheck,
  MoreHorizontal
} from 'lucide-react';
import { useI18n } from '../../i18n';

export type NavItem =
  | 'overview'
  | 'orders'
  | 'inventory'
  | 'payments'
  | 'fulfilment'
  | 'analytics'
  | 'channels'
  | 'automations'
  | 'business'
  | 'validation'
  | 'presentation'
  | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  awaitingPaymentCount?: number;
  lowStockCount?: number;
  activePersonaName?: string;
  activePersonaTag?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  awaitingPaymentCount = 0,
  lowStockCount = 0,
  activePersonaName = 'Aura Fashion Studio',
  activePersonaTag = 'Boutique',
}) => {
  const { t } = useI18n();

  // 6 Primary Destinations
  const primaryItems = [
    { id: 'overview' as NavItem, label: t('today'), icon: Calendar },
    {
      id: 'orders' as NavItem,
      label: t('orders'),
      icon: ShoppingBag,
      badge: awaitingPaymentCount > 0 ? awaitingPaymentCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200'
    },
    {
      id: 'inventory' as NavItem,
      label: t('stock'),
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200'
    },
    { id: 'payments' as NavItem, label: t('payments'), icon: CreditCard },
    { id: 'fulfilment' as NavItem, label: t('shipping'), icon: Truck },
  ];

  // Secondary Tools (Operations & Channels)
  const secondaryItems = [
    { id: 'channels' as NavItem, label: t('channels'), icon: Layers },
    { id: 'analytics' as NavItem, label: t('analytics'), icon: BarChart3 },
    { id: 'automations' as NavItem, label: t('automations'), icon: Zap },
  ];

  // Startup Readiness & Research Lab
  const startupItems = [
    { id: 'validation' as NavItem, label: t('validation'), icon: Users },
    { id: 'business' as NavItem, label: t('business'), icon: Briefcase },
    {
      id: 'presentation' as NavItem,
      label: t('presentation'),
      icon: Presentation,
      badge: 'MDMIE01',
      badgeColor: 'bg-purple-100 text-purple-800 border border-purple-200'
    },
    { id: 'settings' as NavItem, label: t('settings'), icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-warm-200 text-ink-primary flex flex-col transition-all duration-200 select-none shadow-subtle ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-warm-200">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-subtle shrink-0">
              S
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-ink-primary tracking-tight">SellSync</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200 rounded">
                  DEMO
                </span>
              </div>
              <p className="text-[11px] text-ink-muted truncate">Micro-seller commerce OS</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-subtle">
              S
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-warm-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Persona Store Indicator */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 border-b border-warm-200/80 bg-warm-50/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Active Demo Store</span>
            <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-100 text-emerald-800 rounded">
              {activePersonaTag}
            </span>
          </div>
          <div className="text-xs font-bold text-ink-primary mt-0.5 truncate">
            {activePersonaName}
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* Primary 6 Operations */}
        <div>
          {!isCollapsed && (
            <div className="px-2.5 pb-1 text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              Daily Operations
            </div>
          )}
          <div className="space-y-0.5">
            {primaryItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-subtle'
                      : 'text-ink-secondary hover:bg-warm-100/70 hover:text-ink-primary'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-brand-600' : 'text-ink-muted group-hover:text-ink-primary'
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                            item.badgeColor || 'bg-warm-100 text-ink-secondary border border-warm-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Operations */}
        <div className="pt-2 border-t border-warm-200">
          {!isCollapsed && (
            <div className="px-2.5 pb-1 text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              Channels & Reports
            </div>
          )}
          <div className="space-y-0.5">
            {secondaryItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200/70 shadow-subtle'
                      : 'text-ink-secondary hover:bg-warm-100/70 hover:text-ink-primary'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-purple-600' : 'text-ink-muted group-hover:text-ink-primary'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Startup Strategy & Research Lab */}
        <div className="pt-2 border-t border-warm-200">
          {!isCollapsed && (
            <div className="px-2.5 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                Founder Lab & Briefing
              </span>
              <span className="text-[9px] font-medium text-ink-muted">Academic</span>
            </div>
          )}
          <div className="space-y-0.5">
            {startupItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/80 shadow-subtle'
                      : 'text-ink-secondary hover:bg-warm-100/70 hover:text-ink-primary'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-brand-600' : 'text-ink-muted group-hover:text-brand-500'
                    }`}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Honest Footer Disclaimer */}
      <div className="p-3 border-t border-warm-200 bg-warm-50/50">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-white border border-warm-200 shadow-subtle">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulated Prototype</span>
            </div>
            <p className="text-[10px] text-ink-secondary mt-0.5 leading-relaxed">
              Connectors run strictly in DEMO MODE. Direct sales run as LOCAL FEATURE.
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="Simulated Prototype Active">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
        )}
      </div>
    </aside>
  );
};
