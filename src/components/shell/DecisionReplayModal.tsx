import React from 'react';
import { LongitudinalDecisionRecord } from '../../types/memory';
import { FarmState } from '../../types/farm';
import { 
  History, 
  CloudRain, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Receipt,
  Sparkles
} from 'lucide-react';

interface DecisionReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: LongitudinalDecisionRecord;
  currentState: FarmState;
}

export const DecisionReplayModal: React.FC<DecisionReplayModalProps> = ({
  isOpen,
  onClose,
  decision,
  currentState,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FCFAF6] border border-[#E3DCB8] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-[#FAF6EB] to-[#FCFAF6] border-b border-[#E8E1C5] flex items-start justify-between sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                <History className="w-3 h-3 text-emerald-300" />
                HISTORICAL DECISION REPLAY
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                {new Date(decision.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl font-black text-zinc-900 font-sans tracking-tight">
              {decision.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-200/60 hover:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Decision Resolution Banner */}
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase">SYSTEM RECOMMENDATION THEN</div>
              <div className="text-base font-black text-emerald-950 font-sans">
                {decision.recommendation}
              </div>
              <div className="text-xs text-zinc-600 mt-0.5">
                Expected: ₹{decision.expectedNetRealization.toLocaleString('en-IN')} (P10 ₹{decision.forecast.p10.toLocaleString('en-IN')} – P90 ₹{decision.forecast.p90.toLocaleString('en-IN')})
              </div>
            </div>

            <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">FARMER ACTION RECORDED</div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-900 mt-0.5">
                {decision.farmerAction === 'ACCEPTED' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <XCircle className="w-3.5 h-3.5" /> REJECTED ({decision.rejectionReason || 'User Choice'})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Side-by-Side: THEN VS NOW */}
          <div className="space-y-2">
            <span className="tech-label text-emerald-950 font-bold block">
              LONGITUDINAL COMPARISON (THEN VS NOW)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* THEN (Historical Snapshot) */}
              <div className="p-4 rounded-2xl bg-zinc-100/70 border border-zinc-300/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <span className="font-mono text-xs font-bold text-zinc-700">
                    THEN ({new Date(decision.timestamp).toLocaleDateString()})
                  </span>
                  <span className="text-[9px] font-mono bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-700">
                    SNAPSHOT
                  </span>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">Crop Stage & Vigor:</span>
                    <strong className="text-zinc-900">{decision.stage}</strong>
                    {decision.soilSnapshot && (
                      <span className="text-[11px] font-mono text-zinc-600 block">
                        GDD: {decision.soilSnapshot.gddAccumulated} / {decision.soilSnapshot.gddTarget} ({decision.soilSnapshot.maturityPercentage}%)
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">Weather At Decision:</span>
                    <div className="text-zinc-800 flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{decision.weatherSnapshot.condition} ({decision.weatherSnapshot.rainfallProbability48h}% rain risk)</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">Market Quote:</span>
                    <div className="text-zinc-800 flex items-center gap-1.5 font-mono">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{decision.marketSnapshot.mandi}: ₹{decision.marketSnapshot.grossPricePerQuintal}/qtl</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">Risk Aversion Profile:</span>
                    <div className="text-zinc-800 font-mono">
                      {Math.round(decision.preferenceSnapshot.riskAversion * 100)}% Downside Aversion
                    </div>
                  </div>
                </div>
              </div>

              {/* NOW (Live State) */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                  <span className="font-mono text-xs font-bold text-emerald-950">
                    NOW (TODAY)
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-200/80 px-1.5 py-0.5 rounded text-emerald-900 font-bold">
                    LIVE STATE
                  </span>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">Crop Stage & Vigor:</span>
                    <strong className="text-zinc-900">{currentState.cropStage}</strong>
                    <span className="text-[11px] font-mono text-emerald-800 block">
                      GDD: {currentState.gddAccumulated} / {currentState.gddTarget} (94.6%)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">Weather At Decision:</span>
                    <div className="text-zinc-800 flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-amber-600" />
                      <span>{currentState.weather.forecast[0]?.condition || 'Sunny'} ({currentState.weather.rainfallProbability48h}% rain risk)</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">Market Quote:</span>
                    <div className="text-zinc-800 flex items-center gap-1.5 font-mono">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Unnao Mandi: ₹{currentState.market.modalPrice}/qtl</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">Risk Aversion Profile:</span>
                    <div className="text-zinc-800 font-mono font-bold text-emerald-950">
                      {Math.round(currentState.preferences.riskAversion * 100)}% Downside Aversion
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Actual Realized Outcome (If Confirmed) */}
          {decision.actualOutcome && (
            <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <Receipt className="w-4 h-4" />
                  VERIFIED HARVEST OUTCOME
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 text-[10px] font-bold">
                  {decision.actualOutcome.classification.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Actual Gross:</span>
                  <span className="font-bold">₹{decision.actualOutcome.actualGrossInr.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Transport:</span>
                  <span className="font-bold">-₹{decision.actualOutcome.transportCost.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-emerald-300 block text-[10px]">Actual Net Cash:</span>
                  <span className="text-sm font-extrabold text-white">₹{decision.actualOutcome.actualNetInr.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Variance vs P50:</span>
                  <span className={`font-bold ${decision.actualOutcome.deltaVsExpectedNetInr >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {decision.actualOutcome.deltaVsExpectedNetInr >= 0 ? '+' : ''}₹{decision.actualOutcome.deltaVsExpectedNetInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {decision.actualOutcome.farmerNotes && (
                <p className="text-xs text-emerald-100/80 pt-1 font-sans italic border-t border-white/10">
                  "{decision.actualOutcome.farmerNotes}"
                </p>
              )}
            </div>
          )}

          {/* Preference Learning Delta */}
          {decision.preferenceDeltaApplied && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-sans flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Preference Adaptation Triggered by this Decision:</strong>
                <span>{decision.preferenceDeltaApplied}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-100/90 border-t border-zinc-200 flex items-center justify-between gap-3 text-xs font-mono">
          <span className="text-zinc-500 text-[11px]">
            Historical Snapshot • Immutable Record
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold transition-all"
          >
            Close Replay
          </button>
        </div>

      </div>
    </div>
  );
};
