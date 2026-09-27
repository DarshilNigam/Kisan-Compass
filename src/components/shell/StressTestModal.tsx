import React, { useState, useMemo } from 'react';
import { useFarm } from '../../context/FarmContext';
import { 
  StressTestScenarioInputs, 
  CandidateHarvestOption
} from '../../types/stressTest';
import { 
  runDecisionStressTest, 
  defaultStressTestInputs 
} from '../../services/stressTestEngine';
import { evaluateDecisionConflicts } from '../../services/conflictEngine';
import { 
  evaluateHarvestOptions, 
  generateHarvestActionPlan 
} from '../../services/harvestOptimizer';
import { 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  CloudRain, 
  Truck, 
  Calculator, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  FileText, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface StressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'stress' | 'conflicts' | 'optimizer' | 'plan';
}

export const StressTestModal: React.FC<StressTestModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'stress',
}) => {
  const { 
    state, 
    forecast, 
    extendedPreferences, 
    recordDecisionAction,
    explanationLanguage,
    setExplanationLanguage 
  } = useFarm();

  const [activeTab, setActiveTab] = useState<'stress' | 'conflicts' | 'optimizer' | 'plan'>(initialTab);
  const [scenarioInputs, setScenarioInputs] = useState<StressTestScenarioInputs>({
    ...defaultStressTestInputs,
    simulatedRiskAversion: extendedPreferences.riskAversion,
  });

  const [showMathTrace, setShowMathTrace] = useState<boolean>(false);
  const [selectedHarvestOption, setSelectedHarvestOption] = useState<CandidateHarvestOption | null>(null);
  const [planApprovedNotice, setPlanApprovedNotice] = useState<string | null>(null);

  const isHindi = explanationLanguage === 'hi';

  // Real-time deterministic stress test computation
  const stressResult = useMemo(() => {
    return runDecisionStressTest(state, forecast, scenarioInputs);
  }, [state, forecast, scenarioInputs]);

  // Decision-grade conflicts
  const conflicts = useMemo(() => {
    return evaluateDecisionConflicts(state);
  }, [state]);

  // Harvest options
  const harvestOptions = useMemo(() => {
    return evaluateHarvestOptions(state, scenarioInputs.simulatedRiskAversion);
  }, [state, scenarioInputs.simulatedRiskAversion]);

  // Current active option (defaults to optimal)
  const currentOption = selectedHarvestOption || harvestOptions.find(o => o.isMathematicallyOptimal) || harvestOptions[0];

  // Generated action plan
  const actionPlan = useMemo(() => {
    return generateHarvestActionPlan(currentOption, state);
  }, [currentOption, state]);

  if (!isOpen) return null;

  const handleResetScenario = () => {
    setScenarioInputs({
      ...defaultStressTestInputs,
      simulatedRiskAversion: extendedPreferences.riskAversion,
    });
  };

  const handleApprovePlan = () => {
    recordDecisionAction(
      state.currentDecision.id,
      'ACCEPTED',
      undefined,
      `Approved via Stage 6 Harvest Optimizer: ${currentOption.label}`
    );
    setPlanApprovedNotice(
      isHindi 
        ? 'कटाई कार्य योजना स्वीकृत! यह निर्णय लेजर मेमोरी में सुरक्षित कर दिया गया है।'
        : 'Harvest Action Plan Approved! Recorded in Decision Memory Ledger.'
    );
    setTimeout(() => {
      setPlanApprovedNotice(null);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#FCFAF6] border border-[#E3DCB8] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#FAF6EB] to-[#FCFAF6] border-b border-[#E8E1C5] flex items-start justify-between gap-3 sticky top-0 z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                <Zap className="w-3 h-3 text-emerald-300" />
                {isHindi ? 'निर्णय तनाव परीक्षण व कटाई योजना' : 'DECISION STRESS TEST & HARVEST OPTIMIZER'}
              </span>
              <span className="text-zinc-300">•</span>
              
              {/* Robustness Badge */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                stressResult.decisionRobustness === 'ROBUST'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : stressResult.decisionRobustness === 'SENSITIVE'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                {stressResult.decisionRobustness} {isHindi ? 'स्थिरता' : 'ROBUSTNESS'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-zinc-900 font-sans tracking-tight">
              {activeTab === 'stress' && (isHindi ? 'धारणाओं का तनाव परीक्षण' : 'Stress-Test Key Environmental Assumptions')}
              {activeTab === 'conflicts' && (isHindi ? 'सिग्नल विरोधाभास विश्लेषण' : 'Decision-Grade Signal Contradictions')}
              {activeTab === 'optimizer' && (isHindi ? 'कटाई विकल्प तुलना (पूर्ण बनाम आंशिक)' : 'Harvest Optimizer (Full vs Split Strategy)')}
              {activeTab === 'plan' && (isHindi ? 'कार्यकारी कटाई योजना' : 'Formulated Harvest Action Plan')}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Bilingual Switcher */}
            <div className="flex items-center bg-zinc-200/80 p-0.5 rounded-xl text-xs font-mono font-semibold">
              <button
                onClick={() => setExplanationLanguage('en')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  explanationLanguage === 'en'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setExplanationLanguage('hi')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
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
              className="p-1.5 rounded-full bg-zinc-200/60 hover:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Strip */}
        <div className="px-4 sm:px-6 py-2 bg-zinc-100/80 border-b border-zinc-200 flex items-center gap-1.5 overflow-x-auto text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('stress')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'stress'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'bg-white/80 border border-zinc-200 text-zinc-700 hover:bg-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>[1] {isHindi ? 'तनाव परीक्षण' : 'STRESS TEST'}</span>
          </button>

          <button
            onClick={() => setActiveTab('conflicts')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'conflicts'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'bg-white/80 border border-zinc-200 text-zinc-700 hover:bg-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>[2] {isHindi ? 'सिग्नल टकराव' : 'CONFLICTS'} ({conflicts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('optimizer')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'optimizer'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'bg-white/80 border border-zinc-200 text-zinc-700 hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>[3] {isHindi ? 'कटाई विकल्प' : 'OPTIMIZER'}</span>
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'plan'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'bg-white/80 border border-zinc-200 text-zinc-700 hover:bg-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>[4] {isHindi ? 'कार्य योजना' : 'ACTION PLAN'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* TAB 1: STRESS TEST SCENARIOS */}
          {activeTab === 'stress' && (
            <div className="space-y-6">
              
              {/* Recalculated Decision Card */}
              <div className="p-5 rounded-2xl bg-emerald-950 text-white shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest block font-bold">
                      {isHindi ? 'पुनर्गणित अनुशंसित कदम' : 'RECALCULATED RECOMMENDATION UNDER STRESS'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xl sm:text-2xl font-black text-white font-sans">
                        {stressResult.recalculatedRecommendation}
                      </span>
                      {stressResult.isFlippedFromBaseline && (
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-amber-950 text-[10px] font-mono font-bold animate-pulse">
                          {isHindi ? 'सिफारिश बदली' : 'ACTION FLIPPED'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest block font-bold">
                      {isHindi ? 'शुद्ध आय' : 'EXPECTED NET REALIZATION'}
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                      ₹{stressResult.recalculatedNetRealization.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-300">
                      P10 ₹{stressResult.recalculatedRange.p10.toLocaleString('en-IN')} – P90 ₹{stressResult.recalculatedRange.p90.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Robustness statement */}
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
                  {stressResult.robustnessExplanation}
                </p>
              </div>

              {/* Stress Test Control Sliders */}
              <div className="space-y-4 p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="tech-label text-emerald-950 font-bold block">
                    {isHindi ? 'पर्यावरणीय कारक स्लाइडर्स (सैंडबॉक्स)' : 'SANDBOXED SCENARIO PERTURBATION SLIDERS'}
                  </span>
                  <button
                    onClick={handleResetScenario}
                    className="text-[11px] font-mono text-zinc-500 hover:text-zinc-800 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isHindi ? 'रीसेट' : 'Reset Inputs'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  
                  {/* Rain Slider */}
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-zinc-800 flex items-center gap-1">
                        <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                        {isHindi ? 'बारिश जोखिम' : '48h Rain Risk'}
                      </span>
                      <strong className="text-zinc-900 font-bold text-sm">{scenarioInputs.rainProbability}%</strong>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="90"
                      value={scenarioInputs.rainProbability}
                      onChange={(e) => setScenarioInputs(prev => ({ ...prev, rainProbability: Number(e.target.value) }))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>15% (Clear)</span>
                      <span>90% (Storm)</span>
                    </div>
                  </div>

                  {/* Market Price Slider */}
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-zinc-800 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        {isHindi ? 'मंडी भाव बदलाव' : 'Market Price Shift'}
                      </span>
                      <strong className="text-zinc-900 font-bold text-sm">
                        {scenarioInputs.priceMultiplier >= 1.0 ? '+' : ''}
                        {Math.round((scenarioInputs.priceMultiplier - 1.0) * 100)}%
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="85"
                      max="120"
                      value={scenarioInputs.priceMultiplier * 100}
                      onChange={(e) => setScenarioInputs(prev => ({ ...prev, priceMultiplier: Number(e.target.value) / 100 }))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>-15% Soft</span>
                      <span>+20% Rally</span>
                    </div>
                  </div>

                  {/* Freight Slider */}
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-zinc-800 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        {isHindi ? 'ढुलाई खर्च' : 'Freight Surcharge'}
                      </span>
                      <strong className="text-zinc-900 font-bold text-sm">
                        {scenarioInputs.freightMultiplier >= 1.0 ? '+' : ''}
                        {Math.round((scenarioInputs.freightMultiplier - 1.0) * 100)}%
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="90"
                      max="135"
                      value={scenarioInputs.freightMultiplier * 100}
                      onChange={(e) => setScenarioInputs(prev => ({ ...prev, freightMultiplier: Number(e.target.value) / 100 }))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>-10% Discount</span>
                      <span>+35% Surcharge</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* What Would Change My Mind Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold font-mono">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{isHindi ? 'यह निर्णय कब बदलेगा? (What Would Change My Mind?)' : 'WHAT WOULD CHANGE THIS DECISION?'}</span>
                </div>

                <p className="text-amber-900 font-sans text-xs sm:text-sm leading-relaxed">
                  {stressResult.whatWouldChangeMyMind.flipConditionSummary}
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-amber-200/60 font-mono text-[11px] text-amber-800 flex-wrap">
                  <span>Rain Flip Boundary: <strong>~{stressResult.whatWouldChangeMyMind.rainFlipThresholdPercent}%</strong></span>
                  <span>•</span>
                  <span>Price Rally Trigger: <strong>+{stressResult.whatWouldChangeMyMind.priceFlipThresholdPercent}%</strong></span>
                </div>
              </div>

              {/* Step-by-Step Stress Calculation Trace */}
              <div className="border border-zinc-200 rounded-2xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => setShowMathTrace(!showMathTrace)}
                  className="w-full p-4 flex items-center justify-between bg-zinc-50 hover:bg-zinc-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-800" />
                    <span className="font-mono text-xs font-bold text-zinc-900 uppercase">
                      {isHindi ? 'तनाव परीक्षण गणित देखें (Show Calculation)' : 'SHOW STRESS-TEST ARITHMETIC TRACE'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {showMathTrace ? 'Hide' : 'Expand'}
                  </span>
                </button>

                {showMathTrace && (
                  <div className="p-4 border-t border-zinc-200 space-y-2 text-xs font-mono bg-zinc-50/40">
                    <div className="flex justify-between py-1 border-b border-zinc-200">
                      <span>1. Recalculated Gross Value (32 qtl × ₹{Math.round(state.market.modalPrice * scenarioInputs.priceMultiplier)}):</span>
                      <span className="font-bold">₹{stressResult.recalculatedGrossInr.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200 text-rose-700">
                      <span>2. Stress Freight Deduction:</span>
                      <span className="font-bold">-₹{stressResult.recalculatedFreightInr.toLocaleString('en-IN')}</span>
                    </div>
                    {stressResult.recalculatedWeatherPenaltyInr > 0 && (
                      <div className="flex justify-between py-1 border-b border-zinc-200 text-amber-700">
                        <span>3. Stress Weather Penalty ({scenarioInputs.rainProbability}% Rain):</span>
                        <span className="font-bold">-₹{stressResult.recalculatedWeatherPenaltyInr.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 border-t-2 border-emerald-950 font-bold text-sm text-emerald-950">
                      <span>= Recalculated Net Cash Realization:</span>
                      <span>₹{stressResult.recalculatedNetRealization.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SIGNAL CONFLICTS */}
          {activeTab === 'conflicts' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-zinc-900 font-sans">
                  {isHindi ? 'सक्रिय कृषि व बाजार सिग्नल टकराव' : 'Decision-Grade Signal Contradictions'}
                </h3>
                <p className="text-xs text-zinc-600 font-sans">
                  The system transparently reconciles competing signals rather than hiding real-world contradictions.
                </p>
              </div>

              <div className="space-y-3">
                {conflicts.map((conf) => (
                  <div key={conf.id} className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-zinc-900">{conf.title}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                        {conf.category.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-0.5">
                        <span className="text-[10px] text-blue-800 uppercase block font-semibold">{conf.signalA.name}</span>
                        <div className="font-bold text-zinc-900">{conf.signalA.value}</div>
                        <div className="text-[10px] text-blue-900">Favors: {conf.signalA.favorsAction}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-0.5">
                        <span className="text-[10px] text-emerald-800 uppercase block font-semibold">{conf.signalB.name}</span>
                        <div className="font-bold text-zinc-900">{conf.signalB.value}</div>
                        <div className="text-[10px] text-emerald-900">Favors: {conf.signalB.favorsAction}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-100 text-xs font-sans space-y-1">
                      <div className="font-bold text-zinc-900">Deterministic Reconciliation:</div>
                      <p className="text-zinc-700 leading-relaxed">{conf.currentDecisionTradeoff}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HARVEST OPTIMIZER */}
          {activeTab === 'optimizer' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-zinc-900 font-sans">
                  {isHindi ? 'कटाई रणनीति तुलना' : 'Evaluate All Candidate Harvest Strategies'}
                </h3>
                <p className="text-xs text-zinc-600 font-sans">
                  Total batch quantity (32 quintals) evaluated across all-or-nothing and partial split harvest scenarios.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {harvestOptions.map((opt) => {
                  const isSelected = (selectedHarvestOption?.id || harvestOptions[0].id) === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedHarvestOption(opt)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/30'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-zinc-900">
                            {opt.label}
                          </span>
                          {opt.isMathematicallyOptimal && (
                            <span className="px-2 py-0.5 rounded bg-emerald-900 text-white font-mono text-[9px] font-bold">
                              OPTIMAL
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-baseline justify-between font-mono">
                            <span className="text-xs text-zinc-500">Expected Net:</span>
                            <span className="text-xl font-black text-emerald-950">
                              ₹{opt.totalExpectedNetRealizationInr.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                            <span>Range (P10–P90):</span>
                            <span>₹{opt.range.p10.toLocaleString('en-IN')} – ₹{opt.range.p90.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                          {opt.strategicRationale}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHarvestOption(opt);
                          setActiveTab('plan');
                        }}
                        className={`w-full py-2 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-emerald-900 text-white'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                        }`}
                      >
                        <span>SELECT FOR ACTION PLAN</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ACTION PLAN */}
          {activeTab === 'plan' && (
            <div className="space-y-5">
              
              <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div>
                    <span className="tech-label text-[10px] text-emerald-950 font-bold block">
                      FORMULATED HARVEST PLAN
                    </span>
                    <h3 className="text-lg font-black text-zinc-900 font-sans">
                      {currentOption.label}
                    </h3>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-zinc-400 uppercase block">Expected Net</span>
                    <span className="text-xl font-black text-emerald-950">
                      ₹{actionPlan.expectedNetRealization.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <strong className="text-emerald-950 block font-bold">1. Immediate Field Action:</strong>
                    <p className="text-emerald-900">{actionPlan.immediateAction}</p>
                    <div className="text-[11px] font-mono text-emerald-800 pt-1">
                      Target Window: {actionPlan.targetHarvestWindow} • APMC: {actionPlan.destinationMandi}
                    </div>
                  </div>

                  {actionPlan.retainedBatchAction && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <strong className="text-amber-950 block font-bold">2. Retained Batch Strategy:</strong>
                      <p className="text-amber-900">{actionPlan.retainedBatchAction}</p>
                    </div>
                  )}
                </div>

                {/* Reassessment Triggers */}
                <div className="space-y-2 pt-2">
                  <span className="tech-label text-zinc-700 font-bold block">
                    ACTIVE MONITORING & REASSESSMENT TRIGGERS
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {actionPlan.reassessmentTriggers.map((trig) => (
                      <div key={trig.id} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-zinc-900">
                          <span>{trig.title}</span>
                          <span className="text-emerald-800 text-[10px]">{trig.threshold}</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 font-sans">{trig.conditionText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Approval notification toast */}
              {planApprovedNotice && (
                <div className="p-3 rounded-xl bg-emerald-900 text-white text-xs font-mono flex items-center gap-2 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{planApprovedNotice}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-xs font-mono font-semibold text-zinc-700 transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleApprovePlan}
                  className="px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{isHindi ? 'कार्य योजना स्वीकृत करें (APPROVE & MOBILIZE)' : 'APPROVE & MOBILIZE HARVEST PLAN'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-zinc-100/90 border-t border-zinc-200 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Deterministic Scenario Sensitivity • Zero LLM Arithmetic</span>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-900 font-semibold"
          >
            Acknowledge
          </button>
        </div>

      </div>
    </div>
  );
};
