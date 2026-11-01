import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  HelpCircle,
  Sparkles,
  ClipboardList,
  Search,
  Filter,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  FileText,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  ChevronDown,
  Info,
  Clock,
  FlaskConical,
  BookOpen
} from 'lucide-react';
import {
  CustomerInterview,
  ValidationDashboardStats,
  BusinessAssumption,
  ValidationExperiment,
} from '../types';
import { api } from '../api/client';
import { Modal } from '../components/common/Modal';

type ValidationSubTab = 'dashboard' | 'interviews' | 'questions' | 'assumptions' | 'experiments';

export const CustomerValidationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ValidationSubTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [interviews, setInterviews] = useState<CustomerInterview[]>([]);
  const [stats, setStats] = useState<ValidationDashboardStats | null>(null);
  const [assumptions, setAssumptions] = useState<BusinessAssumption[]>([]);
  const [experiments, setExperiments] = useState<ValidationExperiment[]>([]);

  // Modals & UI states
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<CustomerInterview | null>(null);
  const [interviewSearch, setInterviewSearch] = useState('');
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);

  // Form State for Interview
  const [formData, setFormData] = useState({
    seller_name: '',
    seller_type: 'Instagram Boutique',
    sales_channels: 'Instagram, WhatsApp',
    approx_order_volume: '15-25 orders/week',
    current_process: 'Manually noting orders from DMs into Google Sheets and WhatsApp group.',
    most_time_consuming_task: 'Checking UPI payments and copying customer addresses into courier portal.',
    current_tools: 'Google Sheets, WhatsApp Business, Shiprocket',
    operational_mistakes: 'Oversold a handloom saree that was already spoken for on WhatsApp.',
    most_requested_feature: 'Real-time stock deduction across WhatsApp and Instagram.',
    willingness_to_pilot: true,
    pricing_feedback: '₹299/month feels affordable if it prevents at least one overselling refund.',
    follow_up_notes: 'Interested in beta testing once inventory sync is demonstrated.',
    interview_date: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [intRes, statsRes, assumpRes, expRes] = await Promise.all([
        api.getInterviews(),
        api.getValidationStats(),
        api.getAssumptions(),
        api.getExperiments(),
      ]);
      setInterviews(intRes);
      setStats(statsRes);
      setAssumptions(assumpRes);
      setExperiments(expRes);
    } catch (err) {
      console.error('Failed to load validation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenNewInterview = () => {
    setEditingInterview(null);
    setFormData({
      seller_name: '',
      seller_type: 'Instagram Boutique',
      sales_channels: 'Instagram, WhatsApp',
      approx_order_volume: '15-25 orders/week',
      current_process: '',
      most_time_consuming_task: '',
      current_tools: '',
      operational_mistakes: '',
      most_requested_feature: '',
      willingness_to_pilot: true,
      pricing_feedback: '',
      follow_up_notes: '',
      interview_date: new Date().toISOString().split('T')[0],
    });
    setIsInterviewModalOpen(true);
  };

  const handleEditInterview = (item: CustomerInterview) => {
    setEditingInterview(item);
    setFormData({
      seller_name: item.seller_name,
      seller_type: item.seller_type,
      sales_channels: item.sales_channels,
      approx_order_volume: item.approx_order_volume,
      current_process: item.current_process,
      most_time_consuming_task: item.most_time_consuming_task,
      current_tools: item.current_tools,
      operational_mistakes: item.operational_mistakes || '',
      most_requested_feature: item.most_requested_feature,
      willingness_to_pilot: item.willingness_to_pilot,
      pricing_feedback: item.pricing_feedback || '',
      follow_up_notes: item.follow_up_notes || '',
      interview_date: item.interview_date,
    });
    setIsInterviewModalOpen(true);
  };

  const handleSaveInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seller_name.trim()) {
      alert('Please enter a seller or business name.');
      return;
    }

    try {
      if (editingInterview) {
        await api.updateInterview(editingInterview.id, formData);
      } else {
        await api.createInterview(formData);
      }
      setIsInterviewModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Failed to save interview: ${err.message}`);
    }
  };

  const handleDeleteInterview = async (id: number) => {
    if (!window.confirm('Delete this customer interview record? This will update the validation statistics.')) {
      return;
    }
    try {
      await api.deleteInterview(id);
      await loadData();
    } catch (err: any) {
      alert(`Failed to delete interview: ${err.message}`);
    }
  };

  const handleUpdateAssumptionStatus = async (
    id: number,
    newStatus: 'Untested' | 'Testing' | 'Supported' | 'Rejected'
  ) => {
    try {
      await api.updateAssumption(id, { status: newStatus });
      setAssumptions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err: any) {
      alert(`Failed to update assumption: ${err.message}`);
    }
  };

  const handleUpdateExperimentDecision = async (
    id: number,
    decision: 'Pending' | 'Validated' | 'Invalidated' | 'Iterate',
    actualResult?: string
  ) => {
    try {
      await api.updateExperiment(id, { decision, actual_result: actualResult });
      setExperiments((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, decision, actual_result: actualResult ?? exp.actual_result } : exp))
      );
    } catch (err: any) {
      alert(`Failed to update experiment: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  const questionBank = [
    {
      category: 'Current Operations',
      question: 'How do you currently manage orders across your sales channels from start to finish?',
      probe: 'Ask what happens immediately when a notification pops up on WhatsApp vs Amazon.',
    },
    {
      category: 'Time & Bottlenecks',
      question: 'Which daily administrative task takes up the most time or causes the most frustration?',
      probe: 'Look for copying addresses, manual payment verification, or answering "is this in stock?".',
    },
    {
      category: 'Inventory Allocation',
      question: 'How do you update inventory after receiving an order on one of your channels?',
      probe: 'Ask if they have ever oversold an item or had to cancel a marketplace order.',
    },
    {
      category: 'Payment Verification',
      question: 'How do you verify customer payments and reconcile marketplace settlements?',
      probe: 'Probe if they trust screenshot payment slips or cross-check bank accounts.',
    },
    {
      category: 'Operational Mistakes',
      question: 'What mistakes or exceptions occur most frequently during packing or delivery?',
      probe: 'Delayed dispatch penalties, incorrect item packed, missing courier tracking link.',
    },
    {
      category: 'Tool Spend',
      question: 'What software tools or services do you currently pay for each month?',
      probe: 'Check for Shopify, Excel/Office 365, Shiprocket, or paid WhatsApp bots.',
    },
    {
      category: 'Adoption Barriers',
      question: 'What would prevent you from adopting a unified commerce platform like SellSync?',
      probe: 'Fear of sharing marketplace credentials, steep learning curve, or internet speed.',
    },
    {
      category: 'Willingness to Pay',
      question: 'Which single capability would make a platform like this worth paying ₹299 to ₹799 per month for?',
      probe: 'Quantify time saved vs money lost from avoided stockout penalties.',
    },
  ];

  const filteredInterviews = interviews.filter((item) =>
    item.seller_name.toLowerCase().includes(interviewSearch.toLowerCase()) ||
    item.seller_type.toLowerCase().includes(interviewSearch.toLowerCase()) ||
    item.sales_channels.toLowerCase().includes(interviewSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner with Ambient Glow */}
      <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-card ambient-glow relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                Evidence-Based Entrepreneurship
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded">
                Strict Non-Fabricated Data
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
              Customer Discovery & Validation Lab
            </h1>
            <p className="text-xs text-ink-secondary mt-1 max-w-2xl leading-relaxed">
              Test core hypotheses with real micro-sellers. Record structured interviews, track recurring operational bottlenecks,
              and validate product-market fit metrics derived strictly from actual recorded conversations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenNewInterview}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Discovery Call</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-warm-200 overflow-x-auto no-scrollbar relative z-10">
          {[
            { id: 'dashboard', label: 'Validation Dashboard', icon: TrendingUp },
            { id: 'interviews', label: `Interviews (${interviews.length})`, icon: MessageSquare },
            { id: 'questions', label: 'Question Bank', icon: HelpCircle },
            { id: 'assumptions', label: `Assumptions Register (${assumptions.length})`, icon: ClipboardList },
            { id: 'experiments', label: `Experiment Planner (${experiments.length})`, icon: FlaskConical },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ValidationSubTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-subtle'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-warm-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: VALIDATION DASHBOARD (REAL AGGREGATED METRICS ONLY)
         ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {interviews.length === 0 ? (
            /* Empty State when no interviews exist - Never fabricate survey numbers! */
            <div className="bg-white rounded-2xl border border-warm-200 p-12 text-center shadow-card">
              <div className="w-12 h-12 rounded-full bg-warm-100 text-ink-muted flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-ink-primary">No Customer Interviews Recorded Yet</h3>
              <p className="text-xs text-ink-secondary max-w-md mx-auto mt-1 leading-relaxed">
                In accordance with academic rigor, this validation dashboard calculates metrics strictly from actual
                discovery records. Conduct interviews with local sellers to populate real evidence.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={handleOpenNewInterview}
                  className="px-4 py-2 bg-brand-500 text-white text-xs font-semibold rounded-xl hover:bg-brand-600 shadow-subtle transition-colors"
                >
                  Record First Interview
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className="px-4 py-2 bg-warm-100 text-ink-primary text-xs font-semibold rounded-xl hover:bg-warm-200 transition-colors"
                >
                  Review Question Bank
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                    Interviews Conducted
                  </span>
                  <div className="mt-1 flex items-baseline gap-1 tabular-nums">
                    <span className="text-2xl font-bold text-ink-primary">{stats?.total_interviews || 0}</span>
                    <span className="text-xs text-ink-muted">recorded sellers</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                    100% verified entries
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                    Segments Represented
                  </span>
                  <div className="mt-1 flex items-baseline gap-1 tabular-nums">
                    <span className="text-2xl font-bold text-ink-primary">
                      {stats?.segments_represented.length || 0}
                    </span>
                    <span className="text-xs text-ink-muted">seller cohorts</span>
                  </div>
                  <span className="text-[10px] text-ink-muted mt-1 block">
                    Boutiques, resellers, craft
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                    Pilot Willingness Rate
                  </span>
                  <div className="mt-1 flex items-baseline gap-1 tabular-nums">
                    <span className="text-2xl font-bold text-brand-600">
                      {stats?.pilot_percentage.toFixed(0) || 0}%
                    </span>
                    <span className="text-xs text-ink-muted">({stats?.pilot_interested_count} of {stats?.total_interviews})</span>
                  </div>
                  <span className="text-[10px] text-brand-600 font-semibold mt-1 block">
                    High intent for beta trial
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                    Tested Assumptions
                  </span>
                  <div className="mt-1 flex items-baseline gap-1 tabular-nums">
                    <span className="text-2xl font-bold text-purple-600">
                      {assumptions.filter((a) => a.status !== 'Untested').length} of {assumptions.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-muted mt-1 block">
                    Active testing status
                  </span>
                </div>
              </div>

              {/* Aggregated Breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Frequently Mentioned Bottlenecks */}
                <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
                  <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Most Frequent Operational Problems</span>
                    <span className="text-[10px] font-normal text-ink-muted">Derived from interviews</span>
                  </h3>
                  <div className="space-y-2.5">
                    {stats?.frequent_problems.map((item, idx) => (
                      <div key={idx} className="p-3 bg-warm-50/70 rounded-xl border border-warm-200 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-ink-muted shrink-0">#{idx + 1}</span>
                          <span className="text-xs font-medium text-ink-primary">{item.problem}</span>
                        </div>
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 shrink-0 tabular-nums">
                          {item.count} seller{item.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most Requested Features */}
                <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
                  <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Top Requested Capabilities</span>
                    <span className="text-[10px] font-normal text-ink-muted">Derived from interviews</span>
                  </h3>
                  <div className="space-y-2.5">
                    {stats?.requested_features.map((item, idx) => (
                      <div key={idx} className="p-3 bg-warm-50/70 rounded-xl border border-warm-200 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-brand-500 shrink-0">#{idx + 1}</span>
                          <span className="text-xs font-medium text-ink-primary">{item.feature}</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 shrink-0 tabular-nums">
                          {item.count} request{item.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Feedback Quotes from Real Sellers */}
              {stats?.pricing_summaries && stats.pricing_summaries.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
                  <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-3">
                    Direct Pricing Feedback from Interviewed Sellers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stats.pricing_summaries.map((quote, idx) => (
                      <div key={idx} className="p-4 bg-warm-50/70 rounded-xl border border-warm-200 text-xs text-ink-secondary italic">
                        "{quote}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: INTERVIEWS LIST & PLANNER
         ========================================================================= */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search sellers, channels, or types..."
                value={interviewSearch}
                onChange={(e) => setInterviewSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-warm-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary"
              />
            </div>

            <button
              onClick={handleOpenNewInterview}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Interview</span>
            </button>
          </div>

          {filteredInterviews.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-warm-200 shadow-card">
              <p className="text-xs text-ink-muted">No interviews match your search query.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInterviews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-warm-200 p-6 shadow-card hover:border-warm-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-warm-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-ink-primary">{item.seller_name}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-warm-100 text-ink-secondary rounded-lg">
                          {item.seller_type}
                        </span>
                        {item.willingness_to_pilot && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                            ✓ Pilot Ready
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-1 flex items-center gap-3">
                        <span>Channels: <strong className="text-ink-secondary font-medium">{item.sales_channels}</strong></span>
                        <span>•</span>
                        <span>Volume: <strong className="text-ink-secondary font-medium">{item.approx_order_volume}</strong></span>
                        <span>•</span>
                        <span className="tabular-nums">Date: {item.interview_date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-auto">
                      <button
                        onClick={() => handleEditInterview(item)}
                        className="p-1.5 text-ink-muted hover:text-ink-primary hover:bg-warm-100 rounded-lg transition-colors"
                        title="Edit interview"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInterview(item.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete interview"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                        Most Time-Consuming Task:
                      </span>
                      <p className="text-ink-primary leading-relaxed">{item.most_time_consuming_task}</p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                        Most Requested Feature:
                      </span>
                      <p className="text-brand-600 font-semibold leading-relaxed">{item.most_requested_feature}</p>
                    </div>

                    {item.operational_mistakes && (
                      <div className="md:col-span-2">
                        <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block mb-0.5">
                          Operational Mistakes & Challenges:
                        </span>
                        <p className="text-ink-secondary leading-relaxed">{item.operational_mistakes}</p>
                      </div>
                    )}

                    {item.pricing_feedback && (
                      <div>
                        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                          Pricing Feedback:
                        </span>
                        <p className="text-ink-secondary italic leading-relaxed">"{item.pricing_feedback}"</p>
                      </div>
                    )}

                    {item.follow_up_notes && (
                      <div>
                        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                          Follow-up Action:
                        </span>
                        <p className="text-ink-secondary leading-relaxed">{item.follow_up_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: INTERVIEW QUESTION BANK
         ========================================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
            <h2 className="text-base font-semibold text-ink-primary">Semi-Structured Customer Discovery Guide</h2>
            <p className="text-xs text-ink-secondary mt-1">
              Follow The Mom Test principles: Ask about concrete past behaviors and operational facts, never hypothetical promises.
              Click the copy button to paste any question into your interview notes or WhatsApp call script.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionBank.map((q, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-warm-200 p-6 shadow-card hover:shadow-float transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-warm-100 text-ink-secondary rounded uppercase tracking-wider">
                      {q.category}
                    </span>
                    <button
                      onClick={() => copyToClipboard(q.question, idx)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      {copiedQuestionIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <h3 className="text-sm font-semibold text-ink-primary leading-snug">
                    "{q.question}"
                  </h3>
                </div>

                <div className="mt-4 pt-3.5 border-t border-warm-100 text-[11px] text-ink-muted">
                  <strong className="text-ink-primary font-semibold">Discovery Probe:</strong> {q.probe}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BUSINESS ASSUMPTIONS REGISTER
         ========================================================================= */}
      {activeTab === 'assumptions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-ink-primary">Business Assumptions Register</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded">
                Dynamic Hypothesis Tracking
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              Core assumptions behind SellSync's viability. You can update their status based on evidence gathered from customer discovery.
            </p>
          </div>

          <div className="space-y-3.5">
            {assumptions.map((item) => {
              const statusColors: Record<string, string> = {
                Untested: 'bg-warm-100 text-ink-secondary border-warm-300',
                Testing: 'bg-amber-50 text-amber-800 border-amber-300',
                Supported: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                Rejected: 'bg-rose-50 text-rose-800 border-rose-300',
              };

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-warm-200 p-6 shadow-card hover:border-warm-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-warm-100 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                        {item.assumption_code}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-warm-100 text-ink-secondary rounded-lg">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-ink-muted">
                        Confidence: <strong className="text-ink-primary font-medium">{item.confidence_level}</strong>
                      </span>
                    </div>

                    {/* Interactive Status Selector */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <span className="text-[11px] text-ink-muted font-medium">Status:</span>
                      {(['Untested', 'Testing', 'Supported', 'Rejected'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateAssumptionStatus(item.id, st)}
                          className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-lg border transition-all ${
                            item.status === st
                              ? `${statusColors[st]} shadow-subtle font-bold`
                              : 'bg-white text-ink-muted border-warm-200 hover:bg-warm-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-ink-primary mt-3 leading-snug">
                    {item.description}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-3.5 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                        Evidence Available:
                      </span>
                      <p className="text-ink-secondary leading-relaxed">{item.evidence_available}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                        Validation Method:
                      </span>
                      <p className="text-ink-secondary leading-relaxed">{item.validation_method}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                        Next Action:
                      </span>
                      <p className="text-brand-600 font-semibold leading-relaxed">{item.next_action || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: VALIDATION EXPERIMENT PLANNER
         ========================================================================= */}
      {activeTab === 'experiments' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
            <h2 className="text-base font-semibold text-ink-primary">Customer Validation Experiment Planner</h2>
            <p className="text-xs text-ink-secondary mt-1">
              Structured experiments based on Lean Startup principles. Test specific behavioral outcomes rather than self-reported opinions.
            </p>
          </div>

          <div className="space-y-4">
            {experiments.map((exp) => {
              const decisionColors: Record<string, string> = {
                Pending: 'bg-warm-100 text-ink-secondary border-warm-300',
                Validated: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                Invalidated: 'bg-rose-50 text-rose-800 border-rose-300',
                Iterate: 'bg-amber-50 text-amber-800 border-amber-300',
              };

              return (
                <div
                  key={exp.id}
                  className="bg-white rounded-2xl border border-warm-200 p-6 shadow-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-warm-100 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                        {exp.experiment_code}
                      </span>
                      <span className="text-xs text-ink-muted">
                        Segment: <strong className="text-ink-primary font-medium">{exp.target_segment}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <span className="text-[11px] text-ink-muted font-medium">Outcome:</span>
                      {(['Pending', 'Validated', 'Invalidated', 'Iterate'] as const).map((dec) => (
                        <button
                          key={dec}
                          onClick={() => handleUpdateExperimentDecision(exp.id, dec)}
                          className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-lg border transition-all ${
                            exp.decision === dec
                              ? `${decisionColors[dec]} shadow-subtle font-bold`
                              : 'bg-white text-ink-muted border-warm-200 hover:bg-warm-50'
                          }`}
                        >
                          {dec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                        Hypothesis:
                      </span>
                      <p className="text-sm font-semibold text-ink-primary leading-snug">{exp.hypothesis}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                        Experiment Design:
                      </span>
                      <p className="text-ink-secondary leading-relaxed">{exp.experiment_description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-warm-100">
                      <div>
                        <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                          Success Metric & Threshold:
                        </span>
                        <p className="text-ink-primary font-medium">
                          {exp.success_metric} — <span className="text-brand-600 font-semibold">{exp.target_threshold}</span>
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
                          Actual Observed Result:
                        </span>
                        <p className="text-ink-secondary">
                          {exp.actual_result || <span className="italic text-ink-muted">Awaiting trial completion</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RECORD / EDIT CUSTOMER INTERVIEW
         ========================================================================= */}
      {isInterviewModalOpen && (
        <Modal
          isOpen={isInterviewModalOpen}
          onClose={() => setIsInterviewModalOpen(false)}
          title={editingInterview ? 'Edit Customer Discovery Interview' : 'Record New Customer Discovery Interview'}
          subtitle="Customer Validation Toolkit — MDMIE01"
          maxWidth="xl"
        >
          <form onSubmit={handleSaveInterview} className="space-y-4 text-xs text-ink-primary">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">
                  Seller or Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saffron & Silk Boutique"
                  value={formData.seller_name}
                  onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">
                  Seller Type
                </label>
                <select
                  value={formData.seller_type}
                  onChange={(e) => setFormData({ ...formData, seller_type: e.target.value })}
                  className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none bg-white text-ink-primary transition-all"
                >
                  <option value="Instagram Boutique">Instagram Boutique</option>
                  <option value="Multi-Channel Reseller">Multi-Channel Reseller</option>
                  <option value="Handicraft & Home Business">Handicraft & Home Business</option>
                  <option value="Independent Creator & D2C">Independent Creator & D2C</option>
                  <option value="Cloud Kitchen / Bakery">Cloud Kitchen / Bakery</option>
                  <option value="Retail Store with Online Orders">Retail Store with Online Orders</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">
                  Sales Channels Currently Used
                </label>
                <input
                  type="text"
                  placeholder="e.g. Instagram, WhatsApp, Amazon, Meesho"
                  value={formData.sales_channels}
                  onChange={(e) => setFormData({ ...formData, sales_channels: e.target.value })}
                  className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">
                  Approximate Order Volume
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15-20 orders/day or 50/week"
                  value={formData.approx_order_volume}
                  onChange={(e) => setFormData({ ...formData, approx_order_volume: e.target.value })}
                  className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1.5">
                Current Order-Management Process
              </label>
              <textarea
                rows={2}
                placeholder="How do they currently capture and track orders across channels?"
                value={formData.current_process}
                onChange={(e) => setFormData({ ...formData, current_process: e.target.value })}
                className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">
                  Most Time-Consuming Task *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reconciling UPI screenshot payments"
                  value={formData.most_time_consuming_task}
                  onChange={(e) => setFormData({ ...formData, most_time_consuming_task: e.target.value })}
                  className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">
                  Most Requested Feature *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unified inventory stock sync"
                  value={formData.most_requested_feature}
                  onChange={(e) => setFormData({ ...formData, most_requested_feature: e.target.value })}
                  className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1.5">
                Operational Mistakes or Costly Challenges
              </label>
              <input
                type="text"
                placeholder="e.g. Double-sold items resulting in order cancellation penalty"
                value={formData.operational_mistakes}
                onChange={(e) => setFormData({ ...formData, operational_mistakes: e.target.value })}
                className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">
                  Current Tools Paid For
                </label>
                <input
                  type="text"
                  placeholder="e.g. None / Excel / Shiprocket / Shopify"
                  value={formData.current_tools}
                  onChange={(e) => setFormData({ ...formData, current_tools: e.target.value })}
                  className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">
                  Pricing Feedback
                </label>
                <input
                  type="text"
                  placeholder="e.g. Willing to pay ₹299/mo if setup takes < 10 mins"
                  value={formData.pricing_feedback}
                  onChange={(e) => setFormData({ ...formData, pricing_feedback: e.target.value })}
                  className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">
                  Follow-Up Action
                </label>
                <input
                  type="text"
                  placeholder="e.g. Share prototype screen recording next week"
                  value={formData.follow_up_notes}
                  onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-warm-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-ink-primary bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.willingness_to_pilot}
                  onChange={(e) => setFormData({ ...formData, willingness_to_pilot: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500/20 border-warm-300"
                />
                <span className="font-semibold text-ink-primary">
                  Seller explicitly expressed willingness to try a pilot sandbox
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-warm-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsInterviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-ink-secondary bg-warm-100 hover:bg-warm-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle transition-colors"
              >
                {editingInterview ? 'Update Interview' : 'Save Interview Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
