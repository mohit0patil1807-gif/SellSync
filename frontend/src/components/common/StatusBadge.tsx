import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  AlertTriangle, 
  XCircle, 
  RotateCcw, 
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { OrderStatus, PaymentStatus, FulfilmentStatus, ChannelStatus } from '../../types';

interface BadgeProps {
  status: OrderStatus | PaymentStatus | FulfilmentStatus | ChannelStatus | string;
  type?: 'order' | 'payment' | 'fulfilment' | 'channel';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, type = 'order', size = 'sm' }) => {
  const s = (status || '').toUpperCase();

  let bg = 'bg-warm-100 text-ink-secondary border-warm-200';
  let Icon = HelpCircle;
  let label = s.replace(/_/g, ' ');

  if (type === 'order') {
    switch (s) {
      case 'NEW':
        bg = 'bg-blue-50 text-blue-800 border-blue-200';
        Icon = Clock;
        label = 'New';
        break;
      case 'AWAITING_PAYMENT':
        bg = 'bg-amber-50 text-amber-800 border-amber-200';
        Icon = CreditCard;
        label = 'Awaiting Payment';
        break;
      case 'CONFIRMED':
        bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        Icon = CheckCircle2;
        label = 'Confirmed';
        break;
      case 'PROCESSING':
        bg = 'bg-purple-50 text-purple-800 border-purple-200';
        Icon = Package;
        label = 'Processing';
        break;
      case 'READY_TO_DISPATCH':
        bg = 'bg-purple-50 text-purple-800 border-purple-200';
        Icon = Package;
        label = 'Ready to Dispatch';
        break;
      case 'DISPATCHED':
        bg = 'bg-sky-50 text-sky-800 border-sky-200';
        Icon = Truck;
        label = 'Dispatched';
        break;
      case 'DELIVERED':
        bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        Icon = CheckCircle2;
        label = 'Delivered';
        break;
      case 'CANCELLED':
        bg = 'bg-rose-50 text-rose-800 border-rose-200';
        Icon = XCircle;
        label = 'Cancelled';
        break;
      case 'RETURNED':
        bg = 'bg-orange-50 text-orange-800 border-orange-200';
        Icon = RotateCcw;
        label = 'Returned';
        break;
      case 'REFUNDED':
        bg = 'bg-warm-100 text-ink-secondary border-warm-200';
        Icon = RotateCcw;
        label = 'Refunded';
        break;
      case 'EXCEPTION':
        bg = 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';
        Icon = AlertTriangle;
        label = 'Needs Attention';
        break;
    }
  } else if (type === 'payment') {
    switch (s) {
      case 'VERIFIED':
        bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        Icon = CheckCircle2;
        label = 'Verified';
        break;
      case 'PENDING':
        bg = 'bg-amber-50 text-amber-800 border-amber-200';
        Icon = Clock;
        label = 'Pending';
        break;
      case 'MISMATCH':
        bg = 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';
        Icon = AlertTriangle;
        label = 'Mismatch';
        break;
      case 'FAILED':
        bg = 'bg-rose-50 text-rose-800 border-rose-200';
        Icon = XCircle;
        label = 'Failed';
        break;
      case 'REFUNDED':
        bg = 'bg-warm-100 text-ink-secondary border-warm-200';
        Icon = RotateCcw;
        label = 'Refunded';
        break;
    }
  } else if (type === 'fulfilment') {
    switch (s) {
      case 'UNFULFILLED':
        bg = 'bg-warm-100 text-ink-secondary border-warm-200';
        Icon = Clock;
        label = 'Unfulfilled';
        break;
      case 'PACKED':
        bg = 'bg-purple-50 text-purple-800 border-purple-200';
        Icon = Package;
        label = 'Packed';
        break;
      case 'SHIPPED':
        bg = 'bg-sky-50 text-sky-800 border-sky-200';
        Icon = Truck;
        label = 'In Transit';
        break;
      case 'DELIVERED':
        bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        Icon = CheckCircle2;
        label = 'Delivered';
        break;
      case 'CANCELLED':
        bg = 'bg-rose-50 text-rose-800 border-rose-200';
        Icon = XCircle;
        label = 'Cancelled';
        break;
    }
  } else if (type === 'channel') {
    switch (s) {
      case 'CONNECTED':
        bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        Icon = CheckCircle2;
        label = 'Connected';
        break;
      case 'DEMO_MODE':
        bg = 'bg-warm-100 text-ink-secondary border-warm-200 font-medium';
        Icon = Clock;
        label = 'DEMO MODE';
        break;
      case 'NOT_CONNECTED':
        bg = 'bg-warm-100 text-ink-muted border-warm-200';
        Icon = HelpCircle;
        label = 'Not Connected';
        break;
      case 'SYNC_ISSUE':
        bg = 'bg-rose-50 text-rose-800 border-rose-200';
        Icon = AlertTriangle;
        label = 'Sync Issue';
        break;
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${bg} ${sizeClasses} font-medium tracking-tight whitespace-nowrap transition-colors`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
    </span>
  );
};
