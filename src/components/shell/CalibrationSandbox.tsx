/**
 * KISAN COMPASS — Calibration Sandbox (Judge & Farmer Simulation Tool)
 * 
 * Allows judges and farmers to simulate new outcome realizations and verify that:
 * 1. The system updates empirical coverage rates honestly without hidden model tampering.
 * 2. Forecast errors are computed deterministically.
 * 3. Draft calibration suggestions are proposed transparently for human approval.
 */

import React, { useState } from 'react';
import { CalibrationSuggestion, OutcomeIntelligenceReport } from '../../types/calibration';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  FlaskConical,
  Zap,
  TrendingDown,
  TrendingUp,
  Truck
} from 'lucide-react';

interface Props {
  report: OutcomeIntelligenceReport;
  onSimulateOutcome: (scenario: 'INSIDE_RANGE' | 'BELOW_P10' | 'ABOVE_P90' | 'FREIGHT_SURGE') => void;
  onApplySuggestion: (suggestionId: string) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  onResetCalibration: () => void;
}

export const CalibrationSandbox: React.FC<Props> = ({
  report,
  onSimulateOutcome,
  onApplySuggestion,
  onDismissSuggestion,
  onResetCalibration
}) => {
  const [selectedScenario, setSelectedScenario] = useState<'INSIDE_RANGE' | 'BELOW_P10' | 'ABOVE_P90' | 'FREIGHT_SURGE'>('INSIDE_RANGE');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      onSimulateOutcome(selectedScenario);
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Header */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-stone-900/60 to-cyan-950/40 border border-emerald-500/20">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
          <FlaskConical className="w-4 h-4" />
          Interactive Calibration Sandbox & Judge Testbed
        </div>
        <p className="text-xs text-stone-300">
          Simulate counterfactual outcome realizations to observe how empirical interval coverage, Brier scores, and calibration suggestions react in real time.
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          1. Select Test Outcome Scenario
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setSelectedScenario('INSIDE_RANGE')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario === 'INSIDE_RANGE'
                ? 'bg-emerald-950/50 border-emerald-500 text-stone-100 ring-1 ring-emerald-500/30'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Scenario A: Realization Inside P10–P90
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Field realized ₹2,420/qtl (predicted ₹2,400). Normal variance within expected 80% uncertainty bounds.
            </p>
          </button>

          <button
            onClick={() => setSelectedScenario('BELOW_P10')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario === 'BELOW_P10'
                ? 'bg-amber-950/50 border-amber-500 text-stone-100 ring-1 ring-amber-500/30'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs text-amber-300">
              <TrendingDown className="w-3.5 h-3.5" />
              Scenario B: Market Slump Below P10
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Sudden arrival surge caused realized mandi price to drop to ₹2,050/qtl (below P10 ₹2,180).
            </p>
          </button>

          <button
            onClick={() => setSelectedScenario('ABOVE_P90')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario === 'ABOVE_P90'
                ? 'bg-cyan-950/50 border-cyan-500 text-stone-100 ring-1 ring-cyan-500/30'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs text-cyan-300">
              <TrendingUp className="w-3.5 h-3.5" />
              Scenario C: Market Rally Above P90
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Severe export demand spike elevated realization to ₹2,880/qtl (above P90 ₹2,620).
            </p>
          </button>

          <button
            onClick={() => setSelectedScenario('FREIGHT_SURGE')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario === 'FREIGHT_SURGE'
                ? 'bg-rose-950/50 border-rose-500 text-stone-100 ring-1 ring-rose-500/30'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs text-rose-300">
              <Truck className="w-3.5 h-3.5" />
              Scenario D: Freight & Logistics Surge
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Fuel price shock and driver shortage escalated transport costs by +35% over forecast.
            </p>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold text-xs rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                Simulating Realization & Recalibrating...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Inject Realized Outcome into Ledger
              </>
            )}
          </button>

          <button
            onClick={onResetCalibration}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-colors border border-stone-700"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Baseline Ledger
          </button>
        </div>
      </div>

      {/* Draft Calibration Suggestions Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            2. Draft Calibration Recommendations (Requires Farmer Approval)
          </h4>
          <span className="text-[10px] font-mono text-stone-400">
            {report.calibrationSuggestions.length} Pending Actions
          </span>
        </div>

        {report.calibrationSuggestions.length === 0 ? (
          <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 text-center text-xs text-stone-400">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
            No active calibration adjustments required. System empirical coverage satisfies baseline target (80% nominal).
          </div>
        ) : (
          <div className="space-y-3">
            {report.calibrationSuggestions.map((sug: CalibrationSuggestion) => (
              <div 
                key={sug.id}
                className="p-4 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 space-y-3 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        sug.priority === 'HIGH' 
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                          : sug.priority === 'MEDIUM'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                          : 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                      }`}>
                        {sug.priority} PRIORITY
                      </span>
                      <span className="text-xs font-mono text-stone-400">{sug.targetParameter}</span>
                    </div>
                    <div className="text-xs font-semibold text-stone-200 mt-1">
                      {sug.title}
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono">
                    <span className="text-stone-400 line-through mr-2">
                      {sug.currentValue > 1 ? `₹${sug.currentValue}` : `${(sug.currentValue * 100).toFixed(0)}%`}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {sug.suggestedValue > 1 ? `₹${sug.suggestedValue}` : `${(sug.suggestedValue * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {sug.rationale}
                </p>

                <div className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-stone-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    Impact: {sug.expectedImpact}
                  </span>
                  <span className="text-stone-400">
                    Status: <span className="text-stone-300 font-semibold">{sug.status}</span>
                  </span>
                </div>

                {sug.status === 'PROPOSED' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onDismissSuggestion(sug.id)}
                      className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono rounded transition-colors"
                    >
                      Dismiss Draft
                    </button>
                    <button
                      onClick={() => onApplySuggestion(sug.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-semibold text-xs font-mono rounded transition-colors flex items-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Approve & Adopt Parameter
                    </button>
                  </div>
                )}
                {sug.status === 'APPLIED' && (
                  <div className="flex items-center justify-end gap-1 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Parameter Applied to Decision Engine
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
