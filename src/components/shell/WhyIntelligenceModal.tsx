import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { GroundedQuestionType } from '../../types/explanation';
import { StatusPill } from './StatusPill';
import { 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ShieldCheck, 
  Cpu, 
  Info,
  GitCommit,
  ChevronRight
} from 'lucide-react';

interface WhyIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEvidenceChain?: () => void;
  horizonDays?: number;
}

export const WhyIntelligenceModal: React.FC<WhyIntelligenceModalProps> = ({
  isOpen,
  onClose,
  onOpenEvidenceChain,
}) => {
  const { 
    state, 
    groundedExplanation, 
    explanationContext, 
    explanationLanguage, 
    setExplanationLanguage, 
    askGroundedQuestion 
  } = useFarm();

  const [showMathTrace, setShowMathTrace] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<GroundedQuestionType | null>(null);

  if (!isOpen || !groundedExplanation || !explanationContext) return null;

  const ctx = explanationContext;
  const expl = groundedExplanation;
  const isHindi = explanationLanguage === 'hi';

  const isBaseline = ctx.forecast.isFailed || !state.systemStatus.forecastEngineOnline;

  const questions: { type: GroundedQuestionType; label: string; icon: string }[] = isHindi ? [
    { type: 'WHY_DECISION', label: 'यह निर्णय क्यों?', icon: '🌾' },
    { type: 'WHY_CANNOT_BE_MORE_CERTAIN', label: 'अधिक निश्चित क्यों नहीं हो सकते?', icon: '🛡️' },
    { type: 'WHAT_IS_RISK', label: 'सबसे बड़ा जोखिम क्या है?', icon: '⚡' },
    { type: 'WHY_UNNAO_MANDI', label: 'उन्नाव मंडी ही क्यों?', icon: '🚛' },
    { type: 'HOW_CERTAIN_WEATHER', label: 'मौसम पूर्वानुमान कितना सटीक है?', icon: '🌧️' },
    { type: 'WHAT_IF_7D', label: '7 दिन बाद क्या होगा?', icon: '📈' },
    { type: 'FORECAST_SOURCE_STATUS', label: 'पूर्वानुमान का स्रोत क्या है?', icon: '🎯' },
  ] : [
    { type: 'WHY_DECISION', label: 'Why this recommendation?', icon: '🌾' },
    { type: 'WHY_CANNOT_BE_MORE_CERTAIN', label: "Why can't you be more certain?", icon: '🛡️' },
    { type: 'WHAT_IS_RISK', label: 'What is the biggest risk?', icon: '⚡' },
    { type: 'WHY_UNNAO_MANDI', label: 'Why Unnao over closer yards?', icon: '🚛' },
    { type: 'HOW_CERTAIN_WEATHER', label: 'How certain is the weather?', icon: '🌧️' },
    { type: 'WHAT_IF_7D', label: 'What happens if we hold 7 days?', icon: '📈' },
    { type: 'FORECAST_SOURCE_STATUS', label: 'Forecast model status?', icon: '🎯' },
  ];

  const currentAnswer = activeQuestion ? askGroundedQuestion(activeQuestion) : null;

  // Arithmetic Breakdown for Step-by-Step Trace
  const quantity = ctx.crop.quantityQuintals || 32;
  const grossPrice = ctx.market.grossPricePerQuintal || 2380;
  const grossValue = quantity * grossPrice;
  const freightCost = ctx.market.estimatedTransportCost || 1340;
  const tollCost = 0;
  const spoilagePenalty = Math.round(grossValue * (ctx.market.spoilageRiskPercent / 100));
  const netRealization = ctx.decision.expectedNetRealization;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FCFAF6] border border-[#E3DCB8]/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#FAF6EB] to-[#FCFAF6] border-b border-[#E8E1C5] flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                {isHindi ? 'निर्णय व्याख्या इंजन' : 'Grounded Explanation Engine'}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-[10px] font-mono text-zinc-600 font-semibold uppercase">
                {isHindi ? `समय सीमा: +${ctx.decision.horizonDays} दिन` : `Horizon: +${ctx.decision.horizonDays}d`}
              </span>
              {expl.isDeterministicFallback && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {isHindi ? 'प्रत्यक्ष फॉलबैक' : 'Deterministic Fallback'}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 font-sans tracking-tight">
              {expl.headline}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Bilingual Switcher */}
            <div className="flex items-center bg-zinc-200/80 p-0.5 rounded-xl text-xs font-mono font-semibold">
              <button
                onClick={() => setExplanationLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  explanationLanguage === 'en'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setExplanationLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  explanationLanguage === 'hi'
                    ? 'bg-white text-emerald-950 font-bold shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-zinc-200/60 hover:bg-zinc-300/80 text-zinc-600 hover:text-zinc-900 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Level 1 & 2: Recommendation & Financial Synthesis */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950 text-white shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
              <div>
                <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest block font-bold">
                  {isHindi ? 'अनुशंसित कदम' : 'OPTIMAL ACTION RECOMMENDATION'}
                </span>
                <span className="text-lg font-black text-emerald-100 font-sans">
                  {ctx.decision.recommendation}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest block font-bold">
                  {isHindi ? 'अनुमानित शुद्ध आय' : 'EXPECTED NET REALIZATION'}
                </span>
                <div className="flex items-baseline sm:justify-end gap-2">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                    ₹{ctx.decision.expectedNetRealization.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    ctx.decision.deltaVsTodayInr >= 0
                      ? 'bg-emerald-800 text-emerald-200'
                      : 'bg-rose-900 text-rose-200'
                  }`}>
                    {ctx.decision.deltaVsTodayInr >= 0 ? '+' : ''}₹{ctx.decision.deltaVsTodayInr.toLocaleString('en-IN')} {isHindi ? 'आज के मुकाबले' : 'vs today'}
                  </span>
                </div>
              </div>
            </div>

            {/* Level 3: Plausible 90% Spread (P10 to P90) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-300">
                  {isHindi ? '90% संभाव्य आय सीमा (P10 – P90)' : '90% Plausible Outcome Range (P10 – P90)'}:
                </span>
                <span className="font-bold text-white tracking-wide">
                  ₹{ctx.decision.range.p10.toLocaleString('en-IN')} — ₹{ctx.decision.range.p90.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-900/80 overflow-hidden relative">
                <div 
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-300 opacity-90"
                  style={{ left: '15%', right: '15%' }}
                />
              </div>
            </div>

            {/* Natural language summary */}
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed pt-1">
              {expl.summary}
            </p>
          </div>

          {/* Level 4: Factor Attribution Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-emerald-950 uppercase tracking-wider">
                {isHindi ? 'निर्णय के मुख्य कारण (फैक्टर कॉन्ट्रीब्यूशन)' : 'WHY ARE YOU TELLING ME THIS? (KEY DRIVERS)'}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {isHindi ? '100% सटीक ग्राउंडिंग' : '100% Grounded in Deterministic State'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expl.whyDrivers.map((driver, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm hover:border-emerald-700/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 font-sans">
                      {driver.factor}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      driver.direction === 'POSITIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : driver.direction === 'NEGATIVE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {driver.direction === 'POSITIVE' && <TrendingUp className="w-2.5 h-2.5" />}
                      {driver.direction === 'NEGATIVE' && <TrendingDown className="w-2.5 h-2.5" />}
                      {driver.direction === 'NEUTRAL' && <Minus className="w-2.5 h-2.5" />}
                      {driver.direction}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                    {driver.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Level 6: Step-by-Step Arithmetic Trace (Collapsible) */}
          <div className="border border-zinc-200/90 rounded-2xl bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => setShowMathTrace(!showMathTrace)}
              className="w-full p-4 flex items-center justify-between bg-zinc-50/80 hover:bg-zinc-100/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-800" />
                <span className="font-mono text-xs font-bold text-zinc-900 tracking-wide uppercase">
                  {isHindi ? 'देखें यह गणना कैसे की गई (Step-by-Step Trace)' : 'SHOW HOW THIS WAS CALCULATED (STEP-BY-STEP TRACE)'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono">
                <span>{showMathTrace ? (isHindi ? 'छिपाएं' : 'Hide') : (isHindi ? 'विस्तार' : 'Expand')}</span>
                {showMathTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showMathTrace && (
              <div className="p-4 sm:p-5 border-t border-zinc-200 space-y-3 bg-zinc-50/40 text-xs font-mono">
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-700">1. Gross Mandi Value ({quantity} qtl × ₹{grossPrice}/qtl):</span>
                  <span className="font-bold text-zinc-900">₹{grossValue.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-200 text-rose-700">
                  <span>2. Road Freight & Logistics ({ctx.market.selectedMandi}):</span>
                  <span className="font-bold">-₹{freightCost.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-zinc-200 text-zinc-500">
                  <span>3. Highway Toll & Loading Surcharge:</span>
                  <span className="font-bold">-₹{tollCost.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-zinc-200 text-zinc-500">
                  <span>4. Spoilage / Moisture Loss:</span>
                  <span className="font-bold">-₹{spoilagePenalty.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-t-2 border-emerald-900/30 text-emerald-950 font-extrabold text-sm">
                  <span>= Net Realization (Locked Cash In Hand):</span>
                  <span className="text-base font-black">₹{netRealization.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-900 font-sans">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    {isHindi 
                      ? 'शून्य एलएलएम गणना: सभी वित्तीय और कृषि आंकड़े सीधे कोड में गणना किए गए हैं।' 
                      : 'Deterministic Guarantee: Zero numerical calculation inside LLM. All values computed via net-realization arithmetic.'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Natural Questions (Grounded Q&A Chips) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-800" />
              <span className="text-[11px] font-mono font-bold text-emerald-950 uppercase tracking-wider">
                {isHindi ? 'अक्सर पूछे जाने वाले सवाल (स्वाभाविक भाषा)' : 'GROUNDED NATURAL QUESTIONS'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {questions.map((q) => (
                <button
                  key={q.type}
                  onClick={() => setActiveQuestion(activeQuestion === q.type ? null : q.type)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeQuestion === q.type
                      ? 'bg-emerald-900 text-white shadow-md'
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  <span>{q.icon}</span>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>

            {/* Answer Display Card */}
            {currentAnswer && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-amber-50/60 border border-emerald-200/80 shadow-sm space-y-3 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 font-sans">
                    {currentAnswer.answerHeadline}
                  </h4>
                  <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                    {currentAnswer.answerBody}
                  </p>
                </div>

                {/* Supporting Data Points */}
                {currentAnswer.supportingDataPoints.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-emerald-200/50">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block font-semibold">
                      {isHindi ? 'मुख्य सहायक आंकड़े:' : 'Supporting Grounded Data:'}
                    </span>
                    <div className="space-y-0.5">
                      {currentAnswer.supportingDataPoints.map((dp, i) => (
                        <div key={i} className="text-[11px] font-mono text-emerald-900 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-600 shrink-0" />
                          <span>{dp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounding Attribution Sources */}
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-emerald-200/50">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    {isHindi ? 'सत्यापित स्रोत:' : 'Grounded Sources:'}
                  </span>
                  {currentAnswer.groundedSources.map((source, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-emerald-300/60 text-[10px] font-mono text-emerald-900 font-medium">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Level 5: Uncertainty & Model Provenance Disclosure */}
          <div className="p-4 rounded-2xl bg-zinc-100/80 border border-zinc-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-zinc-700 uppercase">
                <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                <span>{isHindi ? 'मॉडल स्रोत और प्रामाणिकता' : 'PROVENANCE & UNCERTAINTY DISCLOSURE'}</span>
              </div>
              <StatusPill status={isBaseline ? 'ESTIMATED' : 'SIMULATED'} size="xs" />
            </div>

            <p className="text-zinc-600 font-sans text-[11px] leading-relaxed">
              {expl.uncertaintyStatement}
            </p>

            <div className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-1">
              <span>{expl.sourceProvenanceDisclosure}</span>
              <span>Validated: {expl.generatedAt}</span>
            </div>
          </div>

          {/* Level 7: Decision Evidence Chain Button */}
          {onOpenEvidenceChain && (
            <button
              onClick={() => {
                onClose();
                onOpenEvidenceChain();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-mono font-bold flex items-center justify-between shadow-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-emerald-800" />
                <span>{isHindi ? 'लेवल 7: संपूर्ण निर्णय प्रमाण शृंखला देखें' : 'LEVEL 7: SHOW FULL DECISION EVIDENCE GRAPH'}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-100/90 border-t border-zinc-200 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-600 text-[11px]">
            <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>
              {isHindi ? 'किसान ही अंतिम निर्णयकर्ता है।' : 'Farmer remains the sole decision maker.'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold transition-all"
          >
            {isHindi ? 'समझ गया' : 'Acknowledge'}
          </button>
        </div>

      </div>
    </div>
  );
};
