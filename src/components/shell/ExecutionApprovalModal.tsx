import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  CloudRain, 
  Layers
} from 'lucide-react';
import { ExecutionFeasibilityReport } from '../../types/execution';

interface ExecutionApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  feasibility: ExecutionFeasibilityReport;
  onConfirmPlan: () => void;
}

export const ExecutionApprovalModal: React.FC<ExecutionApprovalModalProps> = ({
  isOpen,
  onClose,
  feasibility,
  onConfirmPlan,
}) => {
  const [confirmCrop, setConfirmCrop] = useState(true);
  const [confirmTransport, setConfirmTransport] = useState(false);
  const [confirmDestination, setConfirmDestination] = useState(true);

  if (!isOpen) return null;

  const allConfirmed = confirmCrop && confirmTransport && confirmDestination;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#FCFAF6] border border-[#E3DCB8] rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 space-y-0">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-[#FAF6EB] to-[#FCFAF6] border-b border-[#E8E1C5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              Human-In-The-Loop Execution Verification
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 font-sans tracking-tight">
            Decision Approved — Verify Execution
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed font-sans">
            A mathematical recommendation is not an operational execution. Please review the 3 physical readiness checkpoints before field mobilization begins.
          </p>
        </div>

        {/* Feasibility Summary Banner */}
        <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 living-pulse" />
            <span className="font-bold text-emerald-950">FEASIBILITY: {feasibility.overallStatus.replace('_', ' ')}</span>
          </div>
          <span className="text-emerald-800 font-bold">
            Readiness Index: {feasibility.actionReadinessScore}%
          </span>
        </div>

        {/* 3 Confirmation Checkpoints */}
        <div className="p-6 space-y-3.5">
          
          {/* Checkpoint 1: Crop & Field Window */}
          <div 
            onClick={() => setConfirmCrop(!confirmCrop)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              confirmCrop ? 'bg-white border-emerald-400/80 shadow-xs' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <input 
              type="checkbox" 
              checked={confirmCrop}
              onChange={() => {}} 
              className="mt-1 w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <CloudRain className="w-3.5 h-3.5 text-emerald-700" />
                <span>1. Crop Maturity & Weather Window Reviewed</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Wheat HD-2967 is at 94.6% GDD maturity. Estimated 36h clear window before Saturday convective front.
              </p>
            </div>
          </div>

          {/* Checkpoint 2: Transport Vehicle (Crucial Unknown Callout) */}
          <div 
            onClick={() => setConfirmTransport(!confirmTransport)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              confirmTransport ? 'bg-white border-emerald-400/80 shadow-xs' : 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
            }`}
          >
            <input 
              type="checkbox" 
              checked={confirmTransport}
              onChange={() => {}} 
              className="mt-1 w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Truck className="w-3.5 h-3.5 text-amber-700" />
                <span>2. Transport Vehicle Availability Confirmed</span>
                {!confirmTransport && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 font-mono text-[9px] font-bold">
                    ACTION REQUIRED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                <span className="font-semibold text-zinc-800">Transport availability is not digitally verified.</span> KISAN COMPASS has an estimated freight rate (₹1,340) but no connected booking API. Confirm you have reserved a 35-quintal trolley/driver.
              </p>
            </div>
          </div>

          {/* Checkpoint 3: Destination & Mandi Window */}
          <div 
            onClick={() => setConfirmDestination(!confirmDestination)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              confirmDestination ? 'bg-white border-emerald-400/80 shadow-xs' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <input 
              type="checkbox" 
              checked={confirmDestination}
              onChange={() => {}} 
              className="mt-1 w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Mandi Destination & Expected Net Agreed</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Targeting Unnao APMC (28 km) at ₹2,380/qtl spot price for an estimated net realization of ₹74,820.
              </p>
            </div>
          </div>

        </div>

        {/* Non-Autonomous Notice */}
        <div className="px-6 py-3 bg-amber-50/70 border-t border-b border-amber-200/80 flex items-center gap-2 text-[11px] text-amber-900 font-sans">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Zero Auto-Execution Guarantee:</strong> KISAN COMPASS never automatically books trucks, sells grain, or alters plans without your explicit instruction.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#FAF6EB] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 font-mono text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirmPlan();
              onClose();
            }}
            disabled={!allConfirmed}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center gap-2 shadow-md transition-all ${
              allConfirmed
                ? 'bg-emerald-900 hover:bg-emerald-950 text-white shadow-emerald-900/20'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>INITIALIZE OPERATIONAL CHECKLIST</span>
          </button>
        </div>

      </div>
    </div>
  );
};
