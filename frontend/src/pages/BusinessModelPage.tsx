import React, { useState } from 'react';
import {
  Briefcase,
  Target,
  Zap,
  Grid,
  Calculator,
  IndianRupee,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Printer,
  ChevronRight,
  Info,
  DollarSign,
  Maximize2,
  ShieldCheck,
  Store,
  Share2,
  Utensils
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

type BusinessSubTab = 'overview' | 'segments' | 'value-prop' | 'canvas' | 'pricing' | 'calculator';

interface BMCBlock {
  id: string;
  title: string;
  number: number;
  icon: string;
  summary: string[];
  details: string;
  color: string;
}

export const BusinessModelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BusinessSubTab>('overview');

  // Business Model Canvas State
  const [selectedBmcBlock, setSelectedBmcBlock] = useState<BMCBlock | null>(null);

  // Pricing Explorer State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [starterPrice, setStarterPrice] = useState<number>(299);
  const [growthPrice, setGrowthPrice] = useState<number>(799);

  // Break-even Calculator State
  const [calcRevenuePerSeller, setCalcRevenuePerSeller] = useState<number>(499);
  const [calcVariableCostPerSeller, setCalcVariableCostPerSeller] = useState<number>(99);
  const [calcFixedCosts, setCalcFixedCosts] = useState<number>(20000);
  const [calcCustomerCount, setCalcCustomerCount] = useState<number>(50);

  // Value Proposition Comparison Interactive Step State
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState<number>(0);

  // Computed Break-even metrics
  const revPerCustomer = Math.max(0, Number(calcRevenuePerSeller) || 0);
  const varCostPerCustomer = Math.max(0, Number(calcVariableCostPerSeller) || 0);
  const fixedCost = Math.max(0, Number(calcFixedCosts) || 0);
  const customerCount = Math.max(0, Number(calcCustomerCount) || 0);

  const contributionPerSeller = revPerCustomer - varCostPerCustomer;
  const contributionMarginPct = revPerCustomer > 0 ? (contributionPerSeller / revPerCustomer) * 100 : 0;
  
  const breakEvenCustomers = contributionPerSeller > 0
    ? Math.ceil(fixedCost / contributionPerSeller)
    : 0;

  const totalRevenue = customerCount * revPerCustomer;
  const totalVariableCost = customerCount * varCostPerCustomer;
  const totalCost = fixedCost + totalVariableCost;
  const operatingSurplusDeficit = totalRevenue - totalCost;

  // BMC Blocks Data
  const bmcBlocks: BMCBlock[] = [
    {
      id: 'key_partnerships',
      number: 8,
      title: 'Key Partnerships',
      icon: 'Handshake',
      summary: [
        'E-commerce & food platforms (where authorized APIs exist)',
        'Payment gateways (Razorpay, Cashfree, UPI aggregators)',
        'Courier aggregators (Shiprocket, Delhivery, Borzo)',
        'Cloud infrastructure providers (AWS, Supabase, Vercel)',
        'Micro-seller associations & Instagram seller networks'
      ],
      details: 'SellSync depends on platform APIs to fetch orders and synchronize inventory. In early stages, authorized platform access and courier API partnerships are essential. Strategic alliances with seller communities provide trust and organic distribution.',
      color: 'border-blue-200 bg-blue-50/40 text-blue-900',
    },
    {
      id: 'key_activities',
      number: 7,
      title: 'Key Activities',
      icon: 'Activity',
      summary: [
        'Platform engineering & normalized order/stock pipeline',
        'Connector maintenance & API schema versioning',
        'Continuous integration testing & exception monitoring',
        'Customer onboarding support & seller validation interviews',
        'Security, role controls & encrypted credential storage'
      ],
      details: 'Core engineering requires keeping connector adapters resilient to external marketplace API changes, webhooks, and rate limits. Continuous customer feedback ensures product roadmap matches micro-seller daily friction points.',
      color: 'border-indigo-200 bg-indigo-50/40 text-indigo-900',
    },
    {
      id: 'key_resources',
      number: 6,
      title: 'Key Resources',
      icon: 'Server',
      summary: [
        'Proprietary normalized multi-channel data schema',
        'Multi-tenant cloud platform & webhook processing engine',
        'Connector architecture for e-comm, food, & social sales',
        'Operational rules engine for automated stock allocations',
        'Domain expertise in Indian micro-seller workflows'
      ],
      details: 'SellSync\'s IP lies in normalizing disparate payloads (Amazon orders, Swiggy food orders, WhatsApp chats) into a unified data contract with real-time bidirectional inventory synchronization.',
      color: 'border-violet-200 bg-violet-50/40 text-violet-900',
    },
    {
      id: 'value_propositions',
      number: 2,
      title: 'Value Propositions',
      icon: 'Zap',
      summary: [
        'One unified order inbox replacing 4+ separate portals',
        'Centralized inventory buffer preventing stockouts & overselling',
        'Instant payment record verification & mismatch tracking',
        'Single-click dispatch & courier tracking link generation',
        'Cross-channel operational analytics and net profit visibility'
      ],
      details: 'Micro-sellers save 2–3 hours per day by eliminating repetitive administrative copying between WhatsApp, marketplaces, and physical logbooks while protecting their marketplace seller rating against stockout penalties.',
      color: 'border-amber-200 bg-amber-50/40 text-amber-900',
    },
    {
      id: 'customer_relationships',
      number: 4,
      title: 'Customer Relationships',
      icon: 'HeartHandshake',
      summary: [
        'Frictionless self-service onboarding (< 5 min setup)',
        'Step-by-step video tutorials & WhatsApp support hotline',
        'In-app contextual guidance & low-stock warning banners',
        'Assisted onboarding & migration for Growth tier sellers'
      ],
      details: 'Given micro-sellers have limited IT literacy, customer support must be accessible via WhatsApp and native Hindi/regional language UI helpers, with zero complex jargon.',
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
    },
    {
      id: 'channels',
      number: 3,
      title: 'Channels',
      icon: 'Share2',
      summary: [
        'Direct product website & interactive sandbox demo',
        'Instagram & YouTube micro-seller community tutorials',
        'WhatsApp seller group referrals and word-of-mouth',
        'Local maker fairs, craft bazaars & D2C summit booths',
        'Courier aggregator co-marketing & app marketplace listings'
      ],
      details: 'Micro-sellers discover tools primarily through peer recommendations and social creator workflows. A viral referral credit system (e.g., 1 free month per referred seller) accelerates low-CAC acquisition.',
      color: 'border-cyan-200 bg-cyan-50/40 text-cyan-900',
    },
    {
      id: 'customer_segments',
      number: 1,
      title: 'Customer Segments',
      icon: 'Users',
      summary: [
        'Primary: Multi-channel product sellers & Instagram boutiques',
        'Primary: Home-based craft businesses & independent resellers',
        'Secondary: Independent creators selling merchandise & D2C goods',
        'Future: Quick-service restaurants & cloud kitchens on Swiggy/Zomato'
      ],
      details: 'Initial beachhead: Sellers processing 10 to 50 orders daily across 2 to 4 channels who do not have dedicated inventory staff and suffer from frequent overselling or reconciliation headaches.',
      color: 'border-rose-200 bg-rose-50/40 text-rose-900',
    },
    {
      id: 'cost_structure',
      number: 9,
      title: 'Cost Structure',
      icon: 'DollarSign',
      summary: [
        'Cloud infrastructure & database hosting (AWS / Render)',
        'Third-party API gateway and SMS / WhatsApp notification quotas',
        'Software engineering, connector maintenance & security audits',
        'Customer support & onboarding documentation',
        'Seller acquisition (content, social marketing & community outreach)'
      ],
      details: 'Fixed costs remain modest in early stages (~₹20,000/month). Variable servicing cost per seller (~₹99/month) primarily scales with webhook throughput, notification messages, and label rendering.',
      color: 'border-red-200 bg-red-50/40 text-red-900',
    },
    {
      id: 'revenue_streams',
      number: 5,
      title: 'Revenue Streams',
      icon: 'IndianRupee',
      summary: [
        'Free Tier: ₹0/mo (Basic dashboard, manual entry, single stock view)',
        'Starter Tier: ₹299/mo (Unified inbox, low-stock alerts, 2 channels)',
        'Growth Tier: ₹799/mo (All channels, automation rules, bulk labels)',
        'Annual Subscriptions (20% discount for upfront cash commitment)',
        'Optional Add-ons: Assisted channel setup & premium WhatsApp bot quota'
      ],
      details: 'SaaS subscription recurring revenue. Low price point (₹299/mo) matches Indian micro-seller willingness-to-pay while generating healthy gross margins (>75%) at scale.',
      color: 'border-teal-200 bg-teal-50/40 text-teal-900',
    },
  ];

  const workflowComparison = [
    {
      step: '1. Order Capture',
      current: 'Seller checks Amazon seller portal, Meesho app, Swiggy partner app, and WhatsApp DMs individually. Notes orders on paper or spreadsheet.',
      sellsync: 'All orders land instantaneously in the Unified Order Inbox with standardized status, payment badges, and channel tags.',
      saving: 'Saves 45–60 min daily',
    },
    {
      step: '2. Stock Allocation',
      current: 'After selling an item on Instagram, seller forgets to deduct stock on Amazon. Next day, item sells on Amazon and must be cancelled.',
      sellsync: 'Central Inventory automatically decrements quantity across all connected channels. Low-stock alert triggers at buffer threshold.',
      saving: 'Prevents 100% of stockout cancellations',
    },
    {
      step: '3. Payment Reconciliation',
      current: 'Seller manually cross-checks screenshot UPI slips on WhatsApp. Marketplace payout deductions remain unverified until bank statements arrive.',
      sellsync: 'Instant verification for UPI and marketplace settlements. Mismatch flags alert seller before items are packaged.',
      saving: 'Eliminates revenue leakage & fraud',
    },
    {
      step: '4. Shipping & Labelling',
      current: 'Seller copies buyer address from WhatsApp into courier app, prints label separately, and sends tracking link manually back to buyer.',
      sellsync: 'One-click courier label generation with pre-filled dimensions and automated WhatsApp dispatch tracking message preview.',
      saving: 'Reduces dispatch time by 70%',
    },
    {
      step: '5. Business Performance',
      current: 'No visibility into which channel is truly profitable after marketplace commissions, food commissions (25%), and return rates.',
      sellsync: 'Unified Business Analytics showing net revenue, channel contribution, return rates, and top moving SKUs in real time.',
      saving: 'Informed stock purchasing decisions',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner with Ambient Glow & Sub-navigation Tabs */}
      <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-card ambient-glow relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                MDMIE01 Entrepreneurship Framework
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                Hypothesis & Planning Mode
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
              Startup Business Model & Viability Strategy
            </h1>
            <p className="text-xs text-ink-secondary mt-1 max-w-2xl leading-relaxed">
              SellSync: <strong className="text-ink-primary font-semibold">One dashboard. Every sales channel. Less manual work.</strong> Formulating
              unit economics, customer segment hypotheses, and an interactive Business Model Canvas for academic review.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-ink-primary bg-warm-100 hover:bg-warm-200 rounded-xl border border-warm-200 transition-colors shadow-2xs"
              title="Print page for classroom presentation"
            >
              <Printer className="w-3.5 h-3.5 text-ink-secondary" />
              <span>Print Brief</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-warm-200 overflow-x-auto no-scrollbar relative z-10">
          {[
            { id: 'overview', label: 'Business Overview', icon: Briefcase },
            { id: 'segments', label: 'Customer Segments', icon: Target },
            { id: 'value-prop', label: 'Value Proposition Comparison', icon: Zap },
            { id: 'canvas', label: '9-Block Canvas', icon: Grid },
            { id: 'pricing', label: 'Pricing Explorer', icon: IndianRupee },
            { id: 'calculator', label: 'Break-Even Calculator', icon: Calculator },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as BusinessSubTab)}
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
          TAB 1: BUSINESS OVERVIEW
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Vision & Mission */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card space-y-2">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-ink-primary">Product Vision</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Empower 50M+ micro-sellers across India with enterprise-grade operational efficiency—enabling home-based businesses,
                boutiques, and local kitchens to sell seamlessly across marketplaces, food aggregators, and social channels without
                clerical overhead or stock conflicts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-ink-primary">Customer Problem</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Small multi-channel sellers spend 2–4 hours daily logging into 4+ disparate portals, transcribing orders to spreadsheets,
                manually checking UPI payments, and suffering avoidable stockouts or delayed dispatches that harm marketplace seller ratings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-ink-primary">Proposed Solution</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                A unified web operations cockpit providing a consolidated order inbox, shared real-time inventory synchronization,
                payment reconciliation alerts, single-click courier packing slips, and cross-channel margin intelligence.
              </p>
            </div>
          </div>

          {/* Current Prototype vs Future Integrations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-warm-100">
                <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Currently Implemented Prototype Capabilities
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Functional in Demo
                </span>
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-ink-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong className="text-ink-primary">Unified Order Inbox:</strong> Real-time filtering, channel categorization, status workflow (PENDING → CONFIRMED → PACKED → DISPATCHED → DELIVERED).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong className="text-ink-primary">Centralized Stock Allocations:</strong> Multi-channel inventory buffers, manual stock adjustments with audit logs, low-stock threshold triggers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong className="text-ink-primary">Payment Simulation & Verification:</strong> UPI screenshot matching, payment status overrides, and simulated settlement batch processing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong className="text-ink-primary">Fulfilment Hub:</strong> Packing slip preview, printable shipping labels, courier dispatch tracking links, and food delivery handover codes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong className="text-ink-primary">Automation Centre:</strong> Rule toggles for auto-confirming paid orders, auto-holding unverified COD, and low-stock notification alerts.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-warm-100">
                <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Roadmap: Features Requiring Future Integrations
                </h3>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Requires Live Partner APIs
                </span>
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-ink-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">→</span>
                  <span><strong className="text-ink-primary">Marketplace SP-APIs:</strong> Live Amazon Selling Partner API, Flipkart Seller API, and Meesho webhook integration for automated order push.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">→</span>
                  <span><strong className="text-ink-primary">Food Aggregator APIs:</strong> Swiggy & Zomato partner APIs for instantaneous kitchen order ticket (KOT) generation and rider tracking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">→</span>
                  <span><strong className="text-ink-primary">Meta WhatsApp Cloud API:</strong> Automated conversational order intake bots and buyer delivery status broadcasts via verified phone numbers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">→</span>
                  <span><strong className="text-ink-primary">Courier Aggregator APIs:</strong> Automated AWB assignment with Shiprocket / Delhivery and automated pickup schedule dispatch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">→</span>
                  <span><strong className="text-ink-primary">Live Payment Gateways:</strong> Production Razorpay / Cashfree webhooks for programmatic payment reconciliation and refund handling.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Academic Transparency Alert */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-950">Academic Integrity Notice (MDMIE01):</strong>
              <p className="mt-0.5 text-amber-900 leading-relaxed">
                All platform connectors in this prototype currently operate in <strong>DEMO MODE</strong> with realistic simulated seed data.
                No third-party platform credentials or customer data are accessed. The business models, pricing tiers, and break-even calculations
                presented here are planning hypotheses designed for testing and classroom evaluation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CUSTOMER SEGMENTS
         ========================================================================= */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
            <h2 className="text-base font-semibold text-ink-primary">Target Customer Segment Hypotheses</h2>
            <p className="text-xs text-ink-secondary mt-1">
              Analysis of three key customer cohorts, their operational bottlenecks, and how SellSync solves their daily pain points.
              These hypotheses are currently undergoing structured customer validation interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Segment 1: Primary */}
            <div className="bg-white rounded-2xl border-2 border-brand-500/50 shadow-card flex flex-col overflow-hidden">
              <div className="bg-brand-50/70 p-5 border-b border-brand-100 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-500 text-white rounded uppercase tracking-wider">
                    Primary Beachhead
                  </span>
                  <h3 className="text-sm font-semibold text-ink-primary mt-2 flex items-center gap-2">
                    <Store className="w-4 h-4 text-brand-500" />
                    Multi-Channel Micro-Sellers
                  </h3>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5 text-xs text-ink-secondary">
                  <div>
                    <strong className="text-ink-primary block text-[11px] uppercase tracking-wider mb-0.5">Profile:</strong>
                    <span>Instagram boutiques, Meesho resellers, handicraft makers, apparel vendors (10–50 orders/day).</span>
                  </div>
                  <div>
                    <strong className="text-ink-primary block text-[11px] uppercase tracking-wider mb-0.5">Current Problem:</strong>
                    <span className="text-rose-700">Manually syncing inventory between Instagram DMs and Amazon leads to double-selling and penalizing cancellations.</span>
                  </div>
                  <div>
                    <strong className="text-ink-primary block text-[11px] uppercase tracking-wider mb-0.5">SellSync Value:</strong>
                    <span className="text-emerald-700">Central stock synchronization, instant WhatsApp dispatch tracking, and single-click label printing.</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-warm-100 text-[11px] text-ink-muted">
                  <span className="font-semibold text-ink-primary">Estimated Willingness to Pay:</span> ₹299–₹499/mo
                </div>
              </div>
            </div>

            {/* Segment 2: Secondary */}
            <div className="bg-white rounded-2xl border border-warm-200 shadow-card flex flex-col overflow-hidden">
              <div className="bg-purple-50/70 p-5 border-b border-purple-100 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-600 text-white rounded uppercase tracking-wider">
                    Secondary Target
                  </span>
                  <h3 className="text-sm font-semibold text-ink-primary mt-2 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-600" />
                    Independent Creators & D2C
                  </h3>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5 text-xs text-ink-secondary">
                  <div>
                    <strong className="text-ink-primary block text-[11px] uppercase tracking-wider mb-0.5">Profile:</strong>
                    <span>Artists, niche merchandise creators, podcasters, and small beauty/cosmetic formulators with custom websites.</span>
                  </div>
                  <div>
                    <strong className="text-ink-primary block text-[11px] uppercase tracking-wider mb-0.5">Current Problem:</strong>
                    <span className="text-rose-700">Payments arrive via Google Pay screenshots; manual address collection in DMs causes high delivery failure rates.</span>
                  </div>
                  <div>
                    <strong className="text-ink-primary block text-[11px] uppercase tracking-wider mb-0.5">SellSync Value:</strong>
                    <span className="text-emerald-700">Automated UPI verification and pre-formatted address validation before shipment dispatch.</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-warm-100 text-[11px] text-ink-muted">
                  <span className="font-semibold text-ink-primary">Estimated Willingness to Pay:</span> ₹499–₹799/mo
                </div>
              </div>
            </div>

            {/* Segment 3: Future Expansion */}
            <div className="bg-white rounded-2xl border border-warm-200 shadow-card flex flex-col overflow-hidden">
              <div className="bg-amber-50/70 p-5 border-b border-amber-100 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-600 text-white rounded uppercase tracking-wider">
                    Future Expansion
                  </span>
                  <h3 className="text-sm font-semibold text-ink-primary mt-2 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-600" />
                    Restaurants & Cloud Kitchens
                  </h3>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5 text-xs text-ink-secondary">
                  <div>
                    <strong className="text-ink-primary block text-[11px] uppercase tracking-wider mb-0.5">Profile:</strong>
                    <span>Home bakers, cloud kitchens, and takeaway food outlets operating simultaneously on Swiggy and Zomato.</span>
                  </div>
                  <div>
                    <strong className="text-ink-primary block text-[11px] uppercase tracking-wider mb-0.5">Current Problem:</strong>
                    <span className="text-rose-700">Two separate tablet screens; high rush hour stress leading to missed food orders and rider handover confusion.</span>
                  </div>
                  <div>
                    <strong className="text-ink-primary block text-[11px] uppercase tracking-wider mb-0.5">SellSync Value:</strong>
                    <span className="text-emerald-700">Consolidated kitchen display with 4-digit pickup code tracking and shared daily batch ingredient counts.</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-warm-100 text-[11px] text-ink-muted">
                  <span className="font-semibold text-ink-primary">Estimated Willingness to Pay:</span> ₹799–₹1,499/mo
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: VALUE PROPOSITION COMPARISON
         ========================================================================= */}
      {activeTab === 'value-prop' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
            <h2 className="text-base font-semibold text-ink-primary">Current Workflow vs. Proposed SellSync Workflow</h2>
            <p className="text-xs text-ink-secondary mt-1">
              Select any workflow phase below to inspect the operational friction micro-sellers face today and how SellSync streamlines it.
            </p>
          </div>

          {/* Interactive Steps Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {workflowComparison.map((item, idx) => {
              const isSelected = selectedWorkflowStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedWorkflowStep(idx)}
                  className={`p-3.5 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-purple-50 border-purple-500 text-purple-950 shadow-subtle'
                      : 'bg-white border-warm-200 text-ink-secondary hover:bg-warm-50'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-ink-muted block uppercase">Step 0{idx + 1}</span>
                  <span className="text-xs font-semibold mt-1 line-clamp-1 text-ink-primary">{item.step.replace(/^\d+\.\s*/, '')}</span>
                </button>
              );
            })}
          </div>

          {/* Side-by-Side Detailed Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Manual Workflow */}
            <div className="bg-rose-50/50 rounded-2xl border border-rose-200/80 p-6 flex flex-col justify-between shadow-subtle">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-200/60">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800 rounded-lg">
                    Traditional Manual Process
                  </span>
                  <span className="text-xs text-rose-600 font-medium">High Friction & Error Prone</span>
                </div>
                <h4 className="text-sm font-semibold text-rose-950 mb-2">
                  {workflowComparison[selectedWorkflowStep].step}
                </h4>
                <p className="text-xs text-rose-900/80 leading-relaxed">
                  {workflowComparison[selectedWorkflowStep].current}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-rose-200/60 text-xs text-rose-800 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Result: Uncoordinated inventory, late dispatches, and wasted owner time.</span>
              </div>
            </div>

            {/* Proposed SellSync Workflow */}
            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-6 flex flex-col justify-between shadow-subtle">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-200/60">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-lg">
                    Proposed SellSync System
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Automated & Centralized
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-emerald-950 mb-2">
                  {workflowComparison[selectedWorkflowStep].step}
                </h4>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  {workflowComparison[selectedWorkflowStep].sellsync}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-200/60 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Impact: {workflowComparison[selectedWorkflowStep].saving}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 9-BLOCK BUSINESS MODEL CANVAS
         ========================================================================= */}
      {activeTab === 'canvas' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-ink-primary">Interactive Business Model Canvas</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded">
                  Proposed Model (Alexander Osterwalder Framework)
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-1">
                Click any block to open a comprehensive strategic breakdown and operational assumptions.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-ink-primary bg-warm-100 hover:bg-warm-200 rounded-xl border border-warm-200 transition-colors shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-ink-secondary" />
              <span>Print Canvas</span>
            </button>
          </div>

          {/* Standard Osterwalder 9-Block Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
            {/* Column 1: Key Partners (Rowspan 2 on desktop) */}
            <div
              onClick={() => setSelectedBmcBlock(bmcBlocks[0])}
              className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-card md:row-span-2 flex flex-col justify-between ${bmcBlocks[0].color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase opacity-75">Block 8</span>
                  <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                </div>
                <h3 className="font-semibold text-sm mb-3">{bmcBlocks[0].title}</h3>
                <ul className="space-y-1.5 text-[11px] leading-relaxed">
                  {bmcBlocks[0].summary.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="opacity-60">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <span className="mt-4 text-[10px] font-semibold opacity-75 underline">Click for partner strategy →</span>
            </div>

            {/* Column 2: Key Activities (Top) & Key Resources (Bottom) */}
            <div className="md:col-span-1 space-y-3.5">
              <div
                onClick={() => setSelectedBmcBlock(bmcBlocks[1])}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-card h-full flex flex-col justify-between ${bmcBlocks[1].color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase opacity-75">Block 7</span>
                    <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{bmcBlocks[1].title}</h3>
                  <ul className="space-y-1 text-[11px]">
                    {bmcBlocks[1].summary.slice(0, 3).map((item, i) => (
                      <li key={i} className="truncate">• {item}</li>
                    ))}
                  </ul>
                </div>
                <span className="mt-3 text-[10px] font-semibold opacity-75 underline">Click for details →</span>
              </div>

              <div
                onClick={() => setSelectedBmcBlock(bmcBlocks[2])}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-card h-full flex flex-col justify-between ${bmcBlocks[2].color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase opacity-75">Block 6</span>
                    <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{bmcBlocks[2].title}</h3>
                  <ul className="space-y-1 text-[11px]">
                    {bmcBlocks[2].summary.slice(0, 3).map((item, i) => (
                      <li key={i} className="truncate">• {item}</li>
                    ))}
                  </ul>
                </div>
                <span className="mt-3 text-[10px] font-semibold opacity-75 underline">Click for details →</span>
              </div>
            </div>

            {/* Column 3: Value Propositions (Rowspan 2) */}
            <div
              onClick={() => setSelectedBmcBlock(bmcBlocks[3])}
              className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-card md:row-span-2 flex flex-col justify-between ${bmcBlocks[3].color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase opacity-75">Block 2</span>
                  <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                </div>
                <h3 className="font-semibold text-sm mb-3">{bmcBlocks[3].title}</h3>
                <ul className="space-y-1.5 text-[11px] leading-relaxed">
                  {bmcBlocks[3].summary.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="opacity-60">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <span className="mt-4 text-[10px] font-semibold opacity-75 underline">Click for value pillars →</span>
            </div>

            {/* Column 4: Customer Relationships (Top) & Channels (Bottom) */}
            <div className="md:col-span-1 space-y-3.5">
              <div
                onClick={() => setSelectedBmcBlock(bmcBlocks[4])}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-card h-full flex flex-col justify-between ${bmcBlocks[4].color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase opacity-75">Block 4</span>
                    <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{bmcBlocks[4].title}</h3>
                  <ul className="space-y-1 text-[11px]">
                    {bmcBlocks[4].summary.slice(0, 3).map((item, i) => (
                      <li key={i} className="truncate">• {item}</li>
                    ))}
                  </ul>
                </div>
                <span className="mt-3 text-[10px] font-semibold opacity-75 underline">Click for details →</span>
              </div>

              <div
                onClick={() => setSelectedBmcBlock(bmcBlocks[5])}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-card h-full flex flex-col justify-between ${bmcBlocks[5].color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase opacity-75">Block 3</span>
                    <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{bmcBlocks[5].title}</h3>
                  <ul className="space-y-1 text-[11px]">
                    {bmcBlocks[5].summary.slice(0, 3).map((item, i) => (
                      <li key={i} className="truncate">• {item}</li>
                    ))}
                  </ul>
                </div>
                <span className="mt-3 text-[10px] font-semibold opacity-75 underline">Click for details →</span>
              </div>
            </div>

            {/* Column 5: Customer Segments (Rowspan 2) */}
            <div
              onClick={() => setSelectedBmcBlock(bmcBlocks[6])}
              className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-card md:row-span-2 flex flex-col justify-between ${bmcBlocks[6].color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase opacity-75">Block 1</span>
                  <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                </div>
                <h3 className="font-semibold text-sm mb-3">{bmcBlocks[6].title}</h3>
                <ul className="space-y-1.5 text-[11px] leading-relaxed">
                  {bmcBlocks[6].summary.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="opacity-60">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <span className="mt-4 text-[10px] font-semibold opacity-75 underline">Click for segment notes →</span>
            </div>

            {/* Bottom Row: Cost Structure (Colspan 2) & Revenue Streams (Colspan 3) */}
            <div
              onClick={() => setSelectedBmcBlock(bmcBlocks[7])}
              className={`md:col-span-2 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-card flex flex-col justify-between ${bmcBlocks[7].color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase opacity-75">Block 9</span>
                  <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{bmcBlocks[7].title}</h3>
                <ul className="space-y-1 text-[11px]">
                  {bmcBlocks[7].summary.map((item, i) => (
                    <li key={i} className="truncate">• {item}</li>
                  ))}
                </ul>
              </div>
              <span className="mt-3 text-[10px] font-semibold opacity-75 underline">Click for cost breakdown →</span>
            </div>

            <div
              onClick={() => setSelectedBmcBlock(bmcBlocks[8])}
              className={`md:col-span-3 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-card flex flex-col justify-between ${bmcBlocks[8].color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase opacity-75">Block 5</span>
                  <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{bmcBlocks[8].title}</h3>
                <ul className="space-y-1 text-[11px]">
                  {bmcBlocks[8].summary.map((item, i) => (
                    <li key={i} className="truncate">• {item}</li>
                  ))}
                </ul>
              </div>
              <span className="mt-3 text-[10px] font-semibold opacity-75 underline">Click for revenue mechanics →</span>
            </div>
          </div>

          {/* Modal for detail view */}
          {selectedBmcBlock && (
            <Modal
              isOpen={Boolean(selectedBmcBlock)}
              onClose={() => setSelectedBmcBlock(null)}
              title={`${selectedBmcBlock.title} (Block ${selectedBmcBlock.number})`}
              subtitle="Proposed Business Model Canvas Component"
              maxWidth="lg"
            >
              <div className="space-y-4 text-xs text-ink-primary">
                <div>
                  <h4 className="font-semibold text-ink-primary text-sm mb-2">Key Operational Items:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-ink-secondary">
                    {selectedBmcBlock.summary.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="pt-3 border-t border-warm-200">
                  <h4 className="font-semibold text-ink-primary text-sm mb-2">Strategic Rationale & Assumptions:</h4>
                  <p className="leading-relaxed text-ink-secondary bg-warm-50 p-4 rounded-xl border border-warm-200">
                    {selectedBmcBlock.details}
                  </p>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedBmcBlock(null)}
                    className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 transition-colors shadow-subtle"
                  >
                    Close Block
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: PRICING EXPLORER
         ========================================================================= */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-ink-primary">Interactive Pricing Hypothesis Explorer</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded">
                  Planning Tool Only
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-1">
                Hypothetical tiers formulated to test price sensitivity among Indian micro-sellers. Edit assumed monthly prices to simulate subscription economics.
              </p>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-warm-100 rounded-xl border border-warm-200 self-start md:self-auto">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  billingCycle === 'monthly' ? 'bg-white text-ink-primary shadow-subtle font-semibold' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-white text-ink-primary shadow-subtle font-semibold' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">20% OFF</span>
              </button>
            </div>
          </div>

          {/* Editable Assumed Price Inputs */}
          <div className="bg-warm-50/80 p-4 rounded-xl border border-warm-200 flex flex-wrap items-center gap-4 text-xs">
            <span className="font-semibold text-ink-primary flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-brand-500" />
              Adjust Price Hypotheses:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-ink-secondary font-medium">Starter Assumed Monthly (₹):</label>
              <input
                type="number"
                min="0"
                step="50"
                value={starterPrice}
                onChange={(e) => setStarterPrice(Number(e.target.value) || 0)}
                className="w-24 px-2.5 py-1 text-xs border border-warm-300 rounded-lg bg-white text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold tabular-nums"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-ink-secondary font-medium">Growth Assumed Monthly (₹):</label>
              <input
                type="number"
                min="0"
                step="50"
                value={growthPrice}
                onChange={(e) => setGrowthPrice(Number(e.target.value) || 0)}
                className="w-24 px-2.5 py-1 text-xs border border-warm-300 rounded-lg bg-white text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold tabular-nums"
              />
            </div>
            <span className="text-[11px] text-ink-muted italic">
              *Updates cards below in real-time.
            </span>
          </div>

          {/* Three Tier Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TIER 1: FREE */}
            <div className="bg-white rounded-2xl border border-warm-200 p-6 flex flex-col justify-between shadow-card">
              <div>
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-warm-100 text-ink-secondary rounded uppercase tracking-wider">
                    Community Tier
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                    Hypothesis — to be tested
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink-primary mt-2">FREE</h3>
                <p className="text-xs text-ink-secondary mt-1">For single-channel hobbyists and newly launched makers.</p>
                <div className="mt-4 pb-4 border-b border-warm-100">
                  <span className="text-3xl font-bold text-ink-primary tabular-nums">₹0</span>
                  <span className="text-xs text-ink-muted"> /month</span>
                </div>
                <div className="mt-4 space-y-2.5 text-xs text-ink-secondary">
                  <div className="font-semibold text-ink-primary text-[11px] uppercase tracking-wider">Features:</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Basic operational dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Up to 30 manual orders / month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Single central inventory table</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <span className="shrink-0">✕</span>
                    <span>No multi-channel auto-sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <span className="shrink-0">✕</span>
                    <span>No automated courier labels</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-warm-100 text-[11px] text-ink-muted">
                <strong className="text-ink-primary">Target:</strong> Zero-risk adoption to build trust and gather early product telemetry.
              </div>
            </div>

            {/* TIER 2: STARTER (Highlighted) */}
            <div className="bg-white rounded-2xl border-2 border-brand-500 p-6 flex flex-col justify-between shadow-float relative">
              <div className="absolute -top-3 right-6 px-2.5 py-0.5 text-[10px] font-bold bg-brand-500 text-white rounded-full uppercase tracking-wider shadow-subtle">
                Hypothesis Tier
              </div>
              <div>
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-700 rounded uppercase tracking-wider">
                    Micro-Seller Tier
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                    Hypothesis — to be tested
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink-primary mt-2">STARTER</h3>
                <p className="text-xs text-ink-secondary mt-1">For active Instagram boutiques & dual-channel sellers.</p>
                <div className="mt-4 pb-4 border-b border-warm-100">
                  <span className="text-3xl font-bold text-brand-600 tabular-nums">
                    ₹{billingCycle === 'annual' ? Math.round(starterPrice * 0.8) : starterPrice}
                  </span>
                  <span className="text-xs text-ink-muted"> /month</span>
                  {billingCycle === 'annual' && (
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 tabular-nums">
                      Billed ₹{Math.round(starterPrice * 0.8 * 12)} annually (Save 20%)
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2.5 text-xs text-ink-secondary">
                  <div className="font-semibold text-ink-primary text-[11px] uppercase tracking-wider">Features:</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unified inbox for up to 3 channels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Real-time stock buffer & low-stock alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>UPI payment reconciliation checks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Single-click courier shipping labels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Standard email & WhatsApp support</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-warm-100 text-[11px] text-ink-muted">
                <strong className="text-ink-primary">Target:</strong> Solves 80% of daily friction for ~₹10/day, well within micro-seller budgets.
              </div>
            </div>

            {/* TIER 3: GROWTH */}
            <div className="bg-white rounded-2xl border border-warm-200 p-6 flex flex-col justify-between shadow-card">
              <div>
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 rounded uppercase tracking-wider">
                    Scale & Kitchen Tier
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                    Hypothesis — to be tested
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink-primary mt-2">GROWTH</h3>
                <p className="text-xs text-ink-secondary mt-1">For multi-marketplace resellers and cloud kitchens.</p>
                <div className="mt-4 pb-4 border-b border-warm-100">
                  <span className="text-3xl font-bold text-ink-primary tabular-nums">
                    ₹{billingCycle === 'annual' ? Math.round(growthPrice * 0.8) : growthPrice}
                  </span>
                  <span className="text-xs text-ink-muted"> /month</span>
                  {billingCycle === 'annual' && (
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 tabular-nums">
                      Billed ₹{Math.round(growthPrice * 0.8 * 12)} annually (Save 20%)
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2.5 text-xs text-ink-secondary">
                  <div className="font-semibold text-ink-primary text-[11px] uppercase tracking-wider">Features:</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited connected channels & food outlets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Automation Rules Centre (instant hold/release)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Advanced BI analytics & channel margin breakdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Kitchen display mode with food handover codes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Priority assisted onboarding & phone hotline</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-warm-100 text-[11px] text-ink-muted">
                <strong className="text-ink-primary">Target:</strong> High-volume sellers willing to pay for automated exception management.
              </div>
            </div>
          </div>

          {/* Pricing Policy Disclaimer */}
          <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 text-ink-secondary text-xs flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-ink-muted shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-ink-primary">Hypothesis Validation Disclaimer:</strong>
              <p className="mt-0.5 leading-relaxed text-ink-secondary">
                SellSync does not activate real subscriptions or collect payments. These tiers represent illustrative hypotheses for
                customer validation interviews to evaluate price sensitivity. Unlimited order tiers are strictly subject to fair-use API quotas
                to manage underlying third-party connector server expenses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: BREAK-EVEN CALCULATOR
         ========================================================================= */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-ink-primary">Unit Economics & Break-Even Calculator</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                Interactive Model
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              Test assumptions for monthly revenue, variable servicing cost per seller, and fixed operating overheads to calculate contribution margin and break-even scale.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card space-y-4">
              <h3 className="text-sm font-semibold text-ink-primary pb-2 border-b border-warm-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-brand-500" />
                Assumed Parameters
              </h3>

              <div>
                <label className="block text-xs font-semibold text-ink-primary">
                  Average Monthly Revenue per Seller (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="50"
                  value={calcRevenuePerSeller}
                  onChange={(e) => setCalcRevenuePerSeller(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full px-3 py-2 text-xs border border-warm-300 rounded-xl bg-white text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-ink-muted mt-1 block">Default ₹499 (Blended Starter + Growth)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary">
                  Variable Monthly Cost per Seller (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={calcVariableCostPerSeller}
                  onChange={(e) => setCalcVariableCostPerSeller(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full px-3 py-2 text-xs border border-warm-300 rounded-xl bg-white text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-ink-muted mt-1 block">Default ₹99 (API webhooks, DB storage, SMS units)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary">
                  Monthly Fixed Operating Costs (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={calcFixedCosts}
                  onChange={(e) => setCalcFixedCosts(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full px-3 py-2 text-xs border border-warm-300 rounded-xl bg-white text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold tabular-nums"
                />
                <span className="text-[10px] text-ink-muted mt-1 block">Default ₹20,000 (Core servers, tooling, domain, ops)</span>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink-primary">
                    Selected Customer Count:
                  </label>
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200 tabular-nums">
                    {calcCustomerCount} Sellers
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={calcCustomerCount}
                  onChange={(e) => setCalcCustomerCount(Number(e.target.value) || 0)}
                  className="mt-2 w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-ink-muted mt-1 tabular-nums">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                  <span>150</span>
                  <span>200+</span>
                </div>
              </div>
            </div>

            {/* Calculated Output & Formula Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              {/* Top Key Result Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                    Unit Contribution
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-1 tabular-nums">
                    <span className="text-2xl font-bold text-ink-primary">
                      ₹{contributionPerSeller.toLocaleString()}
                    </span>
                    <span className="text-xs text-ink-muted">/seller</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1 block tabular-nums">
                    {contributionMarginPct.toFixed(1)}% Contribution Margin
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-card">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                    Break-Even Scale
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-1 tabular-nums">
                    <span className="text-2xl font-bold text-brand-500">
                      {contributionPerSeller > 0 ? breakEvenCustomers : 'N/A'}
                    </span>
                    <span className="text-xs text-ink-muted">paying sellers</span>
                  </div>
                  <span className="text-[10px] text-ink-muted mt-1 block">
                    Fixed Costs ÷ Contribution
                  </span>
                </div>

                <div className={`p-5 rounded-2xl border shadow-card ${
                  operatingSurplusDeficit >= 0
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/70 border-rose-200 text-rose-950'
                }`}>
                  <span className="text-[11px] font-semibold opacity-75 uppercase tracking-wider block">
                    Operating Result ({calcCustomerCount} Sellers)
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-1 tabular-nums">
                    <span className="text-2xl font-bold">
                      {operatingSurplusDeficit >= 0 ? '+' : '-'}₹{Math.abs(operatingSurplusDeficit).toLocaleString()}
                    </span>
                    <span className="text-xs opacity-75">/mo</span>
                  </div>
                  <span className="text-[10px] font-bold mt-1 block">
                    {operatingSurplusDeficit >= 0 ? '✓ Operating Surplus' : '⚠ Operating Deficit'}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Mathematical Explanation Table */}
              <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card">
                <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-3">
                  Calculation Mechanics & Line-Item Breakdown
                </h4>
                <div className="divide-y divide-warm-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between tabular-nums">
                    <span className="text-ink-secondary">Monthly Revenue at {customerCount} Sellers:</span>
                    <span className="font-semibold text-ink-primary">₹{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between tabular-nums">
                    <span className="text-ink-secondary">Total Variable Servicing Costs ({customerCount} × ₹{varCostPerCustomer}):</span>
                    <span className="font-semibold text-rose-600">-₹{totalVariableCost.toLocaleString()}</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between tabular-nums">
                    <span className="text-ink-secondary">Monthly Fixed Operating Expenses:</span>
                    <span className="font-semibold text-rose-600">-₹{fixedCost.toLocaleString()}</span>
                  </div>
                  <div className="py-3 flex items-center justify-between font-bold text-sm bg-warm-50 px-3 rounded-xl tabular-nums">
                    <span className="text-ink-primary">Net Estimated Operating Surplus / (Deficit):</span>
                    <span className={operatingSurplusDeficit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {operatingSurplusDeficit >= 0 ? '+' : '-'}₹{Math.abs(operatingSurplusDeficit).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-warm-50 rounded-xl border border-warm-200 text-[11px] text-ink-secondary leading-relaxed">
                  <strong className="text-ink-primary">Financial Terminology Distinction:</strong> Contribution margin
                  (Revenue − Variable Costs) reflects how much each additional customer contributes towards covering fixed overheads.
                  It differs from Net Profit, which further deducts taxes, marketing acquisition amortization (CAC), and capital depreciation.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
