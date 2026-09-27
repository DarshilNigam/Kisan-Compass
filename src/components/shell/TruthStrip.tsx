/**
 * KISAN COMPASS — Persistent Truth Strip & Compact Truth Inspector (Stage 12)
 * 
 * Provides an omnipresent, subtle live truth status across the app.
 * Clicking opens the compact Truth Inspector answering:
 * - What is live?
 * - What is cached?
 * - What is historical?
 * - What is simulated?
 * - What is verified?
 * - What is currently limiting confidence?
 */

import React, { useState, useMemo } from 'react';
import { useFarm } from '../../context/FarmContext';
import { buildTruthContracts, buildTruthInventory } from '../../services/truthRegistry';
import { 
  ShieldCheck, 
  X, 
  AlertTriangle, 
  ChevronRight,
  Layers,
  Sparkles,
  Lock,
  GitCommit
} from 'lucide-react';

export const TruthStrip: React.FC = () => {
  const { 
    state, 
    snapshot, 
    forecast, 
    evaluationRun, 
    setIsEvaluationLabOpen,
    setSelectedProvenance,
    setIsDecisionProofOpen,
    setIsJudgeModeOpen 
  } = useFarm();
  
  const [isOpen, setIsOpen] = useState(false);

  const contracts = useMemo(() => {
    return buildTruthContracts(state, snapshot, forecast, evaluationRun);
  }, [state, snapshot, forecast, evaluationRun]);

  const inventory = useMemo(() => {
    return buildTruthInventory(contracts);
  }, [contracts]);

  const getOriginBadge = (origin: string) => {
    switch (origin) {
      case 'LIVE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'CACHED': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'HISTORICAL': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'DERIVED': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'DEMO': return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'SIMULATED': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default: return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  return (
    <>
      {/* Persistent Subtle Truth Strip */}
      <div className="w-full bg-[#102217] border-b border-emerald-900/40 text-[11px] font-mono py-1.5 px-3 sm:px-4 text-emerald-100/90 flex items-center justify-between gap-2 overflow-x-auto select-none shadow-xs">
        {/* Left: Source Counts & Status */}
        <div 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 cursor-pointer hover:text-white transition-colors shrink-0"
          title="Click to inspect Ground Truth Contracts"
        >
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${inventory.cachedCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 living-pulse'}`} />
            <span className="font-bold text-white tracking-wider uppercase">TRUTH LAYER</span>
          </div>

          <span className="text-emerald-700">•</span>

          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-emerald-400 font-semibold">{inventory.totalContracts} SOURCES</span>
            <span className="text-emerald-700">|</span>
            <span className="text-emerald-300">{inventory.liveCount} LIVE</span>
            {inventory.cachedCount > 0 && (
              <>
                <span className="text-emerald-700">|</span>
                <span className="text-amber-300 font-bold">{inventory.cachedCount} CACHED</span>
              </>
            )}
            <span className="text-emerald-700">|</span>
            <span className="text-blue-300">{inventory.historicalCount} HISTORICAL</span>
          </div>
        </div>

        {/* Center: Decision Assurance */}
        <div 
          onClick={() => setIsOpen(true)}
          className="hidden md:flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
        >
          <span className="text-emerald-700">•</span>
          <span className="text-[10px] text-emerald-200/80">
            ASSURANCE: <strong className={inventory.compositeAssurance === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}>{inventory.compositeAssurance}</strong>
          </span>
          <span className="text-emerald-700">•</span>
          <span className="text-[10px] text-emerald-300 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-emerald-400" />
            NO AUTO-ACTIONS (HUMAN VETO ONLY)
          </span>
        </div>

        {/* Right: Quick Action Triggers */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsDecisionProofOpen(true)}
            className="px-2 py-0.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700/50 flex items-center gap-1 transition-all text-[10px] font-bold cursor-pointer"
            title="Open End-to-End Decision Proof Lineage"
          >
            <GitCommit className="w-3 h-3 text-emerald-300" />
            <span>TRACE DECISION</span>
          </button>

          <button
            onClick={() => setIsJudgeModeOpen(true)}
            className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/30 to-amber-600/30 hover:from-amber-500/40 hover:to-amber-600/40 text-amber-200 hover:text-white border border-amber-400/50 flex items-center gap-1 transition-all text-[10px] font-bold shadow-xs cursor-pointer animate-pulse"
            title="Start Guided Judge Demonstration Mode"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>JUDGE MODE</span>
          </button>
        </div>
      </div>

      {/* Compact Truth Inspector Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-stone-950 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-stone-100 font-mono">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Field-Grade Truth Inspector
                  </h2>
                  <p className="text-[10px] text-stone-400">
                    Station UP-KN-892 • Real-time Data-Origin & Provenance Contracts
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Top Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase block">LIVE SOURCES</span>
                  <div className="text-lg font-bold text-emerald-400">{inventory.liveCount} / {inventory.totalContracts}</div>
                  <div className="text-[9px] text-stone-500">Forecast, APMC, Soil Profile</div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase block">CACHED SOURCES</span>
                  <div className={`text-lg font-bold ${inventory.cachedCount > 0 ? 'text-amber-400' : 'text-stone-300'}`}>
                    {inventory.cachedCount}
                  </div>
                  <div className="text-[9px] text-stone-500">Preserved fallback</div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase block">HISTORICAL DATASETS</span>
                  <div className="text-lg font-bold text-blue-400">{inventory.historicalCount}</div>
                  <div className="text-[9px] text-stone-500">APMC seasonal quantiles</div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase block">AUTONOMOUS ACTIONS</span>
                  <div className="text-lg font-bold text-emerald-400">DISALLOWED</div>
                  <div className="text-[9px] text-stone-500">Strict human approval</div>
                </div>
              </div>

              {/* Active Confidence Limitations */}
              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Active System Limitations & Assurance Boundary
                </div>
                {inventory.activeLimitations.length > 0 ? (
                  <ul className="space-y-1 text-[11px] text-stone-300 list-disc list-inside">
                    {inventory.activeLimitations.map((lim, i) => (
                      <li key={i} className="text-amber-200/90">{lim}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
                    All 7 data contracts are currently active and within nominal freshness limits. The primary recommendation operates with <strong>High Confidence</strong>. No telemetry sources are currently in degraded fallback mode.
                  </p>
                )}
              </div>

              {/* Individual Truth Contracts Ledger */}
              <div className="space-y-2.5">
                <div className="text-[11px] text-stone-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Registered Truth Contracts ({contracts.length})</span>
                  <span className="text-[10px] text-stone-500">Strictly Segregated Provenance</span>
                </div>

                <div className="space-y-2">
                  {contracts.map((c) => (
                    <div 
                      key={c.id}
                      onClick={() => {
                        if (c.id === 'TC-WEATHER') {
                          setSelectedProvenance({
                            status: c.origin === 'LIVE' ? 'LIVE' : 'CACHED',
                            sourceName: c.name,
                            provider: c.provider,
                            fetchedAt: c.lastVerifiedAt,
                            ageMinutes: c.ageMinutes || 12,
                            confidence: c.confidence,
                            usedBy: ['Precipitation Risk Window', 'Harvest Timing Matrix'],
                            isFallback: c.origin !== 'LIVE'
                          });
                          setIsOpen(false);
                        } else if (c.id === 'TC-UTILITY' || c.id === 'TC-NET-REALIZATION') {
                          setIsOpen(false);
                          setIsDecisionProofOpen(true);
                        }
                      }}
                      className="p-3 rounded-2xl bg-stone-900 border border-stone-800/80 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            Provider: {c.provider} • Verified {c.lastVerifiedAt}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${getOriginBadge(c.origin)}`}>
                            {c.origin}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-stone-800 text-stone-300 border border-stone-700">
                            {c.verification}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-stone-950 border border-stone-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-stone-400">Telemetry Value:</span>
                        <span className="text-emerald-300 font-bold">{c.valueDisplay}</span>
                      </div>

                      <div className="text-[10px] text-stone-500 flex items-center justify-between pt-1">
                        <span>Rule: {c.governingRule}</span>
                        <span className="text-stone-400 group-hover:text-emerald-400 flex items-center gap-0.5">
                          Inspect <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsEvaluationLabOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-stone-400" />
                <span>Open Evaluation Lab (Stage 11)</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsDecisionProofOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <GitCommit className="w-3.5 h-3.5 text-stone-950" />
                <span>Trace Full Decision Lineage</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
