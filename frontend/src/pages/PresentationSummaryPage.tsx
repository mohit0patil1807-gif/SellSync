import React, { useState } from 'react';
import {
  Presentation,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  Grid,
  DollarSign,
  AlertTriangle,
  ClipboardCheck,
  Milestone,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Store,
  ExternalLink
} from 'lucide-react';

interface SlideItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export const PresentationSummaryPage: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [presentationMode, setPresentationMode] = useState<boolean>(false);

  const slides: SlideItem[] = [
    {
      id: 'problem_segment',
      badge: '01 / Problem & Beachhead',
      title: 'Customer Pain & Target Beachhead',
      subtitle: 'The daily operational struggle of Indian micro-sellers',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-rose-50/60 p-5 rounded-xl border border-rose-200">
              <h4 className="text-sm font-bold text-rose-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                The Problem: Fragmented Operations
              </h4>
              <ul className="space-y-2 text-xs text-rose-800 leading-relaxed">
                <li>• <strong>Portal Fatigue:</strong> Micro-sellers switch between 4+ apps (Amazon, Meesho, WhatsApp, Swiggy) daily.</li>
                <li>• <strong>Overselling & Cancellations:</strong> Stock sold on Instagram isn't deducted on Amazon, resulting in stockouts and marketplace rating downgrades.</li>
                <li>• <strong>Clerical Overhead:</strong> 2 to 4 hours wasted daily copying addresses, manually matching UPI screenshot slips, and booking couriers.</li>
              </ul>
            </div>

            <div className="bg-brand-50/60 p-5 rounded-xl border border-brand-200">
              <h4 className="text-sm font-bold text-brand-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-600" />
                Target Customer Segment
              </h4>
              <ul className="space-y-2 text-xs text-brand-800 leading-relaxed">
                <li>• <strong>Primary Beachhead:</strong> Small multi-channel retailers, Instagram boutiques, handicraft makers, and home resellers (10–50 orders/day).</li>
                <li>• <strong>Secondary Target:</strong> Independent creators & niche D2C makers selling via Instagram DM and Shopify.</li>
                <li>• <strong>Future Expansion:</strong> Cloud kitchens and bakeries managing dual delivery tablets (Swiggy + Zomato).</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span><strong>Market Opportunity:</strong> Over 50M registered MSMEs in India are adopting digital sales channels without dedicated IT or operations staff.</span>
            <span className="font-semibold text-brand-600 shrink-0 ml-4">MDMIE01 Beachhead</span>
          </div>
        </div>
      ),
    },
    {
      id: 'solution',
      badge: '02 / Improved Solution',
      title: 'SellSync: Unified Commerce Management',
      subtitle: 'One cockpit for orders, inventory, payments, and dispatch',
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Product Tagline</span>
              <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">
                One dashboard. Every sales channel. Less manual work.
              </h3>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-lg">
              SaaS Web Application
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-2">1</div>
              <h4 className="font-bold text-xs text-slate-900">Unified Order Inbox</h4>
              <p className="text-[11px] text-slate-500 mt-1">Aggregates orders across marketplaces, food apps, and social DMs in real time.</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-2">2</div>
              <h4 className="font-bold text-xs text-slate-900">Central Inventory</h4>
              <p className="text-[11px] text-slate-500 mt-1">Shared buffer allocation with automatic stock decrement to prevent overselling.</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-2">3</div>
              <h4 className="font-bold text-xs text-slate-900">Payment Verification</h4>
              <p className="text-[11px] text-slate-500 mt-1">UPI slip verification alerts and marketplace payout deduction tracking.</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm mb-2">4</div>
              <h4 className="font-bold text-xs text-slate-900">Fulfilment Hub</h4>
              <p className="text-[11px] text-slate-500 mt-1">One-click shipping label printing, courier tracking links, and KOT handover codes.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'value_prop',
      badge: '03 / Quantified Value',
      title: 'Value Proposition & Efficiency Gains',
      subtitle: 'Transforming tedious multi-channel administration into automated workflows',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-3xl font-extrabold text-emerald-700">2–3 Hrs</span>
              <p className="text-xs font-semibold text-emerald-900 mt-1">Daily Administrative Time Saved</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">Eliminates repetitive manual transcribing between messaging apps and spreadsheets.</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
              <span className="text-3xl font-extrabold text-blue-700">100%</span>
              <p className="text-xs font-semibold text-blue-900 mt-1">Stockout Conflicts Prevented</p>
              <p className="text-[11px] text-blue-700 mt-0.5">Synchronized stock buffers protect seller performance metrics on Amazon & Meesho.</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
              <span className="text-3xl font-extrabold text-purple-700">&lt; 5 Min</span>
              <p className="text-xs font-semibold text-purple-900 mt-1">Daily Dispatch & Labelling Run</p>
              <p className="text-[11px] text-purple-700 mt-0.5">Bulk label generation and automated WhatsApp customer tracking links.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-1">Core Entrepreneurial Insight:</strong> Micro-sellers do not need heavy enterprise ERPs like SAP or NetSuite.
            They need a lightweight, low-friction mobile/web operational bridge tailored specifically to India's UPI, WhatsApp, and domestic courier ecosystem.
          </div>
        </div>
      ),
    },
    {
      id: 'bmc',
      badge: '04 / Business Model Canvas',
      title: 'Nine-Block Business Model Canvas Summary',
      subtitle: 'Proposed Osterwalder commercial model',
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
            <strong className="text-blue-900 block font-bold text-[11px] uppercase">1. Customer Segments</strong>
            <p className="text-slate-600 mt-1 text-[11px]">Boutiques, resellers, home makers, and cloud kitchens.</p>
          </div>
          <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
            <strong className="text-indigo-900 block font-bold text-[11px] uppercase">2. Value Proposition</strong>
            <p className="text-slate-600 mt-1 text-[11px]">Central order inbox, live inventory sync, and instant label generation.</p>
          </div>
          <div className="p-3 bg-cyan-50/60 rounded-lg border border-cyan-200">
            <strong className="text-cyan-900 block font-bold text-[11px] uppercase">3. Channels</strong>
            <p className="text-slate-600 mt-1 text-[11px]">Product website, seller community referrals, YouTube tutorials.</p>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
            <strong className="text-emerald-900 block font-bold text-[11px] uppercase">4. Customer Relationships</strong>
            <p className="text-slate-600 mt-1 text-[11px]">Self-serve onboarding, WhatsApp support hotline, video guides.</p>
          </div>
          <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200">
            <strong className="text-teal-900 block font-bold text-[11px] uppercase">5. Revenue Streams</strong>
            <p className="text-slate-600 mt-1 text-[11px]">Free tier, ₹299/mo Starter tier, ₹799/mo Growth tier subscriptions.</p>
          </div>
          <div className="p-3 bg-violet-50/60 rounded-lg border border-violet-200">
            <strong className="text-violet-900 block font-bold text-[11px] uppercase">6. Key Resources</strong>
            <p className="text-slate-600 mt-1 text-[11px]">Multi-channel data engine, connector architecture, cloud infra.</p>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
            <strong className="text-amber-900 block font-bold text-[11px] uppercase">7. Key Activities</strong>
            <p className="text-slate-600 mt-1 text-[11px]">Connector maintenance, security encryption, customer validation.</p>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
            <strong className="text-rose-900 block font-bold text-[11px] uppercase">8. Key Partnerships</strong>
            <p className="text-slate-600 mt-1 text-[11px]">Courier aggregators (Shiprocket), payment gateways, platform APIs.</p>
          </div>
          <div className="p-3 bg-red-50/60 rounded-lg border border-red-200 col-span-2 md:col-span-1">
            <strong className="text-red-900 block font-bold text-[11px] uppercase">9. Cost Structure</strong>
            <p className="text-slate-600 mt-1 text-[11px]">Server hosting, API quota fees, customer support, and CAC.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'pricing_economics',
      badge: '05 / Monetization & Economics',
      title: 'Pricing Hypotheses & Unit Economics',
      subtitle: 'Affordable SaaS tiers with strong positive contribution margins',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 text-sm">FREE TIER (₹0/mo)</span>
              <p className="text-slate-500 mt-1">Manual order entry, single inventory table, community support. Designed for low-friction acquisition.</p>
            </div>
            <div className="p-4 bg-brand-50 rounded-xl border-2 border-brand-500">
              <span className="font-bold text-brand-900 text-sm">STARTER TIER (₹299/mo)</span>
              <p className="text-brand-800 mt-1">Multi-channel inbox, stock sync, payment checks, shipping labels. Core revenue driver.</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 text-sm">GROWTH TIER (₹799/mo)</span>
              <p className="text-slate-500 mt-1">Automation rules, analytics, kitchen display mode, priority support. Higher margin scale.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2">
            <div className="font-bold text-sm text-brand-300">Illustrative Break-Even Hypothesis:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Blended ARPU</span>
                <strong className="text-white text-base">₹499 /mo</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Variable Cost</span>
                <strong className="text-white text-base">₹99 /seller</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Unit Contribution</span>
                <strong className="text-emerald-400 text-base">₹400 (80%)</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Break-Even Point</span>
                <strong className="text-brand-400 text-base">50 Paying Sellers</strong>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              *Fixed monthly overhead assumed at ₹20,000 (hosting, database, domain, support tooling).
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'challenges',
      badge: '06 / Risk & Feasibility',
      title: 'Key Operational & Technical Challenges',
      subtitle: 'Critical hurdles and mitigation strategies for real-world launch',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-rose-700">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              1. Platform API Access
            </h4>
            <p className="text-slate-600 leading-relaxed mt-1">
              <strong>Risk:</strong> Marketplaces (Amazon SP-API, Flipkart) have strict partner approval criteria and developer audits.
            </p>
            <p className="text-slate-500 mt-2 text-[11px]">
              <strong>Mitigation:</strong> Launch initial MVP with email order parsing and WhatsApp bot connectors while pursuing official API developer credentials.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-amber-700">
              <Clock className="w-4 h-4 text-amber-500" />
              2. Micro-Seller Churn
            </h4>
            <p className="text-slate-600 leading-relaxed mt-1">
              <strong>Risk:</strong> Micro-sellers often have fluctuating business longevity and high price sensitivity.
            </p>
            <p className="text-slate-500 mt-2 text-[11px]">
              <strong>Mitigation:</strong> Deliver instant value in the first 5 minutes via the free tier; demonstrate tangible time savings before charging ₹299.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-indigo-700">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              3. Data Privacy & Trust
            </h4>
            <p className="text-slate-600 leading-relaxed mt-1">
              <strong>Risk:</strong> Sellers may hesitate to grant third-party tools access to revenue and customer phone records.
            </p>
            <p className="text-slate-500 mt-2 text-[11px]">
              <strong>Mitigation:</strong> Client-side token encryption, transparent read-only permissions, and local sandboxed compliance.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'roadmap',
      badge: '07 / Execution Roadmap',
      title: 'Customer Validation & Phased Roadmap',
      subtitle: 'Structured progression from academic prototype to live pilot',
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-brand-50 rounded-xl border border-brand-200">
              <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">Phase 1: Current</span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">Interactive Sandbox Prototype</h4>
              <ul className="mt-2 space-y-1 text-slate-600 text-[11px]">
                <li>• Full-stack FastAPI + React architecture</li>
                <li>• 9 simulated operational workflows</li>
                <li>• Customer validation interview tool</li>
                <li>• Break-even financial modeling</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phase 2: Next 90 Days</span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">Closed Seller Alpha (10 Sellers)</h4>
              <ul className="mt-2 space-y-1 text-slate-600 text-[11px]">
                <li>• Live WhatsApp Cloud API connector</li>
                <li>• Shiprocket courier shipping integration</li>
                <li>• Direct UPI QR payment reconciliation</li>
                <li>• Weekly qualitative usability testing</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phase 3: 6–12 Months</span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">Commercial Launch</h4>
              <ul className="mt-2 space-y-1 text-slate-600 text-[11px]">
                <li>• Certified Amazon & Flipkart connectors</li>
                <li>• Swiggy / Zomato kitchen terminal support</li>
                <li>• Self-serve subscription billing (Razorpay)</li>
                <li>• Target: 100 paying sellers (Break-even)</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center justify-between">
            <span className="font-semibold">MDMIE01 Conclusion: SellSync bridges a verified operational gap with viable unit economics.</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Ready for Faculty Pitch</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Slide Controls */}
      <div className="bg-white p-6 rounded-2xl border border-warm-200 shadow-card ambient-glow flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded">
              MDMIE01 Executive Briefing
            </span>
            <span className="text-xs text-ink-muted">7-Slide Pitch Deck</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
            SellSync Startup Pitch & Feasibility Deck
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Structured slide sequence formatted for classroom review and investor readiness evaluation
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-ink-primary bg-warm-100 hover:bg-warm-200 rounded-xl border border-warm-200 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-ink-secondary" />
            <span>Print Pitch Slides</span>
          </button>

          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-subtle ${
              presentationMode
                ? 'bg-purple-600 text-white'
                : 'bg-brand-500 text-white hover:bg-brand-600'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>{presentationMode ? 'Exit Slide View' : 'Single Slide View'}</span>
          </button>
        </div>
      </div>

      {/* SINGLE SLIDE PRESENTATION MODE */}
      {presentationMode ? (
        <div className="bg-white rounded-2xl border border-warm-200 p-8 shadow-card space-y-6 min-h-[500px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-warm-100 mb-6">
              <div>
                <span className="text-[11px] font-semibold text-brand-500 uppercase tracking-wider block">
                  {slides[activeSlide].badge}
                </span>
                <h2 className="text-2xl font-bold text-ink-primary mt-1">
                  {slides[activeSlide].title}
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  {slides[activeSlide].subtitle}
                </p>
              </div>

              <span className="text-sm font-semibold text-ink-muted tabular-nums">
                {activeSlide + 1} / {slides.length}
              </span>
            </div>

            {/* Slide Body */}
            <div>{slides[activeSlide].content}</div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-warm-100">
            <button
              disabled={activeSlide === 0}
              onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-ink-primary bg-warm-100 hover:bg-warm-200 rounded-xl disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-ink-secondary" />
              <span>Previous Slide</span>
            </button>

            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeSlide ? 'bg-brand-500 w-6' : 'bg-warm-200 hover:bg-warm-300 w-2'
                  }`}
                />
              ))}
            </div>

            <button
              disabled={activeSlide === slides.length - 1}
              onClick={() => setActiveSlide((prev) => Math.min(slides.length - 1, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl disabled:opacity-40 shadow-subtle transition-colors"
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* SCROLLABLE EXECUTIVE DECK VIEW */
        <div className="space-y-6">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="bg-white rounded-2xl border border-warm-200 p-6 shadow-card hover:shadow-float transition-all"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-warm-100 mb-5">
                <div>
                  <span className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider block">
                    {slide.badge}
                  </span>
                  <h3 className="text-base font-semibold text-ink-primary mt-0.5">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-ink-secondary">{slide.subtitle}</p>
                </div>
                <span className="text-xs font-bold text-ink-muted tabular-nums">#{idx + 1}</span>
              </div>

              <div>{slide.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
