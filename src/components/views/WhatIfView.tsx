/**
 * KISAN COMPASS — Future Horizon Visualizer & Counterfactual Engine (WhatIfView)
 * 
 * Replaces generic dashboard sliders with a spatial, interactive horizon visualizer:
 * - Visually widening P10 / P50 / P90 uncertainty fan across 14-day horizon
 * - Live deterministic recalculation of net realizations, freight, and rain penalties
 * - Clean Rain AI aesthetic with subtle atmospheric glass surfaces
 */

import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar
} from 'lucide-react';

export const WhatIfView: React.FC = () => {
  const { 
    state, 
    forecast, 
    selectedSimulationDay, 
    setSelectedSimulationDay,
    setIsDecisionProofOpen
  } = useFarm();

  const quantiles = forecast?.quantiles || [];
  const basePrice = state.market.modalPrice || 2360;
  const baseYield = state.estimatedHarvestQuintals > 0 ? state.estimatedHarvestQuintals : 25;
  const baseGross = basePrice * baseYield;
  const baseFreight = state.market.destinations[0]?.estimatedTransportCost || Math.round(200 + 25 * 38 + baseYield * 12);
  const baseNet = state.currentDecision.expectedFinancials.expectedValueInr || (baseGross - baseFreight);

  const currentStep = quantiles[selectedSimulationDay] || quantiles[0] || {
    horizonDays: 0,
    date: 'Today',
    p10Price: Math.round(basePrice * 0.97),
    p50Price: basePrice,
    p90Price: Math.round(basePrice * 1.03),
    expectedGrossValue: baseGross,
    weatherDownsidePenalty: 0,
    spoilageExposurePenalty: 0,
    transportCost: baseFreight,
    p10NetRealization: state.currentDecision.expectedFinancials.rangeMinInr || Math.round(baseNet * 0.95),
    p50NetRealization: baseNet,
    p90NetRealization: state.currentDecision.expectedFinancials.rangeMaxInr || Math.round(baseNet * 1.05),
    recommendedAction: 'SELL NOW' as const,
    decisionConfidence: state.currentDecision.confidence || 0.91,
    dominantRisk: 'Low immediate risk',
  };

  const todayStep = quantiles[0] || currentStep;
  const deltaVsToday = currentStep.p50NetRealization - todayStep.p50NetRealization;

  const isBaseline = !state.systemStatus.forecastEngineOnline;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-3 space-y-6">
      
      {/* Editorial Header */}
      <section className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 pt-1 pb-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider text-[#1B5E35] uppercase">
              Counterfactual Horizon Model • 14-Day Fan
            </span>
            <span className="text-[#9AA7A0]">•</span>
            <span className="text-[11px] font-mono text-[#69776F]">
              {isBaseline ? 'Empirical Historical Quantiles' : 'Parameterized Quantile Simulation'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102117] tracking-tight font-sans">
            Future Horizon & Counterfactual Simulation
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-white border border-black/[0.08] text-[#123D25] font-bold shadow-xs">
            {currentStep.date.toUpperCase()} (DAY +{selectedSimulationDay})
          </span>
        </div>
      </section>

      {/* Main Horizon Surface */}
      <div className="rain-decision-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-float">
        
        {/* Step Highlight & Outcome Comparison */}
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-[#69776F] uppercase tracking-wider">
              Optimal Action at Day +{selectedSimulationDay}
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#102117] font-sans">
              {currentStep.recommendedAction}
            </div>
            <p className="text-xs sm:text-sm text-[#405048] font-sans max-w-lg">
              {selectedSimulationDay === 0 
                ? 'Harvest immediately to bypass convective storm front.' 
                : selectedSimulationDay <= 4 
                ? 'Harvest delayed into the storm window. High dockage exposure.' 
                : 'Post-storm clearing. Grain drying commences with modest modal price recovery.'}
            </p>
          </div>

          <div className="md:text-right shrink-0 space-y-1">
            <div className="text-[10px] font-mono text-[#69776F] uppercase tracking-wider">
              Projected Net Realization
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#123D25] font-mono">
              ₹{currentStep.p50NetRealization.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center md:justify-end gap-1 font-mono text-xs font-bold">
              {deltaVsToday >= 0 ? (
                <span className="text-[#1B5E35] flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +₹{deltaVsToday.toLocaleString('en-IN')} vs Today
                </span>
              ) : (
                <span className="text-[#B94A48] flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  −₹{Math.abs(deltaVsToday).toLocaleString('en-IN')} vs Today
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Horizon Timeline Slider */}
        <div className="p-5 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#69776F] uppercase font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1B5E35]" />
              Horizon Scrubber: Today &rarr; +14 Days
            </span>
            <span className="text-[#102117] font-bold">
              Selected: Day +{selectedSimulationDay} ({currentStep.date})
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(0, quantiles.length - 1)}
            value={selectedSimulationDay}
            onChange={(e) => setSelectedSimulationDay(Number(e.target.value))}
            className="w-full h-2 bg-black/[0.08] rounded-full appearance-none cursor-pointer accent-[#123D25]"
          />

          <div className="flex justify-between text-[10px] font-mono text-[#69776F]">
            <span>Today (Mar 26)</span>
            <span>+3d (Storm Front)</span>
            <span>+7d (Clearing)</span>
            <span>+10d</span>
            <span>+14d Horizon</span>
          </div>
        </div>

        {/* Widening Uncertainty Fan Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#69776F] uppercase font-bold">Probabilistic Quantile Spread (P10 / P50 / P90)</span>
            <span className="text-[11px] text-[#2E7D4A] font-semibold">
              {(currentStep.decisionConfidence * 100).toFixed(0)}% Confidence
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/80 border border-black/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-[#69776F] uppercase block">P10 DOWNSIDE (10th %)</span>
              <div className="text-xl font-bold text-[#C8753D] font-mono">
                ₹{currentStep.p10NetRealization.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] font-mono text-[#69776F]">
                Spot Price: ₹{currentStep.p10Price} / qtl
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#DCEBDA]/50 border border-[#A8C6A5]/80 space-y-1">
              <span className="text-[10px] font-mono text-[#123D25] uppercase block font-bold">P50 EXPECTED MEAN</span>
              <div className="text-xl font-black text-[#123D25] font-mono">
                ₹{currentStep.p50NetRealization.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] font-mono text-[#1B5E35]">
                Spot Price: ₹{currentStep.p50Price} / qtl
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 border border-black/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-[#69776F] uppercase block">P90 UPSIDE (90th %)</span>
              <div className="text-xl font-bold text-[#1B5E35] font-mono">
                ₹{currentStep.p90NetRealization.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] font-mono text-[#69776F]">
                Spot Price: ₹{currentStep.p90Price} / qtl
              </div>
            </div>
          </div>
        </div>

        {/* Deductions & Penalties Breakdown */}
        <div className="p-4 rounded-2xl bg-[#F7F9F7] border border-black/[0.05] space-y-2 text-xs">
          <div className="font-mono text-[11px] font-bold text-[#102117] uppercase">
            Horizon Cost & Risk Breakdown for Day +{selectedSimulationDay}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-xl bg-white border border-black/[0.06]">
              <span className="text-[#69776F] block text-[9px] uppercase">Gross Mandi Value</span>
              <strong className="text-[#102117]">₹{currentStep.expectedGrossValue.toLocaleString('en-IN')}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-black/[0.06]">
              <span className="text-[#69776F] block text-[9px] uppercase">Dedicated Freight</span>
              <span className="text-[#B94A48]">−₹{currentStep.transportCost.toLocaleString('en-IN')}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-black/[0.06]">
              <span className="text-[#69776F] block text-[9px] uppercase">Weather Dockage Exposure</span>
              <span className={currentStep.weatherDownsidePenalty > 0 ? 'text-amber-700 font-bold' : 'text-[#69776F]'}>
                {currentStep.weatherDownsidePenalty > 0 ? `−₹${currentStep.weatherDownsidePenalty.toLocaleString('en-IN')}` : '₹0 (Safe window)'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Link to Lineage Trace */}
        <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-[#69776F]">
            Zero single-point predictions. Uncertainty expands naturally with temporal distance.
          </span>

          <button
            onClick={() => setIsDecisionProofOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F0F6F1] border border-black/[0.08] text-[#123D25] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Trace Decision Lineage</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#2E7D4A]" />
          </button>
        </div>

      </div>

    </div>
  );
};
