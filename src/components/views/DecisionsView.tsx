/**
 * KISAN COMPASS — Farm Decision Memory & Learning Timeline (Domain 04: MEMORY)
 * 
 * Reconstructed according to the Complete Product UI/UX Redesign:
 * 1. Human Editorial Atmosphere: "The Farm Remembers."
 * 2. Visual Vertical Learning Timeline:
 *    - Recommendation (Sparkles / Compass)
 *    - Farmer Decision (Check / User)
 *    - Field Outcome (Scale / Harvest)
 *    - Bayesian Learning (Brain / Calibration)
 * 3. Color Identity: Deep Forest + Soft Blue-Green (#668E96)
 * 4. Interactive Outcome Reporting & Replay Modals
 */

import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { ReportOutcomeModal } from '../shell/ReportOutcomeModal';
import { DecisionReplayModal } from '../shell/DecisionReplayModal';
import { PreferenceDetailModal } from '../shell/PreferenceDetailModal';
import { 
  LongitudinalDecisionRecord, 
  PreferenceDimensionRecord 
} from '../../types/memory';
import { 
  History, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Scale
} from 'lucide-react';

export const DecisionsView: React.FC = () => {
  const { 
    state,
    longitudinalDecisions, 
    calibrationStats, 
    recordOutcome,
    setIsOutcomeModalOpen,
    activeField,
    isDemoMode
  } = useFarm();

  const [selectedDecisionForOutcome, setSelectedDecisionForOutcome] = useState<LongitudinalDecisionRecord | null>(null);
  const [selectedDecisionForReplay, setSelectedDecisionForReplay] = useState<LongitudinalDecisionRecord | null>(null);
  const [selectedDimensionForDetail, setSelectedDimensionForDetail] = useState<PreferenceDimensionRecord | null>(null);

  const totalDecisions = longitudinalDecisions.length;
  const approvedCount = longitudinalDecisions.filter(d => d.farmerAction === 'ACCEPTED').length;
  const rejectedCount = longitudinalDecisions.filter(d => d.farmerAction === 'REJECTED').length;
  const outcomesCount = longitudinalDecisions.filter(d => d.outcomeStatus === 'CONFIRMED').length;

  return (
    <div className="w-full space-y-7">
      
      {/* 1. Page Header (Human-First Title) */}
      <section className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 pb-3 border-b border-[rgba(23,74,50,0.08)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wide text-[#79B8C4] font-sans">
              Farm Memory &amp; Learning
            </span>
            <span className="text-[#93A098]">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF4F6] text-[#2C626E] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#79B8C4]" />
              <span>Learning from past harvests</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#17281F] tracking-tight font-sans">
            Your farm remembers
          </h1>
          <p className="text-sm text-[#304238] max-w-2xl font-sans leading-relaxed">
            Every choice becomes evidence. Every harvest outcome teaches the system how your farm responds under real conditions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsOutcomeModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-[#174A32] text-white hover:bg-[#0E3322] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Scale className="w-4 h-4 text-[#E7C66A]" />
            <span>Check prediction accuracy</span>
          </button>
        </div>
      </section>

      {/* 2. EDITORIAL HERO & 4 DISTINCT STAT CARDS */}
      <section className="paper-card-elevated p-6 sm:p-8 space-y-6 bg-[#FFFDF8] border border-[rgba(23,74,50,0.12)] shadow-sm">
        
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#EAF3EC] text-[#174A32] text-xs font-bold border border-[#5E9B68]/30">
              Memory &amp; Learning
            </span>
            <span className="text-[#9BA79F]">•</span>
            <span className="text-xs text-[#607268] font-semibold">
              {isDemoMode ? 'Field 07 History (Demo Benchmark)' : `${activeField?.field_name || state.fieldName} History`}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-[#173A2A]">
            Every decision teaches us what matters to your farm
          </h2>
          <p className="text-sm text-[#34483D] leading-relaxed font-sans font-medium">
            When you follow an advice, we see how the field performs. When you change our plan, we remember your preference for risk and timing.
          </p>
        </div>

        {/* 4 Distinct Colored Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[rgba(23,74,50,0.08)] font-sans">
          
          {/* Card 1: Total Decisions (Neutral Dark) */}
          <div className="p-5 rounded-2xl bg-[#F7F4EC] border border-[rgba(23,74,50,0.10)] space-y-1">
            <span className="text-xs text-[#607268] font-bold block">Total decisions</span>
            <span className="text-3xl font-black font-mono text-[#173A2A]">{totalDecisions}</span>
            <span className="text-xs text-[#7A8980] block font-medium">recorded on Field 07</span>
          </div>

          {/* Card 2: Approved (Leaf Green #5E9B68) */}
          <div className="p-5 rounded-2xl bg-[#EAF3EC] border border-[#5E9B68]/30 space-y-1">
            <span className="text-xs text-[#174A32] font-bold block">Accepted by you</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-[#174A32]">{approvedCount}</span>
              <span className="text-xs font-bold text-[#5E9B68]">({Math.round((approvedCount / (totalDecisions || 1)) * 100)}%)</span>
            </div>
            <span className="text-xs text-[#5E9B68] block font-medium">advice followed</span>
          </div>

          {/* Card 3: Rejected / Changed (Harvest Orange #D88732) */}
          <div className="p-5 rounded-2xl bg-[#FAF3E8] border border-[#D88732]/30 space-y-1">
            <span className="text-xs text-[#C47D27] font-bold block">Changed by you</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-[#D88732]">{rejectedCount}</span>
              <span className="text-xs font-bold text-[#C47D27]">({Math.round((rejectedCount / (totalDecisions || 1)) * 100)}%)</span>
            </div>
            <span className="text-xs text-[#C47D27] block font-medium">adapted to your risk</span>
          </div>

          {/* Card 4: Verified Outcomes (Sky Blue #79B8C4) */}
          <div className="p-5 rounded-2xl bg-[#EBF4F6] border border-[#79B8C4]/35 space-y-1">
            <span className="text-xs text-[#2C626E] font-bold block">Checked in field</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-[#173A2A]">{outcomesCount}</span>
              <span className="text-xs font-bold text-[#2C626E]">({calibrationStats.withinRangePercentage}%)</span>
            </div>
            <span className="text-xs text-[#2C626E] block font-medium">accurate within range</span>
          </div>

        </div>

      </section>

      {/* 3. THE LIVING FARM MEMORY JOURNAL TIMELINE */}
      <section className="paper-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[rgba(23,74,50,0.08)]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#5E9B68]" />
            <h3 className="text-base font-extrabold text-[#17281F] font-sans">
              Past decisions &amp; what happened
            </h3>
          </div>
          <span className="text-xs text-[#607268] font-sans">
            A complete record of what was recommended, what you chose, and verified field results.
          </span>
        </div>

        {/* Vertical Timeline Nodes */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[rgba(23,74,50,0.12)]">
          {longitudinalDecisions.map((record, index) => {
            const isAccepted = record.farmerAction === 'ACCEPTED';
            const isRejected = record.farmerAction === 'REJECTED';
            const hasOutcome = record.outcomeStatus === 'CONFIRMED';

            return (
              <div key={record.id} className="relative space-y-3">
                
                {/* Timeline Dot Icon */}
                <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white shadow-xs ${
                  isAccepted ? 'bg-[#5E9B68]' : isRejected ? 'bg-[#D88732]' : 'bg-[#79B8C4]'
                }`}>
                  {isAccepted ? <CheckCircle2 className="w-3.5 h-3.5" /> : isRejected ? <XCircle className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                {/* Timeline Card */}
                <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[rgba(23,74,50,0.10)] shadow-xs space-y-3">
                  
                  {/* Step 1: Recommendation & Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#607268] font-medium">{record.timestamp}</span>
                        <span className="text-[#93A098]">•</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#EAF3EC] text-[#174A32] text-[11px] font-bold">
                          Harvest Cycle #{index + 1}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-[#17281F] font-sans">
                        Recommendation: {record.recommendation}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isAccepted 
                          ? 'bg-[#EAF3EC] text-[#174A32]' 
                          : isRejected 
                          ? 'bg-[#FAF3E8] text-[#D88732]' 
                          : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {isAccepted ? '✓ You followed this plan' : isRejected ? '✎ You changed the plan' : 'Under consideration'}
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Reasoning & Rejection/Outcome details */}
                  <p className="text-xs sm:text-sm text-[#304238] font-sans leading-relaxed">
                    {record.title || record.primaryRecommendation}
                  </p>

                  {/* Step 3: Verified Outcome Bar (if available) */}
                  {hasOutcome && record.actualOutcome && (
                    <div className="p-3.5 rounded-xl bg-[#EAF3EC] border border-[#5E9B68]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Scale className="w-3.5 h-3.5 text-[#174A32]" />
                        <span className="text-[#174A32] font-bold">Verified field earnings:</span>
                        <span className="font-mono font-black text-sm text-[#174A32]">₹{record.actualOutcome.actualNetInr.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[#5E9B68] font-medium">
                        Difference from prediction: {record.actualOutcome.deltaVsExpectedNetInr >= 0 ? '+' : ''}₹{record.actualOutcome.deltaVsExpectedNetInr.toLocaleString('en-IN')} ({record.actualOutcome.classification.replace('_', ' ')})
                      </span>
                    </div>
                  )}

                  {/* Step 4: Actions (Replay & Outcome) */}
                  <div className="pt-2 flex items-center justify-between border-t border-[rgba(23,74,50,0.06)] text-xs">
                    <button
                      onClick={() => setSelectedDecisionForReplay(record)}
                      className="text-[#174A32] hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>See what would have happened (Replay)</span>
                    </button>

                    {!hasOutcome && (
                      <button
                        onClick={() => setSelectedDecisionForOutcome(record)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#EAF3EC] hover:bg-[#174A32] hover:text-white text-[#174A32] font-bold transition-colors cursor-pointer"
                      >
                        Record real harvest earnings
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Modals */}
      {selectedDecisionForOutcome && (
        <ReportOutcomeModal
          decision={selectedDecisionForOutcome}
          isOpen={Boolean(selectedDecisionForOutcome)}
          onClose={() => setSelectedDecisionForOutcome(null)}
          onSubmitOutcome={recordOutcome}
        />
      )}

      {selectedDecisionForReplay && (
        <DecisionReplayModal
          decision={selectedDecisionForReplay}
          currentState={state}
          isOpen={Boolean(selectedDecisionForReplay)}
          onClose={() => setSelectedDecisionForReplay(null)}
        />
      )}

      {selectedDimensionForDetail && (
        <PreferenceDetailModal
          dimension={selectedDimensionForDetail}
          isOpen={Boolean(selectedDimensionForDetail)}
          onClose={() => setSelectedDimensionForDetail(null)}
        />
      )}

    </div>
  );
};
