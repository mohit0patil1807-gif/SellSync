import React, { useState } from 'react';
import {
  Search,
  Plus,
  RotateCcw,
  Bell,
  Sparkles,
  ChevronDown,
  Globe,
  Sliders,
  Check
} from 'lucide-react';
import { NavItem } from './Sidebar';
import { useI18n } from '../../i18n';

interface TopbarProps {
  currentTab: NavItem;
  onOpenSearch: () => void;
  onOpenNewOrder: () => void;
  onResetDemo: (personaId?: string) => void;
  onToggleNotifications: () => void;
  unreadAlertCount: number;
  isResetting: boolean;
  activePersonaId: string;
  onChangePersona: (personaId: string) => void;
  onOpenOnboarding?: () => void;
}

const PERSONA_OPTIONS = [
  { id: 'boutique', label: 'Aura Boutique', type: 'Clothing & fashion', icon: '👗' },
  { id: 'baker', label: 'Crumb & Crust', type: 'Food & bakery', icon: '🥖' },
  { id: 'reseller', label: 'DailyDeals Hub', type: 'Reselling (gadgets)', icon: '📱' },
  { id: 'handmade', label: 'Clay & Knot Studio', type: 'Handmade crafts', icon: '🏺' },
];

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onOpenSearch,
  onOpenNewOrder,
  onResetDemo,
  onToggleNotifications,
  unreadAlertCount,
  isResetting,
  activePersonaId,
  onChangePersona,
  onOpenOnboarding,
}) => {
  const { language, setLanguage, t } = useI18n();
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  const tabTitles: Record<NavItem, { title: string; subtitle: string }> = {
    overview: { title: t('today'), subtitle: 'Live actions, pending payments, orders to pack, and day ledger' },
    orders: { title: t('orders'), subtitle: 'Direct orders, WhatsApp chats, and marketplace orders' },
    inventory: { title: t('stock'), subtitle: 'Item inventory, available stock, and reorder levels' },
    payments: { title: t('payments'), subtitle: 'UPI payment verification assistant and settlement tracking' },
    fulfilment: { title: t('shipping'), subtitle: 'Packing slips, courier address copying, and local delivery handovers' },
    analytics: { title: t('analytics'), subtitle: 'Channel performance, margins, and operational summary' },
    channels: { title: t('channels'), subtitle: 'Simulated marketplace connectors and direct order settings' },
    automations: { title: t('automations'), subtitle: 'Auto-reserve inventory, low-stock alerts, and reminders' },
    business: { title: t('business'), subtitle: 'Osterwalder Canvas, micro-seller economics, and tiered pricing' },
    validation: { title: t('validation'), subtitle: 'Customer discovery interview log and Lean Startup assumptions' },
    presentation: { title: t('presentation'), subtitle: 'SellSync product roadmap and course presentation briefing' },
    settings: { title: t('settings'), subtitle: 'Store profile, persona switching, and full data export' },
  };

  const currentInfo = tabTitles[currentTab] || { title: 'SellSync', subtitle: 'Unified Commerce Operations' };
  const currentPersona = PERSONA_OPTIONS.find((p) => p.id === activePersonaId) || PERSONA_OPTIONS[0];

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-warm-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-subtle">
      {/* Title & Context */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-ink-primary tracking-tight leading-none">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-ink-secondary mt-1 hidden md:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-ink-primary bg-warm-50 hover:bg-warm-100 rounded-xl border border-warm-200 shadow-subtle transition-all"
            title="Switch demo seller persona"
          >
            <span>{currentPersona.icon}</span>
            <span className="hidden sm:inline font-bold">{currentPersona.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
          </button>

          {personaDropdownOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-white rounded-2xl border border-warm-200 shadow-float z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                {t('try_as')}
              </div>
              {PERSONA_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onChangePersona(p.id);
                    setPersonaDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                    activePersonaId === p.id
                      ? 'bg-brand-50 text-brand-900 font-bold'
                      : 'hover:bg-warm-50 text-ink-primary font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{p.icon}</span>
                    <div>
                      <div>{p.label}</div>
                      <div className="text-[10px] text-ink-muted font-normal">{p.type}</div>
                    </div>
                  </div>
                  {activePersonaId === p.id && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </button>
              ))}

              {onOpenOnboarding && (
                <div className="pt-1 mt-1 border-t border-warm-100">
                  <button
                    onClick={() => {
                      setPersonaDropdownOpen(false);
                      onOpenOnboarding();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-brand-600 hover:bg-brand-50 rounded-xl font-semibold transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Run Onboarding Wizard...</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Language Switcher [EN | हिंदी] */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-ink-secondary hover:text-ink-primary bg-warm-50 hover:bg-warm-100 border border-warm-200 rounded-xl transition-all shadow-subtle"
          title="Switch language between English and Hindi"
        >
          <Globe className="w-3.5 h-3.5 text-ink-muted" />
          <span>{language === 'en' ? 'हिंदी' : 'EN'}</span>
        </button>

        {/* Demo Connections Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{t('demo_connections')}</span>
        </div>

        {/* Quick Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-ink-secondary bg-warm-50 hover:bg-warm-100/80 rounded-xl border border-warm-200 transition-colors shadow-subtle"
          title="Quick search (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-ink-muted" />
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-warm-200 rounded text-ink-muted font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Reset Demo Data Action */}
        <button
          onClick={() => onResetDemo(activePersonaId)}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-ink-primary bg-white hover:bg-warm-50 border border-warm-200 rounded-xl shadow-subtle transition-all active:scale-[0.98] disabled:opacity-50"
          title="Reset sample data for this persona"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-brand-500' : 'text-ink-muted'}`} />
          <span className="hidden lg:inline">{isResetting ? 'Resetting...' : t('reset_demo')}</span>
        </button>

        {/* + New Order Action */}
        <button
          onClick={onOpenNewOrder}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle shadow-brand-500/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('new_order')}</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 text-ink-secondary hover:text-ink-primary hover:bg-warm-100 rounded-xl border border-transparent hover:border-warm-200 transition-colors"
          title="Open Operational Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
};
