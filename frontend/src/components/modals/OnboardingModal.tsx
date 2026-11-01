import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Store,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shirt,
  Cake,
  Palette,
  Repeat,
  Gift
} from 'lucide-react';
import { useI18n } from '../../i18n';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    sellerType: string;
    personaId: string;
    channels: string[];
    shippingMode: string;
  }) => void;
}

const SELLER_TYPES = [
  {
    id: 'clothing',
    title: 'Clothing & fashion',
    icon: Shirt,
    desc: 'Kurtas, sarees, streetwear, and dresses',
    persona: 'boutique',
    channels: ['instagram', 'whatsapp', 'meesho', 'direct']
  },
  {
    id: 'food_bakery',
    title: 'Food & bakery',
    icon: Cake,
    desc: 'Artisan sourdough, cakes, and treats',
    persona: 'baker',
    channels: ['whatsapp', 'instagram', 'swiggy', 'zomato', 'direct']
  },
  {
    id: 'handmade',
    title: 'Handmade & crafts',
    icon: Palette,
    desc: 'Ceramics, candles, and home decor',
    persona: 'handmade',
    channels: ['instagram', 'whatsapp', 'amazon', 'direct']
  },
  {
    id: 'reselling',
    title: 'Reselling & gadgets',
    icon: Repeat,
    desc: 'Trending accessories and consumer goods',
    persona: 'reseller',
    channels: ['whatsapp', 'meesho', 'amazon', 'direct']
  }
];

const ALL_CHANNELS = [
  { id: 'instagram', name: 'Instagram DM', badge: 'DEMO MODE', foodOnly: false, fashionOnly: false },
  { id: 'whatsapp', name: 'WhatsApp Chat', badge: 'DEMO MODE', foodOnly: false, fashionOnly: false },
  { id: 'direct', name: 'Direct / Phone / Walk-in', badge: 'LOCAL FEATURE', foodOnly: false, fashionOnly: false },
  { id: 'meesho', name: 'Meesho', badge: 'DEMO MODE', foodOnly: false, fashionOnly: false },
  { id: 'amazon', name: 'Amazon India', badge: 'DEMO MODE', foodOnly: false, fashionOnly: false },
  { id: 'flipkart', name: 'Flipkart', badge: 'DEMO MODE', foodOnly: false, fashionOnly: false },
  { id: 'myntra', name: 'Myntra', badge: 'DEMO MODE', foodOnly: false, fashionOnly: true },
  { id: 'swiggy', name: 'Swiggy', badge: 'DEMO MODE', foodOnly: true, fashionOnly: false },
  { id: 'zomato', name: 'Zomato', badge: 'DEMO MODE', foodOnly: true, fashionOnly: false },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('clothing');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'instagram',
    'whatsapp',
    'direct',
    'meesho'
  ]);
  const [shippingMode, setShippingMode] = useState('courier');

  if (!isOpen) return null;

  const currentTypeObj = SELLER_TYPES.find((st) => st.id === selectedType) || SELLER_TYPES[0];

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    const found = SELLER_TYPES.find((st) => st.id === typeId);
    if (found) {
      setSelectedChannels(found.channels);
      if (typeId === 'food_bakery') {
        setShippingMode('both');
      } else {
        setShippingMode('courier');
      }
    }
  };

  const toggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== channelId));
      }
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const handleFinish = () => {
    onComplete({
      sellerType: selectedType,
      personaId: currentTypeObj.persona,
      channels: selectedChannels,
      shippingMode,
    });
    onClose();
  };

  // Filter channels based on seller type
  const isFood = selectedType === 'food_bakery';
  const isFashion = selectedType === 'clothing';
  const availableChannels = ALL_CHANNELS.filter((ch) => {
    if (ch.foodOnly) return isFood;
    if (ch.fashionOnly) return isFashion;
    if (isFood && ['meesho', 'amazon', 'flipkart'].includes(ch.id)) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-warm-200 shadow-float overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-warm-200 flex items-center justify-between bg-warm-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary">
                Welcome to SellSync
              </h2>
              <p className="text-xs text-ink-secondary">
                Step {step} of 3 • Tailor your operational workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink-primary rounded-xl hover:bg-warm-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Steps */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: What do you sell? */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-ink-primary">
                  1. What kind of micro-business do you run?
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  We'll customize your inventory items, pricing terms, and channel options.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SELLER_TYPES.map((st) => {
                  const Icon = st.icon;
                  const isSelected = selectedType === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleSelectType(st.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                          : 'border-warm-200 hover:border-warm-300 hover:bg-warm-50/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-brand-500 text-white' : 'bg-warm-100 text-ink-secondary'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
                        </div>
                        <h4 className="text-xs font-bold text-ink-primary">{st.title}</h4>
                        <p className="text-[11px] text-ink-secondary mt-1 leading-relaxed">{st.desc}</p>
                      </div>
                      <div className="mt-3 text-[10px] font-semibold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded-full inline-block self-start">
                        Matches {st.persona} persona
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Channels */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-ink-primary">
                  2. Where do you get orders?
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Select your primary sales channels. Connectors are in simulated demo mode.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableChannels.map((ch) => {
                  const isChecked = selectedChannels.includes(ch.id);
                  return (
                    <label
                      key={ch.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-brand-500 bg-brand-50/40 text-ink-primary'
                          : 'border-warm-200 text-ink-secondary hover:bg-warm-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChannel(ch.id)}
                          className="w-4 h-4 rounded border-warm-300 text-brand-500 focus:ring-brand-500/20"
                        />
                        <span className="text-xs font-semibold">{ch.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        ch.id === 'direct'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-warm-100 text-ink-muted'
                      }`}>
                        {ch.badge}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Shipping */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-ink-primary">
                  3. How do you deliver your orders?
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  This sets up your default packing and handover dispatch workflow.
                </p>
              </div>

              <div className="space-y-2.5">
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    shippingMode === 'courier'
                      ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-warm-200 hover:bg-warm-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMode"
                    value="courier"
                    checked={shippingMode === 'courier'}
                    onChange={() => setShippingMode('courier')}
                    className="mt-1 text-brand-500 focus:ring-brand-500/20"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-ink-primary">
                      Courier parcel services (Shiprocket, India Post, Delhivery)
                    </h4>
                    <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
                      Generates packing slips, copies addresses formatted for courier labels, and tracks AWB numbers.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    shippingMode === 'both'
                      ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-warm-200 hover:bg-warm-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMode"
                    value="both"
                    checked={shippingMode === 'both'}
                    onChange={() => setShippingMode('both')}
                    className="mt-1 text-brand-500 focus:ring-brand-500/20"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-ink-primary">
                      Local rider handover & self-delivery (Dunzo, Porter, Swiggy/Zomato riders)
                    </h4>
                    <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
                      Instant rider handover slips, dispatch alerts via WhatsApp, and immediate local confirmation.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-warm-200 flex items-center justify-between bg-warm-50/50">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:text-ink-primary bg-white border border-warm-200 rounded-xl hover:bg-warm-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-subtle shadow-brand-500/20 transition-all active:scale-[0.98]"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-subtle shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Setup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
