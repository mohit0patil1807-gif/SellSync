import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';
import { TodayPage } from './pages/TodayPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderWorkspacePage } from './pages/OrderWorkspacePage';
import { ProductsPage } from './pages/ProductsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { FulfilmentPage } from './pages/FulfilmentPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ChannelsPage } from './pages/ChannelsPage';
import { AutomationsPage } from './pages/AutomationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BusinessModelPage } from './pages/BusinessModelPage';
import { CustomerValidationPage } from './pages/CustomerValidationPage';
import { PresentationSummaryPage } from './pages/PresentationSummaryPage';
import { SearchModal } from './components/common/SearchModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { ManualOrderModal } from './components/modals/ManualOrderModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { DashboardMetrics, AlertItem, Product } from './types';
import { api } from './api/client';
import { I18nProvider } from './i18n';

export const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItem>('overview');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Active Demo Persona
  const [activePersonaId, setActivePersonaId] = useState<string>(() => {
    return localStorage.getItem('sellsync_persona') || 'boutique';
  });

  // Modals state
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => {
    return localStorage.getItem('sellsync_onboarded') !== 'true';
  });

  // Core Data
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [daysFilter, setDaysFilter] = useState(30);

  // Feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOperationalData = async () => {
    try {
      const [mRes, aRes, pRes] = await Promise.all([
        api.getDashboardMetrics(daysFilter),
        api.getAlerts('OPEN'),
        api.getProducts(),
      ]);
      setMetrics(mRes);
      setAlerts(aRes);
      setProducts(pRes);
    } catch (e) {
      console.error('Failed loading operational data:', e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadOperationalData();
  }, [daysFilter, activePersonaId]);

  // Global Keyboard shortcuts: Cmd/Ctrl + K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChangePersona = async (newPersonaId: string) => {
    setIsResetting(true);
    try {
      await api.resetDemoData(newPersonaId);
      setActivePersonaId(newPersonaId);
      localStorage.setItem('sellsync_persona', newPersonaId);
      showToast(`Switched workspace to ${newPersonaId.toUpperCase()} persona!`);
      await loadOperationalData();
      setSelectedOrderId(null);
    } catch (e: any) {
      alert(`Persona switch failed: ${e.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetDemo = async (personaId?: string) => {
    const targetPersona = personaId || activePersonaId;
    if (!window.confirm(`Reset demo orders, stock levels, and timeline events for ${targetPersona.toUpperCase()}?`)) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDemoData(targetPersona);
      showToast('Demo data reset successfully to pristine state!');
      await loadOperationalData();
      setSelectedOrderId(null);
    } catch (e: any) {
      alert(`Demo reset failed: ${e.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleOnboardingComplete = async (data: {
    sellerType: string;
    personaId: string;
    channels: string[];
    shippingMode: string;
  }) => {
    localStorage.setItem('sellsync_onboarded', 'true');
    localStorage.setItem('sellsync_seller_type', data.sellerType);
    localStorage.setItem('sellsync_shipping_mode', data.shippingMode);
    await handleChangePersona(data.personaId);
    showToast(`Welcome! Your workspace is ready for ${data.sellerType}.`);
  };

  const handleResolveAlert = async (alertId: number) => {
    try {
      await api.resolveAlert(alertId);
      showToast('Alert marked as resolved.');
      await loadOperationalData();
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleCreateManualOrder = async (data: any) => {
    const created = await api.createManualOrder(data);
    showToast(`Order ${created.order_number} created successfully!`);
    await loadOperationalData();
    setSelectedOrderId(created.id);
    setCurrentTab('orders');
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
    setCurrentTab('orders');
  };

  const handleSelectProduct = (productId: number) => {
    setCurrentTab('inventory');
  };

  return (
    <div className="min-h-screen bg-warm-50 flex text-ink-primary font-sans antialiased">
      {/* Desktop / Tablet Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'orders') {
            setSelectedOrderId(null);
          }
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        awaitingPaymentCount={metrics?.awaiting_payment_count || 0}
        lowStockCount={metrics?.low_stock_count || 0}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Header */}
        <Topbar
          currentTab={currentTab}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNewOrder={() => setNewOrderOpen(true)}
          onResetDemo={handleResetDemo}
          onToggleNotifications={() => setNotificationsOpen(true)}
          unreadAlertCount={alerts.length}
          isResetting={isResetting}
          activePersonaId={activePersonaId}
          onChangePersona={handleChangePersona}
          onOpenOnboarding={() => setOnboardingOpen(true)}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-16 md:bottom-6 right-6 z-50 bg-ink text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-float border border-warm-300 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <TodayPage
              onNavigateTab={(tab) => {
                setCurrentTab(tab);
                setSelectedOrderId(null);
              }}
              onOpenNewOrder={() => setNewOrderOpen(true)}
              activePersonaId={activePersonaId}
            />
          )}

          {currentTab === 'orders' && (
            <>
              {selectedOrderId ? (
                <OrderWorkspacePage
                  orderId={selectedOrderId}
                  onBack={() => setSelectedOrderId(null)}
                  onOrderUpdated={loadOperationalData}
                />
              ) : (
                <OrdersPage
                  onSelectOrder={(id) => setSelectedOrderId(id)}
                  onOpenNewOrder={() => setNewOrderOpen(true)}
                />
              )}
            </>
          )}

          {currentTab === 'inventory' && <ProductsPage />}

          {currentTab === 'payments' && (
            <PaymentsPage
              onOpenOrder={handleSelectOrder}
              onRefreshAll={loadOperationalData}
            />
          )}

          {currentTab === 'fulfilment' && (
            <FulfilmentPage
              onOpenOrder={handleSelectOrder}
              onRefreshAll={loadOperationalData}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsPage />}

          {currentTab === 'channels' && <ChannelsPage />}

          {currentTab === 'automations' && <AutomationsPage />}

          {currentTab === 'business' && <BusinessModelPage />}

          {currentTab === 'validation' && <CustomerValidationPage />}

          {currentTab === 'presentation' && <PresentationSummaryPage />}

          {currentTab === 'settings' && (
            <SettingsPage
              onResetDemo={handleResetDemo}
              isResetting={isResetting}
              activePersonaId={activePersonaId}
              onChangePersona={handleChangePersona}
              onOpenOnboarding={() => setOnboardingOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (< 768px) */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'orders') {
            setSelectedOrderId(null);
          }
        }}
        awaitingPaymentCount={metrics?.awaiting_payment_count || 0}
        ordersToPackCount={metrics?.requiring_fulfilment_count || 0}
      />

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectOrder={handleSelectOrder}
        onSelectProduct={handleSelectProduct}
      />

      {/* Operational Alerts & Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        alerts={alerts}
        onResolveAlert={handleResolveAlert}
        onNavigateToOrder={handleSelectOrder}
        onNavigateToProduct={handleSelectProduct}
      />

      {/* Manual Order Creation Modal */}
      <ManualOrderModal
        isOpen={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
        products={products}
        onSubmit={handleCreateManualOrder}
      />

      {/* 3-Step Micro-Seller Onboarding Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  );
};

export default App;
