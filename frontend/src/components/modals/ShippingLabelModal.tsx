import React from 'react';
import { Modal } from '../common/Modal';
import { Printer, Download, CheckCircle, Package } from 'lucide-react';

interface ShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  labelData: any;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  isOpen,
  onClose,
  labelData,
}) => {
  if (!labelData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sample Shipping Label"
      subtitle="Generated carrier-compliant dispatch document (Demo Mode)"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Printable Label Container */}
        <div
          id="printable-shipping-label"
          className="border-2 border-ink-primary bg-white p-5 rounded-xl text-ink-primary font-sans shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-ink-primary pb-3">
            <div>
              <div className="text-xl font-black tracking-wider uppercase">
                {labelData.shipment_details?.courier || 'Delhivery Express'}
              </div>
              <div className="text-[10px] text-ink-muted font-mono tracking-widest uppercase">
                Air Priority Logistics · Standard Surface
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-ink-primary text-white font-black text-xs uppercase rounded">
                {labelData.shipment_details?.payment_mode || 'PREPAID'}
              </span>
            </div>
          </div>

          {/* Barcode Simulator */}
          <div className="py-4 text-center border-b-2 border-ink-primary">
            <div className="h-14 bg-ink-primary mx-auto w-4/5 flex items-center justify-around px-2 rounded-xs">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full ${
                    i % 3 === 0 ? 'w-1 bg-white' : i % 5 === 0 ? 'w-2 bg-white' : 'w-0.5 bg-white'
                  }`}
                />
              ))}
            </div>
            <div className="font-mono text-sm font-bold tracking-widest mt-1.5 tabular-nums">
              {labelData.shipment_details?.tracking_number}
            </div>
          </div>

          {/* Routing & Order Info */}
          <div className="grid grid-cols-2 border-b-2 border-ink-primary text-xs">
            <div className="p-2.5 border-r-2 border-ink-primary">
              <span className="text-[10px] text-ink-muted uppercase font-bold block">SellSync Order ID</span>
              <span className="font-bold text-sm font-mono tabular-nums">{labelData.order_number}</span>
            </div>
            <div className="p-2.5">
              <span className="text-[10px] text-ink-muted uppercase font-bold block">Channel Ref</span>
              <span className="font-bold text-sm truncate block font-mono">{labelData.external_order_id}</span>
            </div>
          </div>

          {/* Ship To Address */}
          <div className="p-3 border-b-2 border-ink-primary">
            <span className="text-[10px] font-bold uppercase text-ink-muted block mb-1">
              Deliver To (Recipient)
            </span>
            <div className="text-sm font-bold text-ink-primary">{labelData.recipient?.name}</div>
            <div className="text-xs text-ink-secondary leading-snug mt-0.5">
              {labelData.recipient?.address}
            </div>
            <div className="text-xs font-bold text-ink-primary mt-1">
              {labelData.recipient?.city} — <span className="font-mono tabular-nums">{labelData.recipient?.pincode}</span>
            </div>
            <div className="text-xs text-ink-secondary mt-0.5 font-mono">
              Tel: {labelData.recipient?.phone}
            </div>
          </div>

          {/* Return Address & Package Manifest */}
          <div className="grid grid-cols-2 text-xs">
            <div className="p-2.5 border-r-2 border-ink-primary">
              <span className="text-[9px] uppercase font-bold text-ink-muted block mb-0.5">
                Shipped From (Return Address)
              </span>
              <div className="font-semibold text-ink-primary">{labelData.sender?.name}</div>
              <div className="text-[11px] text-ink-secondary">{labelData.sender?.city} - <span className="font-mono tabular-nums">{labelData.sender?.pincode}</span></div>
            </div>
            <div className="p-2.5">
              <span className="text-[9px] uppercase font-bold text-ink-muted block mb-0.5">
                Manifest Details
              </span>
              <div className="text-[11px] text-ink-secondary">Weight: <strong className="font-mono tabular-nums text-ink-primary">{labelData.shipment_details?.weight_kg} kg</strong></div>
              <div className="text-[11px] text-ink-secondary">Items: <strong className="font-mono tabular-nums text-ink-primary">{labelData.shipment_details?.items_count} pcs</strong></div>
              {labelData.shipment_details?.handover_otp && (
                <div className="text-[11px] text-amber-700 font-bold mt-1 font-mono tabular-nums">
                  Handover OTP: {labelData.shipment_details.handover_otp}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-ink-muted">
            Formatted for standard 4x6" thermal adhesive label printers
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-secondary bg-warm-100 hover:bg-warm-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Label</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
