import React from 'react';

interface ChannelBadgeProps {
  code: string;
  name?: string;
  showCategory?: boolean;
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({ code, name, showCategory = false }) => {
  const c = (code || '').toLowerCase();

  let label = name || code;
  let dotColor = 'bg-ink-muted';
  let categoryLabel = 'Marketplace';

  switch (c) {
    case 'amazon':
      label = name || 'Amazon India';
      dotColor = 'bg-[#FF9900]';
      categoryLabel = 'Marketplace';
      break;
    case 'flipkart':
      label = name || 'Flipkart';
      dotColor = 'bg-[#2874F0]';
      categoryLabel = 'Marketplace';
      break;
    case 'meesho':
      label = name || 'Meesho';
      dotColor = 'bg-[#E03B7C]';
      categoryLabel = 'Marketplace';
      break;
    case 'myntra':
      label = name || 'Myntra';
      dotColor = 'bg-[#F13AB1]';
      categoryLabel = 'Fashion';
      break;
    case 'swiggy':
      label = name || 'Swiggy';
      dotColor = 'bg-[#FC8019]';
      categoryLabel = 'Food';
      break;
    case 'zomato':
      label = name || 'Zomato';
      dotColor = 'bg-[#CB202D]';
      categoryLabel = 'Food';
      break;
    case 'instagram':
      label = name || 'Instagram DM';
      dotColor = 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600';
      categoryLabel = 'Social';
      break;
    case 'whatsapp':
      label = name || 'WhatsApp Business';
      dotColor = 'bg-[#25D366]';
      categoryLabel = 'Social';
      break;
    case 'direct':
      label = name || 'Direct Store';
      dotColor = 'bg-purple-600';
      categoryLabel = 'Web';
      break;
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-warm-200 bg-white text-ink-primary text-[11px] font-medium shadow-subtle">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
        <span className="truncate">{label}</span>
      </span>
      {showCategory && (
        <span className="text-[10px] text-ink-muted uppercase tracking-wider font-mono">
          {categoryLabel}
        </span>
      )}
    </div>
  );
};
