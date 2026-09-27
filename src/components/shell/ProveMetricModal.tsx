/**
 * KISAN COMPASS — "Prove This Number" Modal (Stage 11)
 * 
 * Demonstrates complete lineage: METRIC -> DATASET -> OBSERVATIONS -> FORMULA -> CALCULATION -> RESULT.
 */

import React, { useState } from 'react';
import { MetricProvenance, EvaluationObservation } from '../../types/evaluation';
import { 
  Scale, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Calculator, 
  Database, 
  FileText, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Props {
  metric: MetricProvenance | null;
  observations?: EvaluationObservation[];
  onClose: () => void;
  onSelectObservation?: (obsId: string) => void;
}

export const ProveMetricModal: React.FC<Props> = ({
  metric,
  observations = [],
  onClose,
  onSelectObservation
}) => {
  const [activeTab, setActiveTab] = useState<'CALCULATION' | 'OBSERVATIONS' | 'LIMITATIONS'>('CALCULATION');

  if (!metric) return null;

  const relevantObs = observations.filter(o => metric.observationIds.includes(o.observationId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                  MATHEMATICAL PROVENANCE
                </span>
                <span className="text-xs font-mono text-stone-400">{metric.datasetVersion}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100 uppercase tracking-wider mt-0.5">
                Prove This Metric: {metric.metricName}
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

        {/* Metric Summary Card */}
        <div className="p-4 bg-stone-900/50 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-stone-400">Claimed Value</div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {metric.formattedValue}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5 font-mono">
              Formula: <span className="text-stone-300 font-semibold">{metric.formula}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-center">
              <span className="text-[10px] text-stone-400 block uppercase">Sample Size</span>
              <span className="font-bold text-stone-200">N = {metric.sampleSize}</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-center">
              <span className="text-[10px] text-stone-400 block uppercase">Min Required</span>
              <span className="font-bold text-stone-200">N ≥ {metric.minimumSampleSize}</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-center">
              <span className="text-[10px] text-stone-400 block uppercase">Origin</span>
              <span className="font-bold text-cyan-300">{metric.origin}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 px-4 gap-2 bg-stone-950 text-xs font-semibold select-none">
          <button
            onClick={() => setActiveTab('CALCULATION')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'CALCULATION'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            1. Arithmetic Calculation Trace ({metric.calculationTrace.length} Steps)
          </button>

          <button
            onClick={() => setActiveTab('OBSERVATIONS')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'OBSERVATIONS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            2. Underlying Observations ({relevantObs.length || metric.sampleSize})
          </button>

          <button
            onClick={() => setActiveTab('LIMITATIONS')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'LIMITATIONS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            3. Interpretation & Scientific Limitations
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: CALCULATION TRACE */}
          {activeTab === 'CALCULATION' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-emerald-500/20 text-xs text-stone-300 leading-relaxed font-mono">
                <span className="text-emerald-400 font-bold uppercase block mb-1">
                  Why This Number Exists:
                </span>
                {metric.whyThisNumberExists}
              </div>

              <div className="space-y-3">
                {metric.calculationTrace.map((step) => (
                  <div key={step.stepNumber} className="p-4 bg-stone-900/70 border border-stone-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-200">
                      <span>Step {step.stepNumber}: {step.label}</span>
                      <span className="text-emerald-400">{step.result}</span>
                    </div>

                    <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800/80 font-mono text-xs text-stone-300 space-y-1">
                      <div className="text-[10px] text-stone-500 uppercase">Formula</div>
                      <div className="text-stone-400">{step.formula}</div>
                      <div className="text-[10px] text-stone-500 uppercase pt-1">Substitution</div>
                      <div className="text-emerald-300/90 break-all">{step.substitution}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: OBSERVATIONS */}
          {activeTab === 'OBSERVATIONS' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-400 font-mono flex items-center justify-between">
                <span>Direct Data Points Contributing to Metric:</span>
                <span>Dataset: {metric.datasetId}</span>
              </div>

              {relevantObs.length === 0 ? (
                <div className="p-6 text-center bg-stone-900/40 border border-stone-800 rounded-xl text-xs text-stone-400 font-mono">
                  Observation records: {metric.observationIds.join(', ')}
                </div>
              ) : (
                <div className="overflow-x-auto border border-stone-800 rounded-xl">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Obs ID</th>
                        <th className="p-2.5">Decision ID</th>
                        <th className="p-2.5">Horizon</th>
                        <th className="p-2.5">Predicted (P50)</th>
                        <th className="p-2.5">Realized Net</th>
                        <th className="p-2.5">Error</th>
                        <th className="p-2.5">Interval</th>
                        <th className="p-2.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 text-stone-300">
                      {relevantObs.map((obs) => (
                        <tr key={obs.observationId} className="hover:bg-stone-900/50">
                          <td className="p-2.5 font-bold text-emerald-400">{obs.observationId}</td>
                          <td className="p-2.5 text-stone-400">{obs.decisionId}</td>
                          <td className="p-2.5">{obs.horizonBucket}</td>
                          <td className="p-2.5 text-stone-300">₹{obs.forecastP50.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 font-bold text-stone-100">₹{obs.realizedNetInr.toLocaleString('en-IN')}</td>
                          <td className={`p-2.5 font-bold ${obs.signedError >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {obs.signedError >= 0 ? '+' : ''}₹{obs.signedError}
                          </td>
                          <td className="p-2.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              obs.isInsideInterval ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                            }`}>
                              {obs.intervalPosition}
                            </span>
                          </td>
                          <td className="p-2.5">
                            {onSelectObservation && (
                              <button
                                onClick={() => {
                                  onSelectObservation(obs.observationId);
                                  onClose();
                                }}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 cursor-pointer"
                              >
                                Trace <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIMITATIONS */}
          {activeTab === 'LIMITATIONS' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-200 uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Interpretation
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {metric.interpretation}
                </p>
              </div>

              <div className="p-4 bg-stone-900 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Known Limitations of this Claim
                </div>
                <ul className="space-y-1.5 text-xs text-stone-300 list-disc list-inside">
                  {metric.limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Provenance Protocol v11.0</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close Proof
          </button>
        </div>

      </div>
    </div>
  );
};
