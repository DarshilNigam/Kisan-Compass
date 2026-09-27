import React from 'react';
import { DecisionReassessmentRecord } from '../../types/farmWatch';
import { 
  GitCompare, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

interface DecisionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  reassessment: DecisionReassessmentRecord | null;
  onAcceptUpdated: (reassessment: DecisionReassessmentRecord) => void;
  onKeepPrevious: (reassessment: DecisionReassessmentRecord) => void;
  onDismiss: (reassessment: DecisionReassessmentRecord) => void;
}

export const DecisionDiffModal: React.FC<DecisionDiffModalProps> = ({
  isOpen,
  onClose,
  reassessment,
  onAcceptUpdated,
  onKeepPrevious,
  onDismiss,
}) => {
  if (!isOpen || !reassessment) return null;

  const prevRec = reassessment.previousRecommendation;
  const newRec = reassessment.newRecommendation;
  const prevNet = reassessment.previousExpectedNet;
  const newNet = reassessment.newExpectedNet;
  const delta = reassessment.deltaInr;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#FCFAF6] border border-[#E3DCB8] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#FAF6EB] to-[#FCFAF6] border-b border-[#E8E1C5] flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-900 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                <GitCompare className="w-3 h-3 text-purple-300" />
                Event-Driven Decision Diff
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-[10px] font-mono text-zinc-600 font-semibold uppercase">
                Temporal Reassessment Review
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight font-sans">
              What Changed Since You Approved?
            </h2>
            <p className="text-xs text-zinc-600">
              An environmental or market event crossed a mathematical sensitivity threshold. Inspect what changed before deciding whether to adapt.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 flex items-center justify-center text-sm font-bold transition-all shadow-xs"
          >
            ✕
          </button>
        </div>

        {/* Narrative "Why Did You Wake Me?" Banner */}
        <div className="px-6 py-4 bg-purple-50/80 border-b border-purple-100 space-y-1">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-purple-950 uppercase">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span>WHY DID YOU WAKE ME? (सिस्टम ने यह चेतावनी क्यों दी?)</span>
          </div>
          <p className="text-xs text-purple-950 font-sans leading-relaxed">
            {reassessment.whyBody}
          </p>
        </div>

        {/* Modal Body: Side-by-Side Comparison */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-zinc-800">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Previous State Card */}
            <div className="p-4 rounded-2xl bg-zinc-100/80 border border-zinc-300/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <span className="font-mono text-xs font-bold text-zinc-700">
                  PREVIOUS APPROVED DECISION
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[10px] font-mono font-bold">
                  INITIAL
                </span>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">Recommended Action</span>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-zinc-800 text-white font-mono text-xs font-bold mt-0.5">
                    {prevRec}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">Expected Net Realization</span>
                  <span className="text-xl font-black font-mono text-zinc-900">
                    ₹{prevNet.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-200 text-[11px] text-zinc-600">
                  <span className="font-semibold">Core Rationale: </span>
                  Locked in clean realization before the forecasted 68% convective thunderstorm.
                </div>
              </div>
            </div>

            {/* Current Reassessed State Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-purple-50/70 border border-emerald-300 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
                <span className="font-mono text-xs font-bold text-emerald-950">
                  REASSESSED RECOMMENDATION
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-900 text-white text-[10px] font-mono font-bold">
                  NEW OPTIMAL
                </span>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-mono text-emerald-900 block uppercase font-bold">Recommended Action</span>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-900 text-white font-mono text-xs font-bold mt-0.5">
                    {newRec}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-emerald-900 block uppercase font-bold">Expected Net Realization</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black font-mono text-emerald-950">
                      ₹{newNet.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      (+₹{delta.toLocaleString('en-IN')} Delta)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-950 font-medium">
                  <span className="font-bold">Core Rationale: </span>
                  Rain risk diminished below 41%; holding standing crop captures +5 days of biological weight gain with zero dockage.
                </div>
              </div>
            </div>

          </div>

          {/* Factor-by-Factor Shift Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-zinc-600 uppercase font-bold">
              Factor-by-Factor Parameter Shifts
            </div>

            <div className="space-y-2">
              {reassessment.affectedFactors.map((f, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-zinc-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-zinc-900">{f.factor}</span>
                    <span className="text-zinc-600">
                      <span className="line-through text-zinc-400">{f.from}</span> → <strong className="text-emerald-900">{f.to}</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 font-sans">{f.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Autonomous Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Zero Auto-Approval Guarantee: Your previous approval remains logged in decision memory until you explicitly accept or dismiss this update.
            </span>
          </div>

        </div>

        {/* Action Panel Footer */}
        <div className="p-4 sm:p-5 bg-[#FAF6EB] border-t border-[#E8E1C5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onDismiss(reassessment);
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 font-mono text-xs font-semibold transition-colors"
          >
            Dismiss Alert
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onKeepPrevious(reassessment);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-emerald-900/30 bg-white hover:bg-emerald-50 text-emerald-950 font-mono text-xs font-bold transition-colors"
            >
              Keep Previous ({prevRec})
            </button>

            <button
              onClick={() => {
                onAcceptUpdated(reassessment);
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-mono text-xs font-bold tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>ACCEPT UPDATED ({newRec})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
