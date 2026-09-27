/**
 * KISAN COMPASS — Outcome Intelligence Center (Stage 10)
 * 
 * Command center for self-auditing intelligence:
 * 1. Empirical Interval Coverage (Honest statistical calibration vs nominal 80%)
 * 2. Reality Ledger (Full chronological audit trail)
 * 3. Multi-horizon Performance Matrix (1-Day vs 3-Day vs 7-Day)
 * 4. "What Did We Get Right vs Wrong" decomposition
 * 5. Assumption and Signal Integrity verification
 * 6. Draft Calibration Sandbox & Parameter Governance
 */

import React, { useState } from 'react';
import { 
  OutcomeIntelligenceReport,
  HorizonBucketPerformance,
  AssumptionPerformanceItem,
  SignalAuditItem
} from '../../types/calibration';
import { useFarm } from '../../context/FarmContext';
import { CalibrationTimeline } from './CalibrationTimeline';
import { CalibrationSandbox } from './CalibrationSandbox';
import { ProveMetricModal } from './ProveMetricModal';
import { 
  Scale, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Sliders, 
  BarChart3, 
  Target, 
  Layers, 
  X,
  Database,
  FlaskConical
} from 'lucide-react';
import { MetricProvenance } from '../../types/evaluation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: OutcomeIntelligenceReport;
  onSimulateOutcome: (scenario: 'INSIDE_RANGE' | 'BELOW_P10' | 'ABOVE_P90' | 'FREIGHT_SURGE') => void;
  onApplySuggestion: (suggestionId: string) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  onResetCalibration: () => void;
}

type TabType = 'OVERVIEW' | 'TIMELINE' | 'HORIZONS' | 'ACCURACY_DECOMP' | 'ASSUMPTIONS' | 'SANDBOX';

export const OutcomeIntelligenceCenter: React.FC<Props> = ({
  isOpen,
  onClose,
  report,
  onSimulateOutcome,
  onApplySuggestion,
  onDismissSuggestion,
  onResetCalibration
}) => {
  const { setIsEvaluationLabOpen, evaluationRun } = useFarm();
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [activeMetricForProof, setActiveMetricForProof] = useState<MetricProvenance | null>(null);

  if (!isOpen) return null;

  const {
    empiricalIntervalCoverage,
    nominalCoverageTarget,
    totalVerifiedObservations,
    calibrationStatus,
    meanAbsoluteError,
    rootMeanSquareError,
    meanSignedBias,
    confidenceAudit,
    horizonBreakdown,
    rightAndWrongDecomposition,
    assumptionAudits,
    signalAudits
  } = report;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-100 uppercase tracking-wider">
                  Outcome Calibration & Self-Auditing Center
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                  STAGE 10 CORE
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Auditing whether system predictions, uncertainty intervals, and decision assumptions matched physical reality.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                setIsEvaluationLabOpen(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs font-mono rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OPEN EVALUATION LAB (STAGE 11)</span>
              <span className="sm:hidden">EVAL LAB</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Calibration Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 sm:p-4 bg-stone-900/50 border-b border-stone-800/80 text-xs font-mono">
          <div 
            onClick={() => setActiveMetricForProof(evaluationRun.metrics.intervalCoverage)}
            className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-emerald-500/50 cursor-pointer transition-colors group"
            title="Click to Prove This Metric"
          >
            <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase">
              <span>Empirical Coverage</span>
              <span className="text-[9px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">PROVE ↗</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold text-emerald-400">
                {(empiricalIntervalCoverage * 100).toFixed(0)}%
              </span>
              <span className="text-stone-400 text-[10px]">
                (Target: {(nominalCoverageTarget * 100).toFixed(0)}%)
              </span>
            </div>
            <span className="text-[10px] text-stone-400">
              {totalVerifiedObservations} verified samples
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800">
            <span className="text-stone-400 text-[10px] block uppercase">Calibration Status</span>
            <div className="mt-0.5">
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                calibrationStatus === 'WELL_CALIBRATED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  : calibrationStatus === 'TOO_NARROW'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                  : calibrationStatus === 'TOO_WIDE'
                  ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                  : 'bg-stone-800 text-stone-300'
              }`}>
                {calibrationStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 block mt-1">
              80% P10–P90 interval
            </span>
          </div>

          <div 
            onClick={() => setActiveMetricForProof(evaluationRun.metrics.p50Mae)}
            className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-emerald-500/50 cursor-pointer transition-colors group"
            title="Click to Prove This Metric"
          >
            <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase">
              <span>Mean Absolute Error</span>
              <span className="text-[9px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">PROVE ↗</span>
            </div>
            <div className="text-base font-bold text-stone-200 mt-0.5">
              ₹{meanAbsoluteError.toFixed(0)}<span className="text-xs font-normal text-stone-400">/qtl</span>
            </div>
            <span className="text-[10px] text-stone-400">
              RMSE: ₹{rootMeanSquareError.toFixed(0)}
            </span>
          </div>

          <div 
            onClick={() => setActiveMetricForProof(evaluationRun.metrics.meanSignedBias)}
            className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-emerald-500/50 cursor-pointer transition-colors group"
            title="Click to Prove This Metric"
          >
            <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase">
              <span>Signed Model Bias</span>
              <span className="text-[9px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">PROVE ↗</span>
            </div>
            <div className={`text-base font-bold mt-0.5 ${
              Math.abs(meanSignedBias) < 25 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {meanSignedBias >= 0 ? '+' : ''}₹{meanSignedBias.toFixed(0)}<span className="text-xs font-normal text-stone-400">/qtl</span>
            </div>
            <span className="text-[10px] text-stone-400">
              {meanSignedBias > 20 ? 'Overestimating' : meanSignedBias < -20 ? 'Underestimating' : 'Balanced'}
            </span>
          </div>

          <div 
            onClick={() => setActiveMetricForProof(evaluationRun.metrics.confidenceAlignment)}
            className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-cyan-500/50 cursor-pointer transition-colors group col-span-2 sm:col-span-1"
            title="Click to Prove This Metric"
          >
            <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase">
              <span>Confidence Alignment</span>
              <span className="text-[9px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">PROVE ↗</span>
            </div>
            <div className="text-sm font-semibold text-cyan-300 mt-0.5">
              {confidenceAudit.confidenceCalibrationRating}
            </div>
            <span className="text-[10px] text-stone-400 block mt-1">
              Alignment Index: {evaluationRun.metrics.confidenceAlignment.value}/100
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 px-4 gap-2 bg-stone-950 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            1. Audit Overview
          </button>

          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'TIMELINE'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            2. Reality Ledger ({report.retrospectiveAudits.length})
          </button>

          <button
            onClick={() => setActiveTab('HORIZONS')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'HORIZONS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            3. Horizon Matrix (1D / 3D / 7D)
          </button>

          <button
            onClick={() => setActiveTab('ACCURACY_DECOMP')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'ACCURACY_DECOMP'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            4. What We Got Right & Wrong
          </button>

          <button
            onClick={() => setActiveTab('ASSUMPTIONS')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'ASSUMPTIONS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            5. Assumption & Signal Integrity
          </button>

          <button
            onClick={() => setActiveTab('SANDBOX')}
            className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'SANDBOX'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            6. Calibration Sandbox & Suggestions ({report.calibrationSuggestions.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Statistical Honesty Banner */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                    Statistical Honesty Mandate
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    KISAN COMPASS does not claim generic "99% AI Accuracy". We compute empirical interval coverage against nominal 80% P10–P90 confidence boundaries across {totalVerifiedObservations} verified harvest cycles. Calibration suggestions are drafted transparently and require explicit farmer approval before modification.
                  </p>
                </div>
              </div>

              {/* High Level Verdict Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Overall Calibration Verdict
                  </div>
                  <div className="text-sm font-semibold text-stone-200">
                    {report.overallVerdict}
                  </div>
                  <div className="text-xs text-stone-400 space-y-2 pt-2 border-t border-stone-800">
                    <div className="flex justify-between font-mono">
                      <span>Nominal Interval Target:</span>
                      <span className="text-stone-200">80.0% (P10–P90)</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Observed Empirical Coverage:</span>
                      <span className="text-emerald-400 font-semibold">{(empiricalIntervalCoverage * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Coverage Deviation:</span>
                      <span className="text-stone-300">{((empiricalIntervalCoverage - nominalCoverageTarget) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Confidence & Brier Calibration
                  </div>
                  <div className="text-sm font-semibold text-stone-200">
                    {confidenceAudit.explanation}
                  </div>
                  <div className="text-xs text-stone-400 space-y-2 pt-2 border-t border-stone-800">
                    <div className="flex justify-between font-mono">
                      <span>Average System Confidence:</span>
                      <span className="text-stone-200">{confidenceAudit.averageConfidence.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Overconfident Events:</span>
                      <span className={confidenceAudit.overconfidenceCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                        {confidenceAudit.overconfidenceCount} / {confidenceAudit.totalEvaluated}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Well-Calibrated Events:</span>
                      <span className="text-emerald-400">{confidenceAudit.wellCalibratedCount} / {confidenceAudit.totalEvaluated}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Summary of Recent Learnings */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400">
                  Recent Calibration Learnings ({report.learningRecords.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.learningRecords.map(rec => (
                    <div key={rec.id} className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-400">{rec.domain}</span>
                        <span className="text-stone-400">{rec.date}</span>
                      </div>
                      <div className="text-xs font-semibold text-stone-200">{rec.observation}</div>
                      <div className="text-[11px] text-stone-400 italic">Adjustment: {rec.adjustmentNote}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REALITY LEDGER TIMELINE */}
          {activeTab === 'TIMELINE' && (
            <CalibrationTimeline 
              audits={report.retrospectiveAudits}
            />
          )}

          {/* TAB 3: HORIZON MATRIX */}
          {activeTab === 'HORIZONS' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
                  Forecast Performance by Prediction Horizon
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Auditing error amplification across 1-Day, 3-Day, and 7-Day lead times.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {horizonBreakdown.map((h: HorizonBucketPerformance) => (
                  <div key={h.horizon} className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-200">
                        {h.horizon} FORECASTS
                      </span>
                      <span className="text-[11px] font-mono text-stone-400">
                        {h.sampleSize} samples
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-stone-800/80">
                        <span className="text-stone-400">Interval Coverage:</span>
                        <span className={`font-semibold ${
                          h.empiricalCoverage >= 0.75 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {(h.empiricalCoverage * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-stone-800/80">
                        <span className="text-stone-400">Price MAE:</span>
                        <span className="text-stone-200">₹{h.priceMAE.toFixed(0)}/qtl</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-stone-800/80">
                        <span className="text-stone-400">Freight MAE:</span>
                        <span className="text-stone-200">₹{h.freightMAE.toFixed(0)}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-stone-800/80">
                        <span className="text-stone-400">Rainfall MAE:</span>
                        <span className="text-stone-200">{h.rainfallMAE.toFixed(1)} mm</span>
                      </div>

                      <div className="flex justify-between py-1">
                        <span className="text-stone-400">Uncertainty State:</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          h.calibrationState === 'WELL_CALIBRATED' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {h.calibrationState.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WHAT WE GOT RIGHT & WRONG */}
          {activeTab === 'ACCURACY_DECOMP' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What We Got Right */}
              <div className="p-5 bg-stone-900/60 border border-emerald-500/30 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-mono uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  What Did We Get Right (Structural Successes)
                </div>
                <div className="space-y-3">
                  {rightAndWrongDecomposition.whatWeGotRight.map((item, idx) => (
                    <div key={idx} className="p-3 bg-stone-950/70 border border-emerald-900/40 rounded-lg space-y-1">
                      <div className="text-xs font-semibold text-emerald-200">{item.claim}</div>
                      <p className="text-xs text-stone-300">{item.evidence}</p>
                      <div className="text-[10px] font-mono text-emerald-400/80 mt-1">
                        Impact: {item.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What We Got Wrong */}
              <div className="p-5 bg-stone-900/60 border border-amber-500/30 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs font-mono uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  What Did We Get Wrong (Variance & Biases)
                </div>
                <div className="space-y-3">
                  {rightAndWrongDecomposition.whatWeGotWrong.map((item, idx) => (
                    <div key={idx} className="p-3 bg-stone-950/70 border border-amber-900/40 rounded-lg space-y-1">
                      <div className="text-xs font-semibold text-amber-200">{item.claim}</div>
                      <p className="text-xs text-stone-300">{item.evidence}</p>
                      <div className="text-[10px] font-mono text-stone-400">
                        Root cause: <span className="text-stone-300">{item.rootCause}</span>
                      </div>
                      <div className="text-[10px] font-mono text-amber-400/80 mt-1">
                        Remediation: {item.remediation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ASSUMPTIONS & SIGNAL INTEGRITY */}
          {activeTab === 'ASSUMPTIONS' && (
            <div className="space-y-6">
              {/* Assumptions Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  Decision Assumption Verification ({assumptionAudits.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assumptionAudits.map((item: AssumptionPerformanceItem) => (
                    <div key={item.assumptionName} className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-200">{item.assumptionName}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          item.status === 'VALIDATED' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : item.status === 'VIOLATED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-stone-400">
                        <div>Assumed: <span className="text-stone-300">{item.assumedValue}</span></div>
                        <div>Observed: <span className="text-stone-200">{item.observedValue}</span></div>
                      </div>
                      <div className="text-xs text-stone-300 italic">
                        {item.impactOnDecision}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signal Audits Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Signal Telemetry Reliability & Outcome Impact ({signalAudits.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {signalAudits.map((sig: SignalAuditItem) => (
                    <div key={sig.signalName} className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-200 font-semibold">{sig.signalName}</span>
                        <span className="text-stone-400 text-[10px]">{sig.source}</span>
                      </div>
                      <div className="flex justify-between text-stone-400 text-[11px]">
                        <span>Availability:</span>
                        <span className="text-emerald-400">{(sig.availabilityRate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-stone-400 text-[11px]">
                        <span>Avg Forecast Error:</span>
                        <span className="text-stone-200">{sig.averageForecastError.toFixed(1)}%</span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Impact: <span className="text-stone-300">{sig.impactOnFinalRealization}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SANDBOX & DRAFT CALIBRATION */}
          {activeTab === 'SANDBOX' && (
            <CalibrationSandbox
              report={report}
              onSimulateOutcome={onSimulateOutcome}
              onApplySuggestion={onApplySuggestion}
              onDismissSuggestion={onDismissSuggestion}
              onResetCalibration={onResetCalibration}
            />
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Ex-ante vs Ex-post Audit • Zero Hidden Retraining • Farmer Autonomous Governance</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close Audit Center
          </button>
        </div>

      </div>

      {/* Prove Metric Modal */}
      {activeMetricForProof && (
        <ProveMetricModal
          metric={activeMetricForProof}
          observations={evaluationRun.dataset.eligibleObservations}
          onClose={() => setActiveMetricForProof(null)}
        />
      )}
    </div>
  );
};
