import React from 'react';
import { PreferenceDimensionRecord } from '../../types/memory';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Info
} from 'lucide-react';

interface PreferenceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dimension: PreferenceDimensionRecord | null;
}

export const PreferenceDetailModal: React.FC<PreferenceDetailModalProps> = ({
  isOpen,
  onClose,
  dimension,
}) => {
  if (!isOpen || !dimension) return null;

  const isIncreased = dimension.currentScore >= dimension.previousScore;
  const delta = Math.abs(dimension.currentScore - dimension.previousScore);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FCFAF6] border border-[#E3DCB8] rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-[#FAF6EB] to-[#FCFAF6] border-b border-[#E8E1C5] flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-900 text-emerald-100 flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="tech-label text-[10px] text-emerald-900 font-bold block">
                PREFERENCE ADAPTATION TRACE
              </span>
              <h3 className="text-base font-bold text-zinc-900 font-sans">
                {dimension.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-200/60 hover:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Dimension Metric Card */}
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">CURRENT CALIBRATED SCORE</span>
                <div className="text-3xl font-black font-mono text-emerald-950">
                  {(dimension.currentScore * 100).toFixed(0)}%
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">SIGNAL CONFIDENCE</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold mt-1 ${
                  dimension.signalStrength === 'STRONG SIGNAL'
                    ? 'bg-emerald-100 text-emerald-800'
                    : dimension.signalStrength === 'MODERATE SIGNAL'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-zinc-100 text-zinc-700'
                }`}>
                  {dimension.signalStrength}
                </span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div 
                className="h-full bg-emerald-700 rounded-full transition-all duration-500" 
                style={{ width: `${dimension.currentScore * 100}%` }} 
              />
            </div>

            {/* Previous vs Current */}
            <div className="flex justify-between items-center text-[11px] font-mono text-zinc-600 pt-2 border-t border-zinc-100">
              <span>Previous Baseline: {(dimension.previousScore * 100).toFixed(0)}%</span>
              <span className={`font-bold flex items-center gap-0.5 ${isIncreased ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isIncreased ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isIncreased ? '+' : '-'}{(delta * 100).toFixed(0)}% Shift
              </span>
            </div>
          </div>

          {/* Observed Behavioral Pattern */}
          <div className="space-y-1.5">
            <span className="tech-label text-emerald-950 font-bold block">
              OBSERVED DECISION PATTERN
            </span>
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-sans text-xs leading-relaxed">
              {dimension.observedPattern}
            </div>
          </div>

          {/* Evidence Base */}
          <div className="p-3 rounded-xl bg-zinc-100/80 border border-zinc-200 space-y-1 text-[11px] font-mono text-zinc-600">
            <div className="flex justify-between">
              <span>Evidence Sample:</span>
              <strong className="text-zinc-900">{dimension.evidenceCount} recorded choices</strong>
            </div>
            <div className="flex justify-between">
              <span>Last Adaptation:</span>
              <span className="text-zinc-900">{dimension.lastUpdated}</span>
            </div>
          </div>

          {/* Ethical Guardrail Disclaimer */}
          <div className="p-3 rounded-xl bg-white border border-zinc-200 flex items-start gap-2 text-[11px] text-zinc-600 font-sans leading-relaxed">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Grounding:</strong> These weights reflect observed decision trade-offs, not personal traits. The farmer always retains absolute authority to override any recommendation.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-100 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold transition-all"
          >
            Close Trace
          </button>
        </div>

      </div>
    </div>
  );
};
