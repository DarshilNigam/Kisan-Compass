/**
 * KISAN COMPASS — Interactive Judge Mode Walkthrough Modal (Stage 12)
 * 
 * Provides an active 8-checkpoint guided audit tour for hackathon judges.
 * Allows step-by-step navigation with direct action execution.
 */

import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { JUDGE_CHECKPOINTS } from '../../services/judgeModeService';
import { JudgeCheckpoint } from '../../types/truth';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  ShieldAlert
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenFailureDrawer?: () => void;
  onOpenWhyModal?: () => void;
  onOpenStressTest?: () => void;
  onOpenExecutionCenter?: () => void;
}

export const JudgeModeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenFailureDrawer,
  onOpenWhyModal,
  onOpenStressTest,
  onOpenExecutionCenter
}) => {
  const { 
    setActiveTab, 
    setIsDecisionProofOpen, 
    setIsEvaluationLabOpen, 
    setIsOutcomeModalOpen
  } = useFarm();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentCheckpoint: JudgeCheckpoint = JUDGE_CHECKPOINTS[currentStepIndex];

  if (!isOpen) return null;

  const handleExecuteCheckpointAction = () => {
    // 1. Switch active tab if specified
    if (currentCheckpoint.targetTab) {
      setActiveTab(currentCheckpoint.targetTab);
    }

    // 2. Open specific target modal or simulation
    switch (currentCheckpoint.targetModal) {
      case 'JUDGE_PROOF':
        setIsDecisionProofOpen(true);
        break;
      case 'CALCULATION_TRACE':
        if (onOpenWhyModal) onOpenWhyModal();
        break;
      case 'FAILURE_DRAWER':
        if (onOpenFailureDrawer) onOpenFailureDrawer();
        break;
      case 'EXECUTION_CENTER':
        if (onOpenExecutionCenter) onOpenExecutionCenter();
        break;
      case 'EVALUATION_LAB':
        setIsEvaluationLabOpen(true);
        break;
      case 'OUTCOME_CENTER':
        setIsOutcomeModalOpen(true);
        break;
      case 'STRESS_TEST':
        if (onOpenStressTest) onOpenStressTest();
        break;
      case 'WHAT_IF':
        setActiveTab('what-if');
        break;
      default:
        break;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-stone-950 border border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150 text-stone-100 font-mono">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-stone-950 to-amber-950/80 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/40 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/40 uppercase">
                  JUDGE PROOF SYSTEM • STAGE 12
                </span>
                <span className="text-stone-500 text-xs">•</span>
                <span className="text-xs text-stone-400">8 CHECKPOINT INTEGRITY TOUR</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Live Interactive System Verification Walkthrough
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-5 py-3 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto text-[10px]">
          {JUDGE_CHECKPOINTS.map((cp, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={cp.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-xs' 
                    : isCompleted
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                <span>CP {cp.index}</span>
              </button>
            );
          })}
        </div>

        {/* Main Checkpoint Card */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Checkpoint Title & Subtitle */}
          <div className="space-y-1">
            <div className="text-xs text-amber-400 font-bold uppercase">
              CHECKPOINT {currentCheckpoint.index} OF 8
            </div>
            <h3 className="text-lg font-bold text-white font-sans">
              {currentCheckpoint.title}
            </h3>
            <p className="text-xs text-stone-400">{currentCheckpoint.subtitle}</p>
          </div>

          {/* Key Assertion Box */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
              <Sparkles className="w-4 h-4" />
              What This Proves to the Judge
            </div>
            <p className="text-stone-200 text-xs leading-relaxed font-sans font-semibold">
              "{currentCheckpoint.keyAssertion}"
            </p>
          </div>

          {/* Honest Boundary & Scientific Constraint */}
          <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
            <div className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-stone-400" />
              Honest Boundary & Anti-Hype Grounding
            </div>
            <p className="text-stone-300 text-[11px] font-sans leading-relaxed">
              {currentCheckpoint.honestBoundary}
            </p>
          </div>

          {/* Interactive Demonstration Instructions */}
          <div className="p-4 rounded-2xl bg-stone-900/90 border border-emerald-500/30 space-y-2">
            <div className="text-xs text-emerald-400 font-bold uppercase flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Live Demonstration Action
            </div>
            <p className="text-stone-200 text-xs font-sans leading-relaxed">
              {currentCheckpoint.demonstrationInstruction}
            </p>
            <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-emerald-300">
              <strong>Expected System Behavior:</strong> {currentCheckpoint.expectedOutcome}
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={currentStepIndex === JUDGE_CHECKPOINTS.length - 1}
              onClick={() => setCurrentStepIndex(prev => Math.min(JUDGE_CHECKPOINTS.length - 1, prev + 1))}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExecuteCheckpointAction}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-extrabold text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Play className="w-4 h-4 text-stone-950 fill-stone-950" />
            <span>EXECUTE CHECKPOINT {currentCheckpoint.index} IN APPLICATION</span>
          </button>
        </div>

      </div>
    </div>
  );
};
