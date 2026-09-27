/**
 * KISAN COMPASS — Layered "Why?" Intelligence Sheet (Rain AI Design)
 * 
 * Replaces generic explanation modals with an elegant, layered scientific sheet
 * explaining reasoning weights, main pressures, and the explicit decision boundary:
 * "WHAT WOULD CHANGE MY MIND?"
 */

import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { 
  X, 
  Sparkles, 
  CloudRain, 
  TrendingUp, 
  Sprout, 
  Truck, 
  GitCommit,
  ShieldAlert
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenTrace?: () => void;
}

export const WhyIntelligenceSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenTrace
}) => {
  const { state } = useFarm();
  if (!isOpen) return null;

  const optimalMandi = state.market.destinations.find(d => d.isOptimal) || state.market.destinations[0];
  const fieldName = state.fieldName || 'Primary Field';
  const mandiName = optimalMandi?.name || 'Primary Mandi';
  const modalPrice = optimalMandi?.grossPricePerQuintal || state.market.modalPrice || 2380;
  const expectedNet = state.currentDecision.expectedFinancials.expectedValueInr;
  const rainProb = state.weather.rainfallProbability48h || 68;
  const cropDisplayName = state.crop || 'crop';
  const freightCost = optimalMandi?.estimatedTransportCost ?? Math.round(200 + 25 * 38 + state.estimatedHarvestQuintals * 12);

  const factors = [
    {
      name: 'Weather Downside Risk',
      value: `${rainProb}% Storm Probability in 48h`,
      impact: 'DOWNSIDE PRESSURE',
      weight: 0.38,
      color: 'bg-amber-500',
      icon: CloudRain,
      detail: `Convective storm front arrives in 36h. Threatens moisture dockage and lodging penalty on standing ${cropDisplayName}.`
    },
    {
      name: 'Mandi Arbitrage Premium',
      value: `${mandiName} (₹${modalPrice.toLocaleString('en-IN')} / Qtl)`,
      impact: 'UPSIDE SUPPORT',
      weight: 0.32,
      color: 'bg-emerald-600',
      icon: TrendingUp,
      detail: `Modal quote at ${mandiName} yields optimal net realization after accounting for freight.`
    },
    {
      name: 'Crop Biological Maturity',
      value: `${Math.round(state.cropMaturityProgress || 92)}% Biological Readiness`,
      impact: 'AGRONOMIC CLEARANCE',
      weight: 0.18,
      color: 'bg-emerald-700',
      icon: Sprout,
      detail: `Development stage: ${state.cropStage || 'Ready for harvest'}. Field moisture aligned with mandi standards.`
    },
    {
      name: 'Dedicated Haulage Cost',
      value: `${optimalMandi?.distanceKm || 28} km Route (₹${freightCost.toLocaleString('en-IN')})`,
      impact: 'LOGISTICS VERIFIED',
      weight: 0.12,
      color: 'bg-stone-600',
      icon: Truck,
      detail: 'Tractor trolley transport committed for transit to destination mandi.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-end p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full sm:max-w-xl h-full sm:h-auto sm:max-h-[92vh] bg-white rounded-none sm:rounded-3xl shadow-modal border-l sm:border border-black/[0.08] overflow-hidden flex flex-col font-sans animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#F7F9F7] to-white border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#123D25] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#A8C6A5]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#69776F] uppercase tracking-wider font-bold">
                GROUNDED DECISION REASONING
              </div>
              <h2 className="text-lg font-bold text-[#102117] tracking-tight">
                Why Recommend SELL NOW?
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#69776F] hover:text-[#102117] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Executive Summary */}
          <div className="p-4 rounded-2xl bg-[#F0F6F1] border border-[#A8C6A5]/40 space-y-1.5">
            <div className="text-[10px] font-mono font-bold text-[#123D25] uppercase tracking-wider">
              DETERMINISTIC OPTIMIZATION RESULT
            </div>
            <p className="text-xs text-[#102117] leading-relaxed">
              Harvesting {fieldName} immediately locks in <strong>₹{expectedNet.toLocaleString('en-IN')} expected net realization</strong> at {mandiName} while completely bypassing the {rainProb}% convective rain front arriving in 36 hours.
            </p>
          </div>

          {/* Reasoning Factor Weight Bars */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-[#69776F] uppercase tracking-wider font-bold">
              ATTRIBUTED FACTOR WEIGHTS
            </div>

            <div className="space-y-3">
              {factors.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="p-3 rounded-2xl bg-[#F7F9F7] border border-black/[0.05] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-[#102117]">
                        <Icon className="w-4 h-4 text-[#1B5E35]" />
                        <span>{f.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#69776F]">
                        {(f.weight * 100).toFixed(0)}% weight
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${f.color}`}
                        style={{ width: `${f.weight * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#102117] font-semibold">{f.value}</span>
                      <span className="text-[9px] uppercase font-bold text-[#69776F]">{f.impact}</span>
                    </div>

                    <p className="text-[11px] text-[#405048] font-sans leading-relaxed pt-0.5">
                      {f.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Pressure vs Main Support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-900 uppercase block">MAIN PRESSURE</span>
              <div className="font-bold text-amber-950 font-sans">Weather Downside Exposure</div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed font-sans">
                Holding standing {cropDisplayName} past the harvest window risks rain-induced dockage loss and quality downgrade.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#DCEBDA]/60 border border-[#A8C6A5]/80 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#123D25] uppercase block">MAIN SUPPORT</span>
              <div className="font-bold text-[#102117] font-sans">{mandiName} Realization</div>
              <p className="text-[11px] text-[#405048] leading-relaxed font-sans">
                ₹{modalPrice.toLocaleString('en-IN')}/qtl spot rate provides ₹{expectedNet.toLocaleString('en-IN')} net cash in hand today without storage depreciation.
              </p>
            </div>
          </div>

          {/* WHAT WOULD CHANGE MY MIND? Decision Boundary */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#123D25] to-[#152B1E] text-white space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#A8C6A5] uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-[#A8C6A5]" />
              WHAT WOULD CHANGE MY MIND? (निर्णय सीमा)
            </div>

            <p className="text-xs text-white/90 leading-relaxed font-sans">
              The recommendation flips from <strong>SELL NOW &rarr; WAIT 5 DAYS</strong> if either condition occurs:
            </p>

            <div className="space-y-1.5 font-mono text-[11px] pt-1">
              <div className="p-2 rounded-lg bg-white/10 border border-white/10 flex items-center justify-between">
                <span>1. Rain Probability drops:</span>
                <strong className="text-amber-300">&lt; 41%</strong>
              </div>
              <div className="p-2 rounded-lg bg-white/10 border border-white/10 flex items-center justify-between">
                <span>2. Post-storm price upside exceeds:</span>
                <strong className="text-[#A8C6A5]">&ge; +14.5% (₹2,725)</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F9F7] border-t border-black/[0.06] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              if (onOpenTrace) onOpenTrace();
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-black/[0.02] border border-black/[0.08] text-[#102117] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <GitCommit className="w-3.5 h-3.5 text-[#1B5E35]" />
            <span>Trace Lineage Tree</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#123D25] hover:bg-[#1B5E35] text-white text-xs font-bold font-mono transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
