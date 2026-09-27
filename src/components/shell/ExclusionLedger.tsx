/**
 * KISAN COMPASS — Exclusion Ledger (Stage 11)
 * 
 * Anti-Cherry-Picking Transparency Guard:
 * Explicitly lists every excluded decision record along with the factual inclusion rule, reason, and timestamp.
 */

import React from 'react';
import { ObservationExclusion } from '../../types/evaluation';
import { ShieldAlert, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  exclusions: ObservationExclusion[];
  datasetVersion: string;
}

export const ExclusionLedger: React.FC<Props> = ({ exclusions, datasetVersion }) => {
  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-stone-900/60 to-stone-900/40 border border-amber-500/20 space-y-1.5">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
          <ShieldAlert className="w-4 h-4" />
          Anti-Cherry-Picking Exclusion Ledger ({exclusions.length} Records Excluded)
        </div>
        <p className="text-xs text-stone-300 leading-relaxed">
          KISAN COMPASS never silently excludes inconvenient observations or large errors. Every non-included record is documented below with an explicit rule, timestamp, and justification.
        </p>
      </div>

      {exclusions.length === 0 ? (
        <div className="p-6 text-center text-xs text-stone-400 font-mono bg-stone-900/40 border border-stone-800 rounded-xl">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
          100% of scanned records satisfied eligibility rules in dataset <span className="text-stone-200">{datasetVersion}</span>.
        </div>
      ) : (
        <div className="space-y-2.5">
          {exclusions.map((ex) => (
            <div 
              key={ex.observationId}
              className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2 font-mono text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-200">{ex.decisionId}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                    RULE: {ex.rule}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Origin: {ex.recordOrigin}
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">
                  {ex.timestamp}
                </span>
              </div>

              <div className="p-2.5 rounded bg-stone-950/70 border border-stone-800/80 text-stone-300 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>{ex.reason}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
