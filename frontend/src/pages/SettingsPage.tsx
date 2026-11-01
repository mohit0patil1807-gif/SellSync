import React, { useState } from 'react';
import {
  Settings,
  Building,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Server,
  Database,
  Download,
  Trash2,
  Sliders,
  AlertTriangle,
  Store,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../api/client';
import { useI18n } from '../i18n';

interface SettingsPageProps {
  onResetDemo: (personaId?: string) => void;
  isResetting: boolean;
  activePersonaId?: string;
  onChangePersona?: (personaId: string) => void;
  onOpenOnboarding?: () => void;
}

const PERSONAS_CONFIG = [
  { id: 'boutique', name: 'Aura Fashion Studio', type: 'Clothing & fashion', icon: '👗', city: 'Jaipur' },
  { id: 'baker', name: 'Crumb & Crust Bakery', type: 'Food & bakery', icon: '🥖', city: 'Bengaluru' },
  { id: 'reseller', name: 'DailyDeals Hub', type: 'Reselling (gadgets)', icon: '📱', city: 'Surat' },
  { id: 'handmade', name: 'Clay & Knot Studio', type: 'Handmade crafts', icon: '🏺', city: 'Pune' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onResetDemo,
  isResetting,
  activePersonaId = 'boutique',
  onChangePersona,
  onOpenOnboarding,
}) => {
  const { t } = useI18n();
  const [storeName, setStoreName] = useState('Aura Fashion Studio');
  const [upiId, setUpiId] = useState('aurastudio@upi');
  const [taxRate, setTaxRate] = useState('5.0');
  const [saved, setSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sellsync-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    if (!window.confirm('Are you sure you want to delete all orders, payments, and product stock? You will get an empty workspace for manual entry.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteData();
      alert('All demo data cleared. Your workspace is now a clean slate for direct manual orders.');
      window.location.reload();
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-20 md:pb-8">
      {/* SELLER PERSONA SWITCHER */}
      <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 rounded-full">
                Interactive Showcase
              </span>
              <span className="text-[11px] text-ink-muted">Tailored Micro-Business Data</span>
            </div>
            <h2 className="text-lg font-bold text-ink-primary tracking-tight">Active Seller Persona</h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Switching personas re-seeds realistic inventory, channels, and orders for that domain.
            </p>
          </div>

          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Replay Onboarding Wizard</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {PERSONAS_CONFIG.map((p) => {
            const isSelected = activePersonaId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onChangePersona && onChangePersona(p.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-warm-200 hover:border-warm-300 hover:bg-warm-50'
                }`}
              >
                <div>
                  <div className="text-xl mb-1.5">{p.icon}</div>
                  <div className="text-xs font-bold text-ink-primary">{p.name}</div>
                  <div className="text-[10px] text-ink-secondary mt-0.5">{p.type}</div>
                  <div className="text-[10px] text-ink-muted">{p.city}</div>
                </div>
                {isSelected && (
                  <div className="mt-3 text-[10px] font-bold text-brand-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-brand-600" />
                    <span>Active Profile</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Store & Business Profile */}
      <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-subtle space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink-primary tracking-tight">Store & UPI Preferences</h2>
          <p className="text-xs text-ink-secondary mt-0.5">Used for receipt generation, WhatsApp messages, and UPI QR links</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink-primary mb-1.5">Business / Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary bg-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink-primary mb-1.5">Default UPI VPA / Handle</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourstore@upi"
                className="w-full px-3.5 py-2 border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink-primary mb-1.5">Standard GST Rate (%)</label>
              <input
                type="text"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3.5 py-2 border border-warm-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary bg-white text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink-primary mb-1.5">Primary Operating Currency</label>
              <input
                type="text"
                disabled
                value="INR (₹) Indian Rupee"
                className="w-full px-3.5 py-2 border border-warm-200 bg-warm-50 rounded-xl text-ink-muted cursor-not-allowed text-xs"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-warm-100">
            {saved ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Store preferences saved successfully!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle transition-colors text-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* DATA OWNERSHIP & EXPORT ZONE */}
      <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-subtle space-y-4">
        <div>
          <h3 className="text-base font-bold text-ink-primary">Data Ownership & Privacy</h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Micro-sellers keep 100% control over their catalog, customers, and order history.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-warm-50/80 rounded-2xl border border-warm-200 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-xs text-ink-primary">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Export My Complete Data</span>
              </div>
              <p className="text-[11px] text-ink-secondary mt-1 leading-relaxed">
                Download a clean, structured JSON bundle containing all your products, inventory levels, order records, customer contacts, and payments.
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export Data (JSON)'}</span>
            </button>
          </div>

          <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete All Data (Clean Slate)</span>
              </div>
              <p className="text-[11px] text-rose-800/80 mt-1 leading-relaxed">
                Permanently purge all demo orders, payments, timeline events, and sample products to start with a blank database for purely local manual testing.
              </p>
            </div>
            <button
              onClick={handleDeleteData}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-xl transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Deleting...' : 'Delete My Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Honest Architecture & Sandbox Reset */}
      <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-subtle space-y-4">
        <div>
          <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-500" />
            <span>Honesty & Prototype Architecture Notice</span>
          </h3>
          <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
            In compliance with MDMIE01 course guidelines:
            All external marketplace connectors (Meesho, Amazon, Flipkart, Myntra, Swiggy, Zomato, Instagram DM) are running in <strong>SIMULATED DEMO MODE</strong> with realistic synthetic data. No real bank credentials or API keys are called. Direct order entry and chat parsing operate locally.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-warm-100">
          <div>
            <div className="text-xs font-bold text-ink-primary">Reset Demo to Pristine State</div>
            <div className="text-[11px] text-ink-secondary">Re-seeds standard catalog and sample orders for the current persona.</div>
          </div>
          <button
            onClick={() => onResetDemo(activePersonaId)}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle disabled:opacity-50 transition-colors shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
