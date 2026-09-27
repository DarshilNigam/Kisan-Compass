import React, { useState } from 'react';
import { FarmWatchState, FarmEvent } from '../../types/farmWatch';
import { 
  Eye, 
  Activity, 
  Sparkles, 
  ChevronRight, 
  Sliders, 
  Bell,
  Layers,
  ShieldCheck,
  CloudRain,
  TrendingUp,
  Truck
} from 'lucide-react';

interface FarmWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchState: FarmWatchState;
  onSimulateWeatherShift: () => void;
  onSimulateMarketNoise: () => void;
  onResetBaseline: () => void;
  onReviewReassessment: () => void;
}

export const FarmWatchModal: React.FC<FarmWatchModalProps> = ({
  isOpen,
  onClose,
  watchState,
  onSimulateWeatherShift,
  onSimulateMarketNoise,
  onResetBaseline,
  onReviewReassessment,
}) => {
  const [activeTab, setActiveTab] = useState<'signals' | 'events' | 'noise' | 'sandbox'>('signals');

  if (!isOpen) return null;

  const isReassessmentPending = watchState.pendingReassessment !== null;
  const noiseEvents = watchState.recentEvents.filter(e => e.materiality === 'NOISE' || e.materiality === 'INFO');
  const materialEvents = watchState.recentEvents.filter(e => e.materiality === 'MATERIAL' || e.materiality === 'DECISION_CHANGING');

  const getSeverityBadge = (severity: FarmEvent['severity']) => {
    switch (severity) {
      case 'DECISION_CHANGING':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold';
      case 'MATERIAL':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'WATCH':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-semibold';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getSignalIcon = (category: string) => {
    switch (category) {
      case 'WEATHER': return CloudRain;
      case 'MARKET': return TrendingUp;
      case 'LOGISTICS': return Truck;
      default: return Layers;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#FCFAF6] border border-[#E3DCB8] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#FAF6EB] to-[#FCFAF6] border-b border-[#E8E1C5] flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                <Eye className="w-3 h-3 text-emerald-300" />
                Continuous Farm Watch • Stage 8
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-[10px] font-mono text-zinc-600 font-semibold uppercase">
                Event-Driven Temporal Reassessment
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight font-sans">
                Farm Watch Command Terminal
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                isReassessmentPending 
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse' 
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {isReassessmentPending ? '● REASSESSMENT REQUIRED' : '● CONTINUOUSLY WATCHING'}
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Watching decision-critical variables in real time. Fires alerts only when physical reality crosses mathematical thresholds.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 flex items-center justify-center text-sm font-bold transition-all shadow-xs"
          >
            ✕
          </button>
        </div>

        {/* High-Priority Reassessment Alert Banner if Triggered */}
        {isReassessmentPending && (
          <div className="px-6 py-3.5 bg-gradient-to-r from-purple-950 via-purple-900 to-zinc-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-purple-300 shrink-0" />
              <div>
                <div className="text-xs font-mono font-bold tracking-wider text-purple-200 uppercase">
                  DECISION-CHANGING EVENT DETECTED
                </div>
                <div className="text-sm font-bold font-sans">
                  {watchState.pendingReassessment?.whyHeadline}
                </div>
              </div>
            </div>

            <button
              onClick={onReviewReassessment}
              className="px-4 py-1.5 rounded-xl bg-purple-400 hover:bg-purple-300 text-purple-950 font-mono text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all shrink-0"
            >
              <span>REVIEW REASSESSMENT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-zinc-200 bg-white/60 overflow-x-auto gap-2 py-2">
          {[
            { id: 'signals' as const, label: `Monitored Signals (${watchState.monitoredSignals.length})`, icon: Activity },
            { id: 'events' as const, label: `Material Events (${materialEvents.length})`, icon: Bell },
            { id: 'noise' as const, label: `What Didn't Matter (${noiseEvents.length})`, icon: Layers },
            { id: 'sandbox' as const, label: 'Judge Demo Sandbox', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-zinc-800">
          
          {/* TAB 1: MONITORED SIGNALS */}
          {activeTab === 'signals' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-800" />
                  <span className="text-xs font-mono font-bold text-emerald-950">
                    Watching 4 Decision-Sensitive Signals (Field 07)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-800">
                  Last evaluated: {watchState.lastEvaluatedAt}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {watchState.monitoredSignals.map((sig) => {
                  const Icon = getSignalIcon(sig.category);
                  const isTriggered = sig.status === 'TRIGGERED';

                  return (
                    <div 
                      key={sig.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isTriggered 
                          ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-300' 
                          : 'bg-white border-zinc-200/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isTriggered ? 'bg-purple-200 text-purple-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-900 font-sans">
                              {sig.name}
                            </h4>
                            <span className="text-[10px] font-mono text-zinc-500">
                              Baseline: {sig.baselineValue}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isTriggered 
                            ? 'bg-purple-900 text-white' 
                            : sig.status === 'APPROACHING_TRIGGER'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {sig.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-[9px] text-zinc-500 uppercase block">Current Telemetry</span>
                          <span className="font-extrabold text-zinc-900">{sig.currentValue}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-zinc-500 uppercase block">Threshold Rule</span>
                          <span className="font-bold text-emerald-900">{sig.sensitivityRegion}</span>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-zinc-600">
                        <span className="font-semibold text-zinc-700">Status: </span>
                        {sig.lastShiftText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MATERIAL EVENTS TIMELINE */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-zinc-500 uppercase font-bold">
                Material Farm Events Timeline (Recorded Chronology)
              </div>

              <div className="space-y-3">
                {watchState.recentEvents.map((evt) => (
                  <div
                    key={evt.eventId}
                    className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs hover:border-emerald-400/50 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-zinc-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-zinc-800">
                          {evt.timestamp}
                        </span>
                        <span className="text-zinc-300">•</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getSeverityBadge(evt.severity)}`}>
                          {evt.severity.replace('_', ' ')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[9px] font-bold">
                          {evt.origin}
                        </span>
                      </div>

                      <div className="text-xs font-mono font-extrabold text-emerald-950">
                        {evt.previousValue} → {evt.currentValue} ({evt.deltaFormatted})
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900 font-sans">
                      {evt.title}
                    </h4>

                    <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                      {evt.decisionImpact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WHAT CHANGED BUT DIDN'T MATTER */}
          {activeTab === 'noise' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-700" />
                  <span className="text-xs font-mono font-bold text-zinc-900">
                    Decision Relevance Filter (Ignored Telemetry Jitter)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-600">
                  Change ≠ Decision Impact
                </span>
              </div>

              <div className="space-y-3">
                {noiseEvents.map((evt) => (
                  <div key={evt.eventId} className="p-3.5 rounded-2xl bg-white border border-zinc-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-zinc-500">{evt.timestamp}</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[9px]">
                          {evt.materiality}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-zinc-700">
                        {evt.previousValue} → {evt.currentValue} ({evt.deltaFormatted})
                      </span>
                    </div>

                    <h4 className="font-bold text-zinc-900 font-sans text-xs">{evt.title}</h4>
                    <p className="text-zinc-600 text-[11px]">{evt.whyAlertSummary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: JUDGE DEMONSTRATION SANDBOX */}
          {activeTab === 'sandbox' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold">
                    Controlled Hackathon Demonstration Sandbox
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  Live Event Simulation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Decision-Changing Weather Event */}
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-purple-900 font-bold uppercase block">
                      Test Scenario 1 (Reassessment)
                    </span>
                    <h4 className="text-xs font-bold text-zinc-900 font-sans">
                      Simulate Radar Clearing (68% → 37%)
                    </h4>
                    <p className="text-[11px] text-zinc-600">
                      Crosses the ≤41% boundary and triggers an active decision reassessment to WAIT 5 DAYS.
                    </p>
                  </div>

                  <button
                    onClick={onSimulateWeatherShift}
                    className="w-full py-2 px-3 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-mono text-xs font-bold transition-all shadow-xs"
                  >
                    Simulate Weather Shift
                  </button>
                </div>

                {/* 2. Non-Actionable Market Noise Event */}
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-blue-900 font-bold uppercase block">
                      Test Scenario 2 (Materiality Filter)
                    </span>
                    <h4 className="text-xs font-bold text-zinc-900 font-sans">
                      Simulate Market Drift (+₹15/qtl)
                    </h4>
                    <p className="text-[11px] text-zinc-600">
                      Logs a market update but suppresses false alarm since delta is below the +14.5% flip threshold.
                    </p>
                  </div>

                  <button
                    onClick={onSimulateMarketNoise}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white font-mono text-xs font-bold transition-all shadow-xs"
                  >
                    Simulate Market Drift
                  </button>
                </div>

                {/* 3. Reset Baseline */}
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-900 font-bold uppercase block">
                      State Recovery
                    </span>
                    <h4 className="text-xs font-bold text-zinc-900 font-sans">
                      Reset to Live Farm State
                    </h4>
                    <p className="text-[11px] text-zinc-600">
                      Restores live 68% rain risk and baseline ₹2,380 modal price.
                    </p>
                  </div>

                  <button
                    onClick={onResetBaseline}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-mono text-xs font-bold transition-all shadow-xs"
                  >
                    Reset Baseline State
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF6EB] border-t border-[#E8E1C5] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Kisan Compass Farm Watch Protocol v8.0 • Event Sourced</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-900 text-white font-bold hover:bg-emerald-950 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
