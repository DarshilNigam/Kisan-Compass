import React, { useState } from 'react';
import { 
  ExecutionPlan, 
  ExecutionFeasibilityReport, 
  ExecutionEvent, 
  ExecutionDeviationReport 
} from '../../types/execution';
import { ExecutionChecklist } from './ExecutionChecklist';
import { 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Sliders, 
  Sparkles, 
  Clock, 
  GitCompare
} from 'lucide-react';

interface ExecutionCenterProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ExecutionPlan;
  feasibility: ExecutionFeasibilityReport;
  events: ExecutionEvent[];
  deviations: ExecutionDeviationReport;
  isSimulated: boolean;
  onAdvanceStep: (stepId: string, newStatus: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED', evidenceText: string) => void;
  onSimulateFullHarvestSequence: () => void;
  onSimulateTransportConfirmation: () => void;
  onSimulateHarvestStart: () => void;
  onSimulateHarvestComplete: () => void;
  onSimulateDispatch: () => void;
  onSimulateMandiSale: (price: number, qty: number, freight: number) => void;
  onResetExecution: () => void;
}

export const ExecutionCenter: React.FC<ExecutionCenterProps> = ({
  isOpen,
  onClose,
  plan,
  feasibility,
  events,
  deviations,
  isSimulated,
  onAdvanceStep,
  onSimulateFullHarvestSequence,
  onSimulateTransportConfirmation,
  onSimulateHarvestStart,
  onSimulateHarvestComplete,
  onSimulateDispatch,
  onSimulateMandiSale,
  onResetExecution,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'checklist' | 'events' | 'deviations' | 'sandbox'>('checklist');

  if (!isOpen) return null;

  const completedSteps = plan.steps.filter(s => s.status === 'COMPLETED').length;
  const progressPct = Math.round((completedSteps / plan.steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#FCFAF6] border border-[#E3DCB8] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Terminal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#FAF6EB] to-[#FCFAF6] border-b border-[#E8E1C5] flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Field Execution Intelligence • Stage 9
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-[10px] font-mono text-zinc-600 font-semibold uppercase">
                Operational Feasibility & Verification Desk
              </span>
              {isSimulated && (
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[9px] font-bold">
                  SIMULATED EXECUTION
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight font-sans">
                Field 07 Execution Mission Control
              </h2>
              <span className="font-mono text-xs font-bold text-emerald-900">
                {completedSteps}/{plan.steps.length} Steps ({progressPct}%)
              </span>
            </div>

            <p className="text-xs text-zinc-600">
              A recommendation is not an execution. Track physical readiness, enforce verified checkpoints, and detect real-world deviations.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 flex items-center justify-center text-sm font-bold transition-all shadow-xs"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-zinc-200 bg-white/60 overflow-x-auto gap-2 py-2">
          {[
            { id: 'checklist' as const, label: `Operational Checklist (${completedSteps}/10)`, icon: CheckCircle2 },
            { id: 'matrix' as const, label: `Feasibility Matrix (${feasibility.overallStatus})`, icon: Activity },
            { id: 'events' as const, label: `Verification Log (${events.length})`, icon: Clock },
            { id: 'deviations' as const, label: `Deviations & Realization (${deviations.deviations.length})`, icon: GitCompare },
            { id: 'sandbox' as const, label: 'Judge Demo Simulator', icon: Sliders },
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
          
          {/* TAB 1: OPERATIONAL CHECKLIST */}
          {activeTab === 'checklist' && (
            <ExecutionChecklist plan={plan} onAdvanceStep={onAdvanceStep} />
          )}

          {/* TAB 2: FEASIBILITY MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 font-mono uppercase">
                    {feasibility.headline}
                  </h4>
                  <p className="text-xs text-zinc-700 mt-0.5">{feasibility.summary}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">Readiness Index</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-950">{feasibility.actionReadinessScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {feasibility.factors.map((f) => (
                  <div key={f.id} className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">{f.category}</span>
                        <h4 className="text-xs font-bold text-zinc-900 font-sans">{f.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        f.status === 'READY'
                          ? 'bg-emerald-100 text-emerald-900'
                          : f.status === 'CAUTION'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {f.status}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-mono space-y-1">
                      <div className="font-extrabold text-zinc-800">{f.evidence}</div>
                      <div className="text-[11px] text-zinc-600 font-sans">{f.details}</div>
                    </div>

                    <div className="text-[11px] text-emerald-900 font-mono">
                      <span className="font-bold">Required: </span>{f.whatIsNeeded}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIED EVENT LOG */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-zinc-500 uppercase font-bold">
                Chronological Field Execution Log (Provenanced)
              </div>

              <div className="space-y-3">
                {events.map((evt) => (
                  <div key={evt.eventId} className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-800">{evt.timestamp}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                          {evt.type}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[9px] font-bold">
                          {evt.origin}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">{evt.source}</span>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900 font-sans">{evt.title}</h4>
                    <p className="text-xs text-zinc-600 font-sans leading-relaxed">{evt.evidence}</p>
                    {evt.notes && (
                      <div className="text-[11px] font-mono text-zinc-500 bg-zinc-50 p-2 rounded-lg">
                        Note: {evt.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DEVIATIONS & REALIZATION */}
          {activeTab === 'deviations' && (
            <div className="space-y-4">
              {/* Financial Realization Summary */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-zinc-900 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-200">
                      Actual vs Expected Financial Realization
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono text-[10px] font-bold">
                    WITHIN P10–P90 CONE
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-2.5 rounded-xl bg-white/10">
                    <span className="text-[10px] font-mono text-zinc-300 uppercase block">Expected P50 Net</span>
                    <span className="text-lg font-extrabold font-mono text-white">₹{plan.expectedNetInr.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10">
                    <span className="text-[10px] font-mono text-zinc-300 uppercase block">Expected Range</span>
                    <span className="text-xs font-bold font-mono text-zinc-200">₹71,200 – ₹77,400</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/15 border border-emerald-400/40">
                    <span className="text-[10px] font-mono text-emerald-300 uppercase block">Actual Realized Net</span>
                    <span className="text-lg font-extrabold font-mono text-emerald-300">
                      ₹{(plan.expectedNetInr + deviations.cumulativeFinancialImpactInr).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10">
                    <span className="text-[10px] font-mono text-zinc-300 uppercase block">Variance (Δ)</span>
                    <span className={`text-base font-extrabold font-mono ${
                      deviations.cumulativeFinancialImpactInr >= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {deviations.cumulativeFinancialImpactInr >= 0 ? '+' : ''}₹{deviations.cumulativeFinancialImpactInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deviations List */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-zinc-500 uppercase font-bold">
                  Detected Operational Deviations ({deviations.deviations.length})
                </div>

                {deviations.deviations.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-xs text-zinc-500 font-mono text-center">
                    No execution deviations recorded. Execution matches baseline plan.
                  </div>
                ) : (
                  deviations.deviations.map((dev) => (
                    <div key={dev.id} className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-zinc-800">{dev.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            dev.severity === 'MATERIAL' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {dev.severity}
                          </span>
                        </div>
                        <span className={`font-mono text-xs font-extrabold ${
                          dev.financialImpactInr >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          Impact: {dev.financialImpactInr >= 0 ? '+' : ''}₹{dev.financialImpactInr}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-50 p-2.5 rounded-xl">
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase block">Expected Value</span>
                          <span className="font-bold text-zinc-700">{dev.expectedValue}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase block">Actual Realized</span>
                          <span className="font-extrabold text-zinc-900">{dev.actualValue}</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-600 font-sans">{dev.explanation}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: JUDGE DEMO SIMULATOR */}
          {activeTab === 'sandbox' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold">
                    Stage 9 End-to-End Execution Simulator
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  Simulated Demo Environment
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Step through the operational harvest journey in real time. Demonstrates how physical confirmation resolves unknown constraints and feeds into Decision Memory.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Confirm Transport */}
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block">Step 1: Logistics</span>
                    <h4 className="text-xs font-bold text-zinc-900 font-sans">Confirm Transport Vehicle</h4>
                    <p className="text-[11px] text-zinc-600">Resolves the 'Transport Unknown' constraint by booking 35 qtl trolley at agreed ₹1,340.</p>
                  </div>
                  <button
                    onClick={onSimulateTransportConfirmation}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-mono text-xs font-bold transition-all shadow-xs"
                  >
                    1. Confirm Transport
                  </button>
                </div>

                {/* 2. Start Harvest */}
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block">Step 2: Field Labor</span>
                    <h4 className="text-xs font-bold text-zinc-900 font-sans">Start Field Cutting</h4>
                    <p className="text-[11px] text-zinc-600">Marks Step 5 'In Progress' and logs crew mobilization on Field 07.</p>
                  </div>
                  <button
                    onClick={onSimulateHarvestStart}
                    className="w-full py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-mono text-xs font-bold transition-all shadow-xs"
                  >
                    2. Start Harvest
                  </button>
                </div>

                {/* 3. Complete Harvest */}
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block">Step 3: Threshing</span>
                    <h4 className="text-xs font-bold text-zinc-900 font-sans">Complete Harvest & Bagging</h4>
                    <p className="text-[11px] text-zinc-600">Completes Step 5 & 6, verifying 64 bags packed for transport.</p>
                  </div>
                  <button
                    onClick={onSimulateHarvestComplete}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-mono text-xs font-bold transition-all shadow-xs"
                  >
                    3. Complete Harvest
                  </button>
                </div>

                {/* 4. Dispatch */}
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block">Step 4: Transit</span>
                    <h4 className="text-xs font-bold text-zinc-900 font-sans">Dispatch to Unnao Mandi</h4>
                    <p className="text-[11px] text-zinc-600">Trolley loaded and en route (28 km via NH-27).</p>
                  </div>
                  <button
                    onClick={onSimulateDispatch}
                    className="w-full py-2 px-3 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-mono text-xs font-bold transition-all shadow-xs"
                  >
                    4. Dispatch Vehicle
                  </button>
                </div>

                {/* 5. Record Sale */}
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block">Step 5: Outcome</span>
                    <h4 className="text-xs font-bold text-zinc-900 font-sans">Record Mandi Sale</h4>
                    <p className="text-[11px] text-zinc-600">Auction clears at ₹2,350/qtl (32 qtl), logs ₹73,940 net realization into Decision Memory.</p>
                  </div>
                  <button
                    onClick={() => onSimulateMandiSale(2350, 32, 1420)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-950 hover:bg-black text-white font-mono text-xs font-bold transition-all shadow-xs"
                  >
                    5. Record Mandi Sale
                  </button>
                </div>

                {/* 6. One-Click Full Flow */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-900 font-bold uppercase block">Fast Demo</span>
                    <h4 className="text-xs font-bold text-emerald-950 font-sans">1-Click Full Harvest Sequence</h4>
                    <p className="text-[11px] text-zinc-600">Simulates steps 1 through 5 end-to-end for judge evaluation.</p>
                  </div>
                  <button
                    onClick={onSimulateFullHarvestSequence}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-700 hover:from-emerald-950 hover:to-emerald-800 text-white font-mono text-xs font-bold transition-all shadow-sm"
                  >
                    Run Full Flow
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end">
                <button
                  onClick={onResetExecution}
                  className="px-4 py-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-mono text-xs font-semibold transition-colors"
                >
                  Reset Execution State
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF6EB] border-t border-[#E8E1C5] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Kisan Compass Execution Assurance Protocol v9.0</span>
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
