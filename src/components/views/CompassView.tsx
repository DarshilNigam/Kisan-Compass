/**
 * KISAN COMPASS — Rain AI Spatial Intelligence Hero World (CompassView)
 * 
 * The visual centerpiece of KISAN COMPASS:
 * 1. Living Farm Digital Twin (Field 07) as the hero visual anchor
 * 2. Floating Intelligence Orbit Nodes (Weather, Market, Logistics, Agronomy)
 * 3. Calm Floating Decision Intelligence Surface
 * 4. Layered "Why?" Sheet & Boundary Conditions
 * 5. Integrated Execution Approval & Decision Memory Rejection
 */

import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { FarmTwin } from '../spatial/FarmTwin';
import { IntelligenceOrbit } from '../spatial/IntelligenceOrbit';
import { DecisionSurface } from '../decision/DecisionSurface';
import { WhyIntelligenceSheet } from '../decision/WhyIntelligenceSheet';
import { StressTestModal } from '../shell/StressTestModal';
import { TrustCenter } from '../shell/TrustCenter';
import { EvidenceChainModal } from '../shell/EvidenceChainModal';
import { DecisionDiffModal } from '../shell/DecisionDiffModal';
import { ExecutionApprovalModal } from '../shell/ExecutionApprovalModal';
import { ExecutionCenter } from '../shell/ExecutionCenter';
import { SystemIntegrityPanel } from '../shell/SystemIntegrityPanel';
import { 
  Bell, 
  AlertCircle, 
  ShieldAlert, 
  ArrowUpRight,
  ChevronRight,
  Eye,
  CheckCircle2
} from 'lucide-react';

export const CompassView: React.FC = () => {
  const { 
    state, 
    watchState, 
    acceptUpdatedDecision, 
    keepPreviousDecision, 
    dismissReassessment,
    acceptDecision, 
    rejectDecision, 
    setActiveTab,
    executionState,
    advanceStep,
    simulateTransportConfirmation,
    simulateHarvestStart,
    simulateHarvestComplete,
    simulateDispatch,
    simulateMandiSale,
    simulateFullHarvestSequence,
    resetExecutionState,
    setIsDecisionProofOpen,
    activeField,
    activeCropCycle
  } = useFarm();
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showWhySheet, setShowWhySheet] = useState(false);
  const [showStressModal, setShowStressModal] = useState(false);
  const [showTrustCenter, setShowTrustCenter] = useState(false);
  const [showEvidenceChain, setShowEvidenceChain] = useState(false);
  const [showDecisionDiffModal, setShowDecisionDiffModal] = useState(false);
  const [showExecutionCenter, setShowExecutionCenter] = useState(false);
  const [showExecutionApprovalModal, setShowExecutionApprovalModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const currentDec = state.currentDecision;

  const handleApprove = () => {
    setShowExecutionApprovalModal(true);
  };

  const handleConfirmedPlan = () => {
    acceptDecision(currentDec.id);
    setShowExecutionCenter(true);
    setFeedbackMessage('Decision accepted: Operational checklist initialized.');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleReject = (reason: 'TOO_RISKY' | 'NEED_IMMEDIATE_CASH' | 'DISAGREE_WEATHER' | 'BETTER_LOCAL_PRICE' | 'STORAGE_UNAVAILABLE' | 'OTHER' | 'SKIP') => {
    rejectDecision(currentDec.id, reason);
    setShowRejectModal(false);
    setFeedbackMessage('Decision rejected: Preference profile updated. Risk weighting adjusted.');
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-3 space-y-6">
      
      {/* Editorial Farm Intro Banner */}
      <section className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 pt-1 pb-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider text-[#1B5E35] uppercase">
              Station UP-KN-892 • Kanpur Sector
            </span>
            <span className="text-[#9AA7A0]">•</span>
            <span className="text-[11px] font-mono text-[#69776F]">Rabi Cycle 2025–2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#102117] tracking-tight font-sans">
            Your farm is ready for a decision.
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-white border border-black/[0.08] font-bold text-[#102117] shadow-xs">
            {(activeField?.field_name || state.fieldName || 'FIELD 01').toUpperCase()}
          </span>
          <span className="text-[#69776F]">
            {state.estimatedHarvestQuintals} Qtl {activeCropCycle?.crop_name || state.crop} ({activeCropCycle?.crop_variety || state.variety})
          </span>
        </div>
      </section>

      {/* Material Reassessment Banner (Only shown if Farm Watch triggers an alert) */}
      {watchState.pendingReassessment && (
        <div className="p-4 rounded-3xl bg-amber-50/90 border border-amber-300 shadow-md animate-in slide-in-from-top-2 duration-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-950 font-mono">DECISION REASSESSMENT REQUIRED</div>
                <div className="text-[11px] font-mono text-amber-800 line-clamp-1">
                  Trigger: {watchState.pendingReassessment.triggerEvent.title}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-200 border border-amber-400 text-[10px] font-mono font-bold text-amber-950">
              MATERIAL CHANGE
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-amber-200 text-xs font-mono flex items-center justify-between">
            <div>
              <span>Previous: <strong className="text-amber-900">{watchState.pendingReassessment.previousRecommendation}</strong></span>
              <span className="mx-2">&rarr;</span>
              <span>New Optimal: <strong className="text-[#123D25]">{watchState.pendingReassessment.newRecommendation}</strong></span>
            </div>
            <div className="text-[#1B5E35] font-bold">
              +₹{watchState.pendingReassessment.deltaInr.toLocaleString('en-IN')} Net Shift
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDecisionDiffModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Review What Changed & Reassess</span>
            </button>
            <button
              onClick={() => watchState.pendingReassessment && dismissReassessment(watchState.pendingReassessment)}
              className="px-3 py-2 rounded-xl bg-white border border-black/[0.1] text-[#69776F] hover:text-[#102117] font-mono text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Feedback Toast Notification */}
      {feedbackMessage && (
        <div className="p-3 rounded-2xl bg-[#DCEBDA] border border-[#6E9F6F] text-[#123D25] text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#1B5E35]" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* HERO SECTION 1: THE LIVING FARM DIGITAL TWIN CANVAS */}
      <section className="relative w-full rounded-3xl overflow-hidden rain-glass-surface shadow-ambient p-1 border border-white/90">
        <FarmTwin showInspectorPill={true} />
      </section>

      {/* HERO SECTION 2: FLOATING INTELLIGENCE ORBIT NODES */}
      <section className="w-full">
        <IntelligenceOrbit />
      </section>

      {/* HERO SECTION 3: THE FLOATING DECISION INTELLIGENCE SURFACE */}
      <section className="w-full">
        <DecisionSurface
          onOpenWhy={() => setShowWhySheet(true)}
          onOpenWhatIf={() => setActiveTab('what-if')}
          onOpenTrace={() => setIsDecisionProofOpen(true)}
          onApprove={handleApprove}
          onReject={() => setShowRejectModal(true)}
        />
      </section>

      {/* Operational Mission Control Trigger Strip */}
      <section 
        onClick={() => setShowExecutionCenter(true)}
        className="p-4 rounded-3xl rain-glass-surface hover:rain-glass-surface-elevated transition-all flex items-center justify-between cursor-pointer border border-black/[0.06] group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#123D25] text-white flex items-center justify-center shadow-xs">
            <Eye className="w-4 h-4 text-[#A8C6A5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#102117] font-mono uppercase tracking-wider">
                Execution Mission Control
              </h3>
              <span className="px-2 py-0.2 rounded-full bg-[#DCEBDA] text-[9px] font-mono text-[#123D25] font-bold">
                {executionState.feasibility.overallStatus.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-[#69776F] font-sans">
              {executionState.activePlan.steps.filter(s => s.status === 'COMPLETED').length}/10 Operational Steps Verified • Ready to mobilize
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-[#1B5E35] font-bold group-hover:translate-x-1 transition-transform">
          <span>Open Execution Desk</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </section>

      {/* Full 12-Stage Intelligence Loop System Integrity Panel */}
      <section className="pt-2">
        <SystemIntegrityPanel />
      </section>

      {/* Layered "Why?" Intelligence Sheet */}
      <WhyIntelligenceSheet
        isOpen={showWhySheet}
        onClose={() => setShowWhySheet(false)}
        onOpenTrace={() => setIsDecisionProofOpen(true)}
      />

      {/* Rejection Reason Modal (Human Preference Learning) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-black/[0.1] shadow-modal space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-[#102117] font-sans">
                  Human Authority: Rejection Reason
                </h3>
              </div>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="text-[#69776F] hover:text-[#102117]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#405048] leading-relaxed font-sans">
              Why are you rejecting this recommendation? Your selection tunes the Bayesian preference profile ($\gamma$) for future decision optimization without secret model retraining.
            </p>

            <div className="space-y-2 text-xs font-medium">
              {[
                { key: 'TOO_RISKY' as const, label: 'Too risky — Prioritize secure yield over price upside' },
                { key: 'NEED_IMMEDIATE_CASH' as const, label: 'Urgent cash requirement — Sell at nearest yard' },
                { key: 'DISAGREE_WEATHER' as const, label: 'Local weather observation differs from radar' },
                { key: 'BETTER_LOCAL_PRICE' as const, label: 'Negotiated superior price at local farmgate' },
                { key: 'STORAGE_UNAVAILABLE' as const, label: 'Storage or tarp protection unavailable' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleReject(opt.key)}
                  className="w-full p-3 rounded-2xl border border-black/[0.08] bg-[#F7F9F7] hover:bg-[#F0F6F1] hover:border-[#1B5E35]/40 text-left transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="text-[#102117]">{opt.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#9AA7A0]" />
                </button>
              ))}

              <button
                onClick={() => handleReject('OTHER')}
                className="w-full py-2 px-3 text-center text-[#69776F] hover:text-[#102117] font-mono text-[11px] transition-colors cursor-pointer"
              >
                Skip / Other Reason
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Stress Test Modal */}
      <StressTestModal
        isOpen={showStressModal}
        onClose={() => setShowStressModal(false)}
      />

      {/* Trust Center Modal */}
      <TrustCenter
        isOpen={showTrustCenter}
        onClose={() => setShowTrustCenter(false)}
      />

      {/* Evidence Chain DAG Modal */}
      <EvidenceChainModal
        isOpen={showEvidenceChain}
        onClose={() => setShowEvidenceChain(false)}
      />

      {/* Decision Diff Side-by-Side Modal */}
      <DecisionDiffModal
        isOpen={showDecisionDiffModal}
        onClose={() => setShowDecisionDiffModal(false)}
        reassessment={watchState.pendingReassessment}
        onAcceptUpdated={(reassessment) => {
          acceptUpdatedDecision(reassessment);
          setShowDecisionDiffModal(false);
          setFeedbackMessage('Decision updated: ' + (watchState.pendingReassessment?.newRecommendation ?? 'NEW PLAN'));
          setTimeout(() => setFeedbackMessage(null), 5000);
        }}
        onKeepPrevious={(reassessment) => {
          keepPreviousDecision(reassessment);
          setShowDecisionDiffModal(false);
          setFeedbackMessage('Previous decision retained.');
          setTimeout(() => setFeedbackMessage(null), 4000);
        }}
        onDismiss={(reassessment) => {
          dismissReassessment(reassessment);
          setShowDecisionDiffModal(false);
        }}
      />

      {/* Execution Human Approval Modal */}
      <ExecutionApprovalModal
        isOpen={showExecutionApprovalModal}
        onClose={() => setShowExecutionApprovalModal(false)}
        feasibility={executionState.feasibility}
        onConfirmPlan={handleConfirmedPlan}
      />

      {/* Execution Center Mission Control Modal */}
      <ExecutionCenter
        isOpen={showExecutionCenter}
        onClose={() => setShowExecutionCenter(false)}
        plan={executionState.activePlan}
        feasibility={executionState.feasibility}
        events={executionState.events}
        deviations={executionState.deviationReport}
        isSimulated={executionState.isSimulated}
        onAdvanceStep={advanceStep}
        onSimulateFullHarvestSequence={simulateFullHarvestSequence}
        onSimulateTransportConfirmation={simulateTransportConfirmation}
        onSimulateHarvestStart={simulateHarvestStart}
        onSimulateHarvestComplete={simulateHarvestComplete}
        onSimulateDispatch={simulateDispatch}
        onSimulateMandiSale={simulateMandiSale}
        onResetExecution={resetExecutionState}
      />

    </div>
  );
};
