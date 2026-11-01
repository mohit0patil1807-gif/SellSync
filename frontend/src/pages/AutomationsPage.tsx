import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  RefreshCw
} from 'lucide-react';
import { AutomationRule, AutomationLog } from '../types';
import { api } from '../api/client';

export const AutomationsPage: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, lRes] = await Promise.all([
        api.getAutomations(),
        api.getAutomationLogs(),
      ]);
      setRules(rRes);
      setLogs(lRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (ruleId: number, currentEnabled: boolean) => {
    setTogglingId(ruleId);
    try {
      await api.toggleAutomationRule(ruleId, !currentEnabled);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                Event Processing
              </span>
              <span className="text-[11px] text-ink-muted">Transactional Rules</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
              Automation Rule Engine
            </h1>
            <p className="text-xs text-ink-secondary mt-1 max-w-2xl leading-relaxed">
              Deterministic event-driven rules executing inventory allocations, status transitions, and audit records.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-ink-primary bg-warm-100 hover:bg-warm-200 rounded-xl transition-colors self-start sm:self-auto border border-warm-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-ink-secondary ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Rules & Logs</span>
          </button>
        </div>

        <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-purple-950">State-Driven Guarantees:</strong> Automations execute transactional database updates. E.g., when a payment is verified, the order status transitions and inventory reservation is created simultaneously with complete activity ledger auditing.
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const isToggling = togglingId === rule.id;

          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all ${
                rule.is_enabled
                  ? 'bg-white border-warm-200 shadow-card hover:shadow-float'
                  : 'bg-warm-50/60 border-warm-200 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      rule.is_enabled ? 'bg-brand-50 text-brand-600 border border-brand-100' : 'bg-warm-200 text-ink-muted'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-ink-primary">{rule.rule_name}</h3>
                    <span className="font-mono text-[10px] text-ink-muted">{rule.code}</span>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(rule.id, rule.is_enabled)}
                  disabled={isToggling}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                    rule.is_enabled ? 'bg-brand-500' : 'bg-warm-300'
                  }`}
                  title={rule.is_enabled ? 'Disable rule' : 'Enable rule'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-subtle ${
                      rule.is_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-ink-secondary mt-3 leading-relaxed">
                {rule.description}
              </p>

              {/* Trigger & Action Details */}
              <div className="mt-4 pt-3 border-t border-warm-100 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-warm-50 p-2.5 rounded-xl border border-warm-200">
                  <span className="text-[9px] uppercase font-semibold text-ink-muted block mb-0.5">Trigger Event</span>
                  <span className="font-mono text-ink-primary font-medium text-[11px]">{rule.trigger_event}</span>
                </div>
                <div className="bg-warm-50 p-2.5 rounded-xl border border-warm-200">
                  <span className="text-[9px] uppercase font-semibold text-ink-muted block mb-0.5">System Action</span>
                  <span className="font-mono text-ink-primary font-medium text-[11px]">{rule.action_type}</span>
                </div>
              </div>

              {/* Executions Counter */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted tabular-nums">
                <span>Total Executions: <strong className="text-ink-primary font-semibold">{rule.total_executions}</strong></span>
                <span>
                  Last Run:{' '}
                  {rule.last_executed_at
                    ? new Date(rule.last_executed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Idle'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Audit Log Table */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-card overflow-hidden">
        <div className="p-4 bg-warm-50/70 border-b border-warm-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              Execution Audit Ledger
            </h3>
            <p className="text-[11px] text-ink-muted">
              Live operational history of automated event executions
            </p>
          </div>
          <span className="text-xs text-ink-muted tabular-nums">{logs.length} events recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-50/50 border-b border-warm-200 text-ink-muted uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Trigger Event</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Reference</th>
                <th className="py-2.5 px-4 font-semibold">Action Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    No automation executions recorded yet. Trigger an order action or stock change to view events.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-warm-50/60 transition-colors">
                    <td className="py-2.5 px-4 tabular-nums text-[11px] text-ink-muted">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-ink-primary">
                      {log.event_type}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>SUCCESS</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-ink-secondary tabular-nums text-[11px]">
                      {log.order_id ? `Order #${log.order_id}` : log.product_id ? `Product #${log.product_id}` : 'Global'}
                    </td>
                    <td className="py-2.5 px-4 text-ink-primary leading-snug">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
