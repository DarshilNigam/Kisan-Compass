/**
 * KISAN COMPASS — Dataset Inspector (Stage 11)
 * 
 * Inspectable tabular matrix of all eligible EvaluationObservations with clickable lineage to original forecasts and outcomes.
 */

import React, { useState } from 'react';
import { EvaluationObservation } from '../../types/evaluation';
import { 
  Database, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface Props {
  observations: EvaluationObservation[];
  datasetVersion: string;
  onOpenObservationTrace?: (obs: EvaluationObservation) => void;
}

export const DatasetInspector: React.FC<Props> = ({
  observations,
  datasetVersion,
  onOpenObservationTrace
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = observations.filter(o => {
    if (selectedHorizon !== 'ALL' && o.horizonBucket !== selectedHorizon) return false;
    if (selectedStatus === 'INSIDE' && !o.isInsideInterval) return false;
    if (selectedStatus === 'OUTSIDE' && o.isInsideInterval) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div>
          <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Evaluation Observation Matrix ({observations.length} Eligible Records)
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Immutable dataset snapshot: <span className="font-mono text-stone-300 font-bold">{datasetVersion}</span>
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-1">
            <Filter className="w-3 h-3 text-stone-400 ml-1" />
            <select
              value={selectedHorizon}
              onChange={(e) => setSelectedHorizon(e.target.value)}
              className="bg-transparent text-stone-300 text-xs font-mono outline-hidden pr-2 cursor-pointer"
            >
              <option value="ALL" className="bg-stone-900">All Horizons</option>
              <option value="0-1d" className="bg-stone-900">0-1d Lead Time</option>
              <option value="2-4d" className="bg-stone-900">2-4d Lead Time</option>
              <option value="5-7d" className="bg-stone-900">5-7d Lead Time</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-stone-300 text-xs font-mono outline-hidden pr-2 cursor-pointer"
            >
              <option value="ALL" className="bg-stone-900">All Positions</option>
              <option value="INSIDE" className="bg-stone-900">Inside P10–P90</option>
              <option value="OUTSIDE" className="bg-stone-900">Outside Interval</option>
            </select>
          </div>
        </div>
      </div>

      {/* Observation Table */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-stone-400 font-mono bg-stone-900/40 border border-stone-800 rounded-xl">
          No observations matching selected filters.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((obs) => {
            const isExpanded = expandedId === obs.observationId;
            return (
              <div 
                key={obs.observationId}
                className="bg-stone-900/80 border border-stone-800 rounded-xl overflow-hidden hover:border-stone-700 transition-colors"
              >
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : obs.observationId)}
                  className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${obs.isInsideInterval ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                      {obs.isInsideInterval ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400">{obs.observationId}</span>
                        <span className="text-stone-400">({obs.decisionId})</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">
                          {obs.horizonBucket}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-semibold">
                          {obs.origin}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {obs.crop} • {obs.mandi} • {obs.outcomeTime.split('T')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Prediction vs Actual Numbers */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">Predicted P50</div>
                      <div className="text-stone-300">₹{obs.forecastP50.toLocaleString('en-IN')}</div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-stone-500" />
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">Realized Net</div>
                      <div className="font-bold text-stone-100">₹{obs.realizedNetInr.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="pl-2 border-l border-stone-800">
                      <div className="text-[10px] text-stone-500 uppercase">Signed Error</div>
                      <div className={`font-bold ${obs.signedError >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {obs.signedError >= 0 ? '+' : ''}₹{obs.signedError} ({obs.percentageError.toFixed(1)}%)
                      </div>
                    </div>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </div>
                </div>

                {/* Expanded Provenance Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-stone-800/60 bg-stone-950/60 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 font-mono">
                      <div className="p-2.5 rounded bg-stone-900 border border-stone-800 space-y-1">
                        <span className="text-[10px] text-stone-400 uppercase block">1. Forecast Quantiles</span>
                        <div className="text-stone-200">P10: ₹{obs.forecastP10.toLocaleString('en-IN')}</div>
                        <div className="text-stone-200">P50: ₹{obs.forecastP50.toLocaleString('en-IN')}</div>
                        <div className="text-stone-200">P90: ₹{obs.forecastP90.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-stone-500 mt-1">Model: {obs.forecastModel}</div>
                      </div>

                      <div className="p-2.5 rounded bg-stone-900 border border-stone-800 space-y-1">
                        <span className="text-[10px] text-stone-400 uppercase block">2. Realized Settlement</span>
                        <div className="text-stone-200">Price: ₹{obs.realizedPricePerQuintal}/qtl</div>
                        <div className="text-stone-200">Gross: ₹{obs.realizedGrossInr.toLocaleString('en-IN')}</div>
                        <div className="text-stone-200">Freight: ₹{obs.realizedFreightInr.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-emerald-400 mt-1">{obs.provenanceChain.settlementReceipt}</div>
                      </div>

                      <div className="p-2.5 rounded bg-stone-900 border border-stone-800 space-y-1">
                        <span className="text-[10px] text-stone-400 uppercase block">3. Provenance Sources</span>
                        <div className="text-[11px] text-stone-300 truncate">Weather: {obs.provenanceChain.weatherSource}</div>
                        <div className="text-[11px] text-stone-300 truncate">Market: {obs.provenanceChain.marketSource}</div>
                        <div className="text-[11px] text-stone-300 truncate">Forecast: {obs.provenanceChain.forecastSource}</div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                          <ShieldCheck className="w-3 h-3" /> Fully Lineage Verified
                        </div>
                      </div>
                    </div>

                    {onOpenObservationTrace && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onOpenObservationTrace(obs)}
                          className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 cursor-pointer"
                        >
                          View Full Evidence Chain in Graph <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
