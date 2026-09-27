import React, { useState } from 'react';
import { LongitudinalDecisionRecord } from '../../types/memory';
import { OutcomeEntryInput } from '../../services/outcomeService';
import { 
  Receipt, 
  ShieldCheck 
} from 'lucide-react';

interface ReportOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: LongitudinalDecisionRecord;
  onSubmitOutcome: (input: OutcomeEntryInput) => void;
}

export const ReportOutcomeModal: React.FC<ReportOutcomeModalProps> = ({
  isOpen,
  onClose,
  decision,
  onSubmitOutcome,
}) => {
  const [salePrice, setSalePrice] = useState<number>(decision.marketSnapshot.grossPricePerQuintal || 2380);
  const [quantity, setQuantity] = useState<number>(32);
  const [mandi, setMandi] = useState<string>(decision.marketSnapshot.mandi || 'Unnao Mandi');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transportCost, setTransportCost] = useState<number>(1340);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [farmerNotes, setFarmerNotes] = useState<string>('');

  if (!isOpen) return null;

  // Real-time deterministic calculations
  const grossInr = Math.round(salePrice * quantity);
  const netInr = Math.round(grossInr - transportCost - otherDeductions);

  const { p10, p50, p90 } = decision.forecast;

  let classification: 'ABOVE_P90' | 'WITHIN_RANGE' | 'NEAR_P50' | 'BELOW_P10' = 'WITHIN_RANGE';
  if (netInr > p90) classification = 'ABOVE_P90';
  else if (netInr < p10) classification = 'BELOW_P10';
  else if (Math.abs(netInr - p50) <= (p90 - p10) * 0.15) classification = 'NEAR_P50';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOutcome({
      decisionId: decision.id,
      salePricePerQuintal: salePrice,
      quantityQuintals: quantity,
      mandi,
      saleDate,
      transportCost,
      otherDeductions,
      farmerNotes: farmerNotes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FCFAF6] border border-[#E3DCB8] rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-[#FAF6EB] to-[#FCFAF6] border-b border-[#E8E1C5] flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-900 text-emerald-100 flex items-center justify-center shadow-sm">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="tech-label text-[10px] text-emerald-900 font-bold block">
                DECISION OUTCOME VERIFICATION
              </span>
              <h3 className="text-lg font-bold text-zinc-900 font-sans">
                Report Actual Harvest Realization
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-200/60 hover:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {/* Decision Context Header */}
          <div className="p-3 rounded-xl bg-zinc-100/80 border border-zinc-200 text-xs font-mono flex items-center justify-between">
            <div>
              <span className="text-zinc-500 block text-[10px]">RECORDED DECISION</span>
              <strong className="text-zinc-900">{decision.title}</strong>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block text-[10px]">FORECAST P50</span>
              <strong className="text-emerald-950 font-bold">₹{decision.expectedNetRealization.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Sale Price */}
            <div className="space-y-1">
              <label className="font-medium text-zinc-700 block">Actual Sale Price (₹/qtl)</label>
              <input
                type="number"
                min="1000"
                max="5000"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 font-mono font-bold text-zinc-900 focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="font-medium text-zinc-700 block">Quantity Sold (Quintals)</label>
              <input
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 font-mono font-bold text-zinc-900 focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            {/* Mandi */}
            <div className="space-y-1">
              <label className="font-medium text-zinc-700 block">Destination Mandi / Yard</label>
              <input
                type="text"
                value={mandi}
                onChange={(e) => setMandi(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 font-medium text-zinc-900 focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            {/* Sale Date */}
            <div className="space-y-1">
              <label className="font-medium text-zinc-700 block">Sale / Settlement Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 font-mono text-zinc-900 focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            {/* Transport Cost */}
            <div className="space-y-1">
              <label className="font-medium text-zinc-700 block">Transport / Freight (₹)</label>
              <input
                type="number"
                min="0"
                max="20000"
                value={transportCost}
                onChange={(e) => setTransportCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 font-mono text-zinc-900 focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            {/* Other Deductions */}
            <div className="space-y-1">
              <label className="font-medium text-zinc-700 block">Other Deductions / Tolls (₹)</label>
              <input
                type="number"
                min="0"
                max="10000"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 font-mono text-zinc-900 focus:outline-hidden focus:border-emerald-700"
              />
            </div>
          </div>

          {/* Farmer Notes */}
          <div className="space-y-1">
            <label className="font-medium text-xs text-zinc-700 block">Field Observations / Quality Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Excellent grain lustre, no moisture discount applied at weighbridge"
              value={farmerNotes}
              onChange={(e) => setFarmerNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-800 focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          {/* Real-time Math Summary & Classification Card */}
          <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-emerald-300">
              <span>Gross Realization ({quantity} qtl × ₹{salePrice}):</span>
              <span>₹{grossInr.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-rose-300">
              <span>Less Transport & Deductions:</span>
              <span>-₹{(transportCost + otherDeductions).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1 border-t border-white/20">
              <span>Actual Net Realization:</span>
              <span className="text-base text-emerald-200">₹{netInr.toLocaleString('en-IN')}</span>
            </div>

            {/* Classification Badge */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-zinc-300">Range Classification:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${
                classification === 'NEAR_P50' || classification === 'WITHIN_RANGE'
                  ? 'bg-emerald-800 text-emerald-100'
                  : classification === 'ABOVE_P90'
                  ? 'bg-amber-800 text-amber-100'
                  : 'bg-rose-900 text-rose-100'
              }`}>
                {classification.replace('_', ' ')} (P10 ₹{p10.toLocaleString('en-IN')} – P90 ₹{p90.toLocaleString('en-IN')})
              </span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-xs font-mono text-zinc-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>CONFIRM & RECORD OUTCOME</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
