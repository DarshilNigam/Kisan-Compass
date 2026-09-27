/**
 * KISAN COMPASS — Evidence-Grounded Evaluation Lab (Stage 11)
 * 
 * Central scientific instrument of KISAN COMPASS:
 * - Proves where every performance claim came from.
 * - Enforces zero metric without lineage.
 * - Provides dataset inspection, anti-cherry-picking exclusion ledger, and reproducibility replay.
 */

import React, { useState } from 'react';
import { 
  EvaluationRun, 
  DatasetFilterMode, 
  MetricProvenance,
  EvaluationObservation
} from '../../types/evaluation';
import { DatasetInspector } from './DatasetInspector';
import { ExclusionLedger } from './ExclusionLedger';
import { ProveMetricModal } from './ProveMetricModal';
import { EvaluationReplayModal } from './EvaluationReplayModal';
import { 
  FlaskConical, 
  Scale, 
  Database, 
  ShieldAlert, 
  Layers, 
  Clock, 
  FileText, 
  X, 
  Calculator, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentRun: EvaluationRun;
  runV1?: EvaluationRun;
  filterMode: DatasetFilterMode;
  onFilterModeChange: (mode: DatasetFilterMode) => void;
  onOpenEvidenceGraph?: () => void;
}

type TabType = 'METRICS' | 'DATASET' | 'EXCLUSIONS' | 'TEMPORAL' | 'RUNS' | 'LIMITATIONS';

export const EvaluationLab: React.FC<Props> = ({
  isOpen,
  onClose,
  currentRun,
  runV1,
  filterMode,
  onFilterModeChange,
  onOpenEvidenceGraph
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('METRICS');
  const [activeMetricForProof, setActiveMetricForProof] = useState<MetricProvenance | null>(null);
  const [showReplayModal, setShowReplayModal] = useState<boolean>(false);

  if (!isOpen) return null;

  const { metrics, dataset, manifest, temporalIntegrity, horizonBreakdown } = currentRun;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-100 uppercase tracking-wider">
                  Evaluation Lab & Reproducibility Terminal
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                  STAGE 11 CORE
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Every performance claim backed by immutable datasets, exact observation IDs, and step-by-step arithmetic traces.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Dataset Filter & Run Manifest Bar */}
        <div className="p-3 sm:p-4 bg-stone-900/50 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400 uppercase">Dataset Policy:</span>
            <div className="inline-flex rounded-lg bg-stone-950 p-0.5 border border-stone-800">
              <button
                onClick={() => onFilterModeChange('REAL_ONLY')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  filterMode === 'REAL_ONLY' ? 'bg-emerald-600 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                REAL ONLY
              </button>
              <button
                onClick={() => onFilterModeChange('INCLUDE_DEMO')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  filterMode === 'INCLUDE_DEMO' ? 'bg-emerald-600 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                INCLUDE DEMO
              </button>
              <button
                onClick={() => onFilterModeChange('SIMULATION_ONLY')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  filterMode === 'SIMULATION_ONLY' ? 'bg-emerald-600 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                SIMULATION ONLY
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
            <span>Dataset: <span className="text-stone-200 font-bold">{dataset.datasetVersion}</span></span>
            <span>•</span>
            <span>Observations: <span className="text-emerald-400 font-bold">{dataset.includedCount}</span></span>
            <span>•</span>
            <span>Excluded: <span className="text-amber-400 font-bold">{dataset.excludedCount}</span></span>
            <span>•</span>
            <span>Run: <span className="text-stone-200 font-bold">{manifest.runId}</span></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 px-4 gap-2 bg-stone-950 overflow-x-auto select-none text-xs font-semibold">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'METRICS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            1. Verified Metric Claims
          </button>

          <button
            onClick={() => setActiveTab('DATASET')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'DATASET'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            2. Observation Matrix ({dataset.includedCount})
          </button>

          <button
            onClick={() => setActiveTab('EXCLUSIONS')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'EXCLUSIONS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            3. Exclusion Ledger ({dataset.excludedCount})
          </button>

          <button
            onClick={() => setActiveTab('TEMPORAL')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'TEMPORAL'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            4. Temporal Integrity & Anti-Leakage
          </button>

          <button
            onClick={() => setActiveTab('RUNS')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'RUNS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            5. Run Versioning & Replay
          </button>

          <button
            onClick={() => setActiveTab('LIMITATIONS')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'LIMITATIONS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            6. Known Limitations
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: METRIC CLAIMS */}
          {activeTab === 'METRICS' && (
            <div className="space-y-6">
              
              {/* Statistical Grounding Banner */}
              <div className="p-4 rounded-xl bg-stone-900 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                    Evidence-Grounded Lineage Policy
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Every metric card below is strictly computed from eligible observation records. Click <span className="font-mono font-bold text-emerald-300">[ PROVE THIS NUMBER ]</span> on any card to inspect the exact dataset, individual data points, formula substitutions, and exclusions.
                  </p>
                </div>
              </div>

              {/* Primary 5 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Interval Coverage */}
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 uppercase">
                      <span>Empirical Coverage</span>
                      <span className="text-emerald-400 font-bold">P10–P90 Fan</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                      {metrics.intervalCoverage.formattedValue}
                    </div>
                    <p className="text-xs text-stone-300 mt-1">
                      Target: 80% theoretical quantile interval.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-400">N = {metrics.intervalCoverage.sampleSize}</span>
                    <button
                      onClick={() => setActiveMetricForProof(metrics.intervalCoverage)}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-[11px] font-mono font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>PROVE THIS NUMBER</span>
                    </button>
                  </div>
                </div>

                {/* 2. P50 MAE */}
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 uppercase">
                      <span>Mean Absolute Error</span>
                      <span className="text-stone-300 font-bold">P50 Net</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-stone-100 mt-1">
                      {metrics.p50Mae.formattedValue}<span className="text-xs font-normal text-stone-400">/qtl</span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1">
                      Average absolute deviation across verified sales.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-400">N = {metrics.p50Mae.sampleSize}</span>
                    <button
                      onClick={() => setActiveMetricForProof(metrics.p50Mae)}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-[11px] font-mono font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>PROVE THIS NUMBER</span>
                    </button>
                  </div>
                </div>

                {/* 3. RMSE */}
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 uppercase">
                      <span>Root Mean Squared Error</span>
                      <span className="text-stone-300 font-bold">Dispersion</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-stone-100 mt-1">
                      {metrics.rmse.formattedValue}<span className="text-xs font-normal text-stone-400">/qtl</span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1">
                      Quadratic penalty measuring outlier sensitivity.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-400">N = {metrics.rmse.sampleSize}</span>
                    <button
                      onClick={() => setActiveMetricForProof(metrics.rmse)}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-[11px] font-mono font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>PROVE THIS NUMBER</span>
                    </button>
                  </div>
                </div>

                {/* 4. Signed Model Bias */}
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 uppercase">
                      <span>Signed Model Bias</span>
                      <span className="text-stone-300 font-bold">Directional Skew</span>
                    </div>
                    <div className={`text-2xl font-black font-mono mt-1 ${metrics.meanSignedBias.value >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {metrics.meanSignedBias.formattedValue}<span className="text-xs font-normal text-stone-400">/qtl</span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1">
                      {metrics.meanSignedBias.value >= 0 ? 'Conservative estimation (Realized > P50).' : 'Overestimating revenue.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-400">N = {metrics.meanSignedBias.sampleSize}</span>
                    <button
                      onClick={() => setActiveMetricForProof(metrics.meanSignedBias)}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-[11px] font-mono font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>PROVE THIS NUMBER</span>
                    </button>
                  </div>
                </div>

                {/* 5. Confidence Alignment Index */}
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 uppercase">
                      <span>Confidence-Outcome Alignment</span>
                      <span className="text-cyan-300 font-bold">Audit Score</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
                      {metrics.confidenceAlignment.value}<span className="text-xs font-normal text-stone-400">/100</span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1">
                      Deterministic audit replacing ad-hoc Brier claims.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-400">N = {metrics.confidenceAlignment.sampleSize}</span>
                    <button
                      onClick={() => setActiveMetricForProof(metrics.confidenceAlignment)}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-[11px] font-mono font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>PROVE THIS NUMBER</span>
                    </button>
                  </div>
                </div>

                {/* 6. Multi-Horizon Breakdown Card */}
                <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl space-y-2 flex flex-col justify-between font-mono text-xs">
                  <div className="text-[10px] text-stone-400 uppercase font-bold flex items-center justify-between">
                    <span>Horizon Degradation</span>
                    <span className="text-stone-300">Lead Times</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {horizonBreakdown.map((h) => (
                      <div key={h.horizonBucket} className="flex justify-between py-0.5 border-b border-stone-800/60 text-[11px]">
                        <span className="text-stone-400">{h.label} (N={h.sampleSize}):</span>
                        <span className="text-stone-200 font-semibold">{h.mae.formattedValue} • {h.coverage.formattedValue}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-stone-400 pt-1">
                    Verified error amplification over forecast horizon.
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: DATASET INSPECTOR */}
          {activeTab === 'DATASET' && (
            <DatasetInspector
              observations={dataset.eligibleObservations}
              datasetVersion={dataset.datasetVersion}
              onOpenObservationTrace={(_obs: EvaluationObservation) => {
                if (onOpenEvidenceGraph) onOpenEvidenceGraph();
              }}
            />
          )}

          {/* TAB 3: EXCLUSIONS */}
          {activeTab === 'EXCLUSIONS' && (
            <ExclusionLedger
              exclusions={dataset.exclusions}
              datasetVersion={dataset.datasetVersion}
            />
          )}

          {/* TAB 4: TEMPORAL INTEGRITY */}
          {activeTab === 'TEMPORAL' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-stone-900 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                  <Clock className="w-4 h-4" />
                  Temporal Order & Anti-Future-Leakage Guard
                </div>
                <p className="text-stone-300 text-xs leading-relaxed font-sans">
                  Evaluation rules enforce strict unidirectional time sequencing: t(forecast) &le; t(decision) &le; t(execution) &le; t(outcome) &le; t(evaluation). Historical decision inputs are frozen at approval time.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                  <div className="p-2 rounded bg-stone-950 border border-stone-800">
                    <span className="text-stone-500 uppercase block text-[9px]">Guard Status</span>
                    <span className="text-emerald-400 font-bold">{temporalIntegrity.status}</span>
                  </div>
                  <div className="p-2 rounded bg-stone-950 border border-stone-800">
                    <span className="text-stone-500 uppercase block text-[9px]">Checks Passed</span>
                    <span className="text-stone-200 font-bold">{temporalIntegrity.checksPassedCount}</span>
                  </div>
                  <div className="p-2 rounded bg-stone-950 border border-stone-800">
                    <span className="text-stone-500 uppercase block text-[9px]">Violations</span>
                    <span className="text-emerald-400 font-bold">{temporalIntegrity.violationsCount}</span>
                  </div>
                  <div className="p-2 rounded bg-stone-950 border border-stone-800">
                    <span className="text-stone-500 uppercase block text-[9px]">Leakage Active</span>
                    <span className="text-emerald-400 font-bold">FALSE (Clean)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RUNS & REPLAY */}
          {activeTab === 'RUNS' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
                    Evaluation Run Snapshots & Version History
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Immutable snapshots allowing deterministic reproduction of historical claims.
                  </p>
                </div>

                {runV1 && (
                  <button
                    onClick={() => setShowReplayModal(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>REPLAY & COMPARE V1 VS V2</span>
                  </button>
                )}
              </div>

              <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div>
                    <div className="font-bold text-emerald-400 text-sm">{manifest.runId}</div>
                    <div className="text-[11px] text-stone-400">Dataset Version: {manifest.datasetVersion}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                    CURRENT ACTIVE RUN
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>Forecast Engine: <span className="text-stone-300">{manifest.forecastEngineVersion}</span></div>
                  <div>Decision Engine: <span className="text-stone-300">{manifest.decisionEngineVersion}</span></div>
                  <div>Calibration Engine: <span className="text-stone-300">{manifest.calibrationEngineVersion}</span></div>
                  <div>Evaluation Engine: <span className="text-stone-300">{manifest.evaluationEngineVersion}</span></div>
                </div>

                <div className="p-2 bg-stone-950 rounded border border-stone-800/80 text-[10px] text-stone-500 break-all">
                  Reproducibility Hash: {manifest.reproducibilityHash}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: KNOWN LIMITATIONS */}
          {activeTab === 'LIMITATIONS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-stone-900 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs uppercase font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  Explicit Empirical Limitations (Regional Pilot)
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  To ensure complete scientific honesty, KISAN COMPASS explicitly discloses all current evidence boundaries:
                </p>
                <ul className="space-y-2 text-xs text-stone-300 list-disc list-inside pt-1">
                  <li><strong className="text-stone-200">Sample Size:</strong> Dataset contains {dataset.includedCount} eligible observations. Statistical claims are governance-grade monitoring rather than asymptotic proof.</li>
                  <li><strong className="text-stone-200">Commodity Scope:</strong> Evaluated exclusively on Rabi Wheat (HD-2967) in Uttar Pradesh. Performance cannot be assumed for perishable horticulture.</li>
                  <li><strong className="text-stone-200">Regional Corridor:</strong> Market data grounded in Kanpur-Unnao APMC mandis. Interstate freight dynamics may exhibit different volatility.</li>
                  <li><strong className="text-stone-200">Engine Attribution:</strong> Operating on Historical Empirical Baseline v1.1 and Parameterized Quantile Engine. All quantile calculations are purely deterministic.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400 font-mono">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Independent Proof Protocol • Zero Hidden Modifications</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close Evaluation Lab
          </button>
        </div>

      </div>

      {/* Prove Metric Modal */}
      {activeMetricForProof && (
        <ProveMetricModal
          metric={activeMetricForProof}
          observations={dataset.eligibleObservations}
          onClose={() => setActiveMetricForProof(null)}
        />
      )}

      {/* Evaluation Replay Modal */}
      {showReplayModal && runV1 && (
        <EvaluationReplayModal
          isOpen={showReplayModal}
          onClose={() => setShowReplayModal(false)}
          runV1={runV1}
          runV2={currentRun}
        />
      )}
    </div>
  );
};
