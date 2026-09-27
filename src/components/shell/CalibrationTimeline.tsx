/**
 * KISAN COMPASS — Calibration Timeline (Reality Ledger)
 * 
 * Renders the chronological decision timeline showing:
 * Decision -> Prediction -> Approval -> Execution -> Realization -> Forecast Error -> Learning
 */

import React, { useState } from 'react';
import { RetrospectiveDecisionAudit } from '../../types/calibration';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Clock, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Props {
  audits: RetrospectiveDecisionAudit[];
  onSelectAudit?: (audit: RetrospectiveDecisionAudit) => void;
}

export const CalibrationTimeline: React.FC<Props> = ({ audits, onSelectAudit }) => {
  const [expandedId, setExpandedId] = useState<string | null>(audits[0]?.decisionId || null);

  if (audits.length === 0) {
    return (
      <div className="p-8 text-center text-stone-400 bg-stone-900/40 border border-stone-800 rounded-xl">
        <Info className="w-8 h-8 mx-auto mb-2 text-stone-500" />
        <p className="font-mono text-xs uppercase tracking-wider">No Outcome Audits Recorded</p>
        <p className="text-xs text-stone-500 mt-1">Simulate or record verified harvests to populate the Reality Ledger.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
        <div>
          <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            Reality Ledger — Chronological Outcome Timeline
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Full audit trail comparing decision-time expectations with verified field realities.
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300">
          {audits.length} Audited Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-2.5 before:w-0.5 before:bg-stone-800">
        {audits.map((audit) => {
          const isExpanded = expandedId === audit.decisionId;
          const isInside = audit.wasInsidePredictedRange;
          const netDiff = audit.realizedNetRealization - audit.predictedNetRealization;

          return (
            <div 
              key={audit.decisionId}
              className={`relative bg-stone-900/80 border transition-all rounded-xl overflow-hidden ${
                isInside 
                  ? 'border-emerald-500/30 hover:border-emerald-500/50' 
                  : 'border-amber-500/40 hover:border-amber-500/60 bg-amber-950/10'
              }`}
            >
              {/* Timeline Marker */}
              <div 
                className={`absolute -left-6 top-4 w-3.5 h-3.5 rounded-full border-2 bg-stone-950 transition-colors ${
                  isInside ? 'border-emerald-400' : 'border-amber-400'
                }`}
              />

              {/* Card Header */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : audit.decisionId)}
                className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
              >
                <div className="flex items-start md:items-center gap-3">
                  <div className={`p-2 rounded-lg ${isInside ? 'bg-emerald-950/40 text-emerald-400' : 'bg-amber-950/40 text-amber-400'}`}>
                    {isInside ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-stone-400">{audit.decisionId}</span>
                      <span className="text-xs px-2 py-0.2 rounded bg-stone-800 text-stone-300 font-medium">
                        {audit.crop}
                      </span>
                      <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {audit.date}
                      </span>
                    </div>
                    <div className="text-xs text-stone-200 mt-1 font-medium">
                      Action: <span className="text-emerald-300">{audit.recommendedAction}</span>
                      {audit.wasActionExecuted ? (
                        <span className="ml-2 text-[10px] text-emerald-400/80 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          Executed
                        </span>
                      ) : (
                        <span className="ml-2 text-[10px] text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">
                          Deviated
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Summary metrics */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <div className="text-stone-400 text-[10px] uppercase">Predicted (P50)</div>
                    <div className="text-stone-300">₹{audit.predictedNetRealization.toLocaleString()}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                  <div className="text-right">
                    <div className="text-stone-400 text-[10px] uppercase">Realized</div>
                    <div className={`font-semibold ${netDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      ₹{audit.realizedNetRealization.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right pl-2 border-l border-stone-800">
                    <div className="text-stone-400 text-[10px] uppercase">Variance</div>
                    <div className={`flex items-center justify-end gap-1 ${netDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {netDiff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {netDiff >= 0 ? '+' : ''}{((netDiff / audit.predictedNetRealization) * 100).toFixed(1)}%
                    </div>
                  </div>

                  {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-stone-800/60 bg-stone-950/40 space-y-4">
                  {/* Step Sequence visualization */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                    <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                      <div className="text-[10px] uppercase font-mono text-stone-400">1. Prediction Interval</div>
                      <div className="text-xs font-mono text-stone-200 mt-1">
                        P10: ₹{audit.predictedInterval.p10.toLocaleString()}
                      </div>
                      <div className="text-xs font-mono text-stone-200">
                        P90: ₹{audit.predictedInterval.p90.toLocaleString()}
                      </div>
                      <div className="mt-1 text-[10px] text-emerald-400">
                        Range: ₹{(audit.predictedInterval.p90 - audit.predictedInterval.p10).toLocaleString()}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                      <div className="text-[10px] uppercase font-mono text-stone-400">2. Decision Confidence</div>
                      <div className="text-sm font-semibold text-stone-200 mt-1 font-mono">
                        {audit.decisionConfidence}%
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Ex-ante composite metric
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                      <div className="text-[10px] uppercase font-mono text-stone-400">3. Range Assessment</div>
                      <div className={`text-xs font-semibold mt-1 ${isInside ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isInside ? 'Inside P10–P90' : 'Outside Predicted Cone'}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Interval width: ±{(((audit.predictedInterval.p90 - audit.predictedInterval.p10) / (2 * audit.predictedNetRealization)) * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                      <div className="text-[10px] uppercase font-mono text-stone-400">4. Calibration Verdict</div>
                      <div className="text-xs font-semibold text-stone-200 mt-1">
                        {audit.retrospectiveVerdict.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Ex-post verification
                      </div>
                    </div>
                  </div>

                  {/* Component Breakdown Errors */}
                  <div className="p-3 bg-stone-900/60 rounded-lg border border-stone-800 space-y-2">
                    <div className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                      <span>Underlying Signal Forecast Errors:</span>
                      <span className="text-[10px] font-mono text-stone-400">P50 vs Realized Sub-signals</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                      <div className="p-2 rounded bg-stone-950/80 border border-stone-800/80">
                        <span className="text-stone-400 text-[10px] block">Mandi Price Error</span>
                        <span className={audit.forecastErrors.mandiPrice.signedError >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {audit.forecastErrors.mandiPrice.signedError >= 0 ? '+' : ''}₹{audit.forecastErrors.mandiPrice.signedError}/qtl
                        </span>
                        <span className="text-stone-500 text-[10px] block">
                          ({audit.forecastErrors.mandiPrice.percentageError.toFixed(1)}% error)
                        </span>
                      </div>
                      <div className="p-2 rounded bg-stone-950/80 border border-stone-800/80">
                        <span className="text-stone-400 text-[10px] block">Freight Rate Error</span>
                        <span className={audit.forecastErrors.freightRate.signedError <= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {audit.forecastErrors.freightRate.signedError >= 0 ? '+' : ''}₹{audit.forecastErrors.freightRate.signedError}
                        </span>
                        <span className="text-stone-500 text-[10px] block">
                          ({audit.forecastErrors.freightRate.percentageError.toFixed(1)}% error)
                        </span>
                      </div>
                      <div className="p-2 rounded bg-stone-950/80 border border-stone-800/80">
                        <span className="text-stone-400 text-[10px] block">Weather Rain Error</span>
                        <span className="text-stone-300">
                          {audit.forecastErrors.weatherRainfall.signedError >= 0 ? '+' : ''}{audit.forecastErrors.weatherRainfall.signedError}mm
                        </span>
                        <span className="text-stone-500 text-[10px] block">
                          ({audit.forecastErrors.weatherRainfall.percentageError.toFixed(1)}% error)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Causal Note & Takeaway */}
                  <div className="p-3 bg-stone-900/40 rounded-lg border border-stone-800/60 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-stone-400 font-mono text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{audit.causalNote}</span>
                    </div>
                    <div className="text-stone-300 italic">
                      "{audit.keyTakeaway}"
                    </div>
                  </div>

                  {onSelectAudit && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onSelectAudit(audit)}
                        className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
                      >
                        Inspect Full Audit Context & Evidence Graph <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
