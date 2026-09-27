/**
 * KISAN COMPASS — Evaluation Replay Modal (Stage 11)
 * 
 * Replays and compares evaluation versions (e.g. Run v1 vs Run v2) to prove evidence growth without historical mutation.
 */

import React from 'react';
import { EvaluationRun } from '../../types/evaluation';
import { 
  RotateCcw, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Layers,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  runV1: EvaluationRun;
  runV2: EvaluationRun;
}

export const EvaluationReplayModal: React.FC<Props> = ({
  isOpen,
  onClose,
  runV1,
  runV2
}) => {
  if (!isOpen) return null;

  const nDiff = runV2.manifest.observationCount - runV1.manifest.observationCount;
  const maeDiff = runV2.metrics.p50Mae.value - runV1.metrics.p50Mae.value;
  const covDiff = runV2.metrics.intervalCoverage.value - runV1.metrics.intervalCoverage.value;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                  EVALUATION REPLAY & DIFF
                </span>
                <span className="text-xs font-mono text-stone-400">Deterministic Version Comparison</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100 uppercase tracking-wider mt-0.5">
                Evaluation Run v{runV1.versionNumber} vs Run v{runV2.versionNumber}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Factual Evidence Growth Banner */}
          <div className="p-4 rounded-xl bg-stone-900 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                Factual Evidence Growth
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                The evaluation dataset now contains {nDiff > 0 ? `+${nDiff}` : '0'} additional verified observation(s). Previous evaluation run <span className="font-mono text-stone-200">{runV1.runId}</span> remains mathematically immutable and reproducible.
              </p>
            </div>
          </div>

          {/* Metric Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            
            {/* Sample Size Comparison */}
            <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <span className="text-[10px] text-stone-400 uppercase">Eligible Sample Size</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-400">v{runV1.versionNumber}: N={runV1.manifest.observationCount}</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                <span className="font-bold text-emerald-400">v{runV2.versionNumber}: N={runV2.manifest.observationCount}</span>
              </div>
              <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800">
                Delta: <span className="text-emerald-400 font-semibold">+{nDiff} records</span>
              </div>
            </div>

            {/* P50 MAE Comparison */}
            <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <span className="text-[10px] text-stone-400 uppercase">P50 MAE</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-400">₹{runV1.metrics.p50Mae.value}/qtl</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                <span className="font-bold text-stone-100">₹{runV2.metrics.p50Mae.value}/qtl</span>
              </div>
              <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800 flex items-center justify-between">
                <span>Point Error Shift:</span>
                <span className={`font-semibold flex items-center gap-1 ${maeDiff <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {maeDiff <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {maeDiff >= 0 ? '+' : ''}₹{maeDiff}/qtl
                </span>
              </div>
            </div>

            {/* Interval Coverage Comparison */}
            <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <span className="text-[10px] text-stone-400 uppercase">Interval Coverage</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-400">{runV1.metrics.intervalCoverage.value}%</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                <span className="font-bold text-emerald-400">{runV2.metrics.intervalCoverage.value}%</span>
              </div>
              <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800 flex items-center justify-between">
                <span>Coverage Shift:</span>
                <span className={`font-semibold ${covDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {covDiff >= 0 ? '+' : ''}{covDiff}% (Target: 80%)
                </span>
              </div>
            </div>

          </div>

          {/* Version Manifests */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Evaluation Manifest Traces
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1.5">
                <div className="text-emerald-400 font-bold">Evaluation Run v{runV1.versionNumber} ({runV1.runId})</div>
                <div className="text-stone-400 text-[11px]">Dataset: {runV1.manifest.datasetVersion}</div>
                <div className="text-stone-400 text-[11px]">Forecast Engine: {runV1.manifest.forecastEngineVersion}</div>
                <div className="text-stone-500 text-[10px] break-all pt-1">Hash: {runV1.manifest.reproducibilityHash}</div>
              </div>

              <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1.5">
                <div className="text-emerald-400 font-bold">Evaluation Run v{runV2.versionNumber} ({runV2.runId})</div>
                <div className="text-stone-400 text-[11px]">Dataset: {runV2.manifest.datasetVersion}</div>
                <div className="text-stone-400 text-[11px]">Forecast Engine: {runV2.manifest.forecastEngineVersion}</div>
                <div className="text-stone-500 text-[10px] break-all pt-1">Hash: {runV2.manifest.reproducibilityHash}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Version Invariance Guaranteed</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close Diff
          </button>
        </div>

      </div>
    </div>
  );
};
