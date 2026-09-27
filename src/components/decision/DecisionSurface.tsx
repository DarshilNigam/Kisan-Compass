/**
 * KISAN COMPASS — Floating Decision Intelligence Surface (Rain AI Design)
 * 
 * Replaces heavy cluttered dashboard cards with a calm, editorial,
 * floating intelligence surface with large clear typography, probabilistic ranges,
 * and intuitive action controls.
 */

import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { 
  Sparkles, 
  GitCommit, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck
} from 'lucide-react';

interface Props {
  onOpenWhy: () => void;
  onOpenWhatIf: () => void;
  onOpenTrace: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export const DecisionSurface: React.FC<Props> = ({
  onOpenWhy,
  onOpenWhatIf,
  onOpenTrace,
  onApprove,
  onReject
}) => {
  const { state } = useFarm();
  const currentDec = state.currentDecision;

  const expectedNet = currentDec.expectedFinancials.expectedValueInr;
  const p10Net = Math.round(expectedNet * 0.95);
  const p90Net = Math.round(expectedNet * 1.035);

  const rainProb = state.weather.rainfallProbability48h || 68;
  const maturityPct = 94.6;

  return (
    <div className="rain-decision-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-float transition-all">
      
      {/* Top Meta Line */}
      <div className="flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#DCEBDA] text-[#123D25] text-[10px] font-bold tracking-wider uppercase border border-[#A8C6A5]/50">
            OPTIMAL DECISION
          </span>
          <span className="text-[#9AA7A0]">•</span>
          <span className="text-[#69776F] text-[11px]">32 QUINTALS • FIELD 07</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#2E7D4A] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D4A]" />
          <span>{(currentDec.confidence * 100).toFixed(0)}% ASSURANCE</span>
        </div>
      </div>

      {/* Hero Recommendation & Financial Output */}
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 pt-1">
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#102117] tracking-tight font-sans">
            {currentDec.action}
          </h2>
          <p className="text-sm sm:text-base text-[#405048] font-sans font-medium max-w-xl leading-relaxed">
            Harvest before storm window closes. Dispatch to Unnao Mandi for optimal net realization.
          </p>
        </div>

        <div className="md:text-right shrink-0">
          <div className="text-[10px] font-mono text-[#69776F] uppercase tracking-wider">
            Expected Net Realization
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#123D25] font-mono tracking-tight">
            ₹{expectedNet.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-[#69776F] mt-0.5">
            After ₹1,340 dedicated freight
          </div>
        </div>
      </div>

      {/* Probabilistic Horizon Range (P10 / P50 / P90) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-black/[0.02] border border-black/[0.05] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#69776F] uppercase">
          <span>P10 Conservative</span>
          <span className="font-bold text-[#102117]">P50 Expected Mean</span>
          <span>P90 Optimistic</span>
        </div>

        {/* Uncertainty bar */}
        <div className="relative h-2 rounded-full bg-black/[0.06] overflow-hidden">
          <div className="absolute inset-y-0 left-[15%] right-[12%] rounded-full bg-gradient-to-r from-[#6E9F6F] via-[#2E7D4A] to-[#1B5E35]" />
          <div className="absolute left-[54%] top-0 bottom-0 w-1 bg-white shadow-xs" />
        </div>

        <div className="flex items-center justify-between text-xs font-mono font-bold text-[#102117]">
          <span className="text-[#69776F]">₹{p10Net.toLocaleString('en-IN')}</span>
          <span className="text-[#123D25] text-sm">₹{expectedNet.toLocaleString('en-IN')}</span>
          <span className="text-[#1B5E35]">₹{p90Net.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Three Strategic Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white/70 border border-black/[0.06] space-y-1">
          <span className="text-[10px] font-mono text-[#69776F] uppercase block">WEATHER RISK</span>
          <div className="text-sm font-bold text-[#C8753D] font-sans">{rainProb}% 48h Front</div>
          <div className="text-[10px] font-mono text-[#69776F]">−₹3,838 storm exposure if delayed</div>
        </div>

        <div className="p-3 rounded-xl bg-white/70 border border-black/[0.06] space-y-1">
          <span className="text-[10px] font-mono text-[#69776F] uppercase block">MARKET ARBITRAGE</span>
          <div className="text-sm font-bold text-[#1B5E35] font-sans">Unnao Mandi</div>
          <div className="text-[10px] font-mono text-[#2E7D4A]">+₹920 Net over Kanpur yard</div>
        </div>

        <div className="p-3 rounded-xl bg-white/70 border border-black/[0.06] space-y-1">
          <span className="text-[10px] font-mono text-[#69776F] uppercase block">CROP READINESS</span>
          <div className="text-sm font-bold text-[#102117] font-sans">{maturityPct}% Mature</div>
          <div className="text-[10px] font-mono text-[#69776F]">Moisture optimal at 13.2%</div>
        </div>
      </div>

      {/* Integrated Action Bar */}
      <div className="pt-2 border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Deep Inspection Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenWhy}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F0F6F1] border border-black/[0.08] hover:border-[#1B5E35]/40 text-[#123D25] text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2E7D4A]" />
            <span>WHY? (निर्णय की वजह)</span>
          </button>

          <button
            onClick={onOpenWhatIf}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F0F6F1] border border-black/[0.08] hover:border-[#1B5E35]/40 text-[#405048] hover:text-[#102117] text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#6E9F6F]" />
            <span>WHAT-IF SIMULATION</span>
          </button>

          <button
            onClick={onOpenTrace}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F0F6F1] border border-black/[0.08] hover:border-[#1B5E35]/40 text-[#405048] hover:text-[#102117] text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <GitCommit className="w-3.5 h-3.5 text-[#4E8FA8]" />
            <span>TRACE PROOF</span>
          </button>
        </div>

        {/* Right: Human Governance Checkpoint */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReject}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-black/[0.08] text-[#B94A48] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>REJECT</span>
          </button>

          <button
            onClick={onApprove}
            className="px-5 py-2 rounded-xl bg-[#123D25] hover:bg-[#1B5E35] text-white text-xs font-mono font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#A8C6A5]" />
            <span>AUTHORIZE HARVEST PLAN</span>
          </button>
        </div>
      </div>

    </div>
  );
};
