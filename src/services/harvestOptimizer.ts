import { FarmState } from '../types/farm';
import { 
  CandidateHarvestOption, 
  HarvestActionPlan, 
  ReassessmentTrigger 
} from '../types/stressTest';

/**
 * Deterministic Harvest Optimizer
 * Evaluates full liquidation, full delay, and candidate partial splits.
 * Zero LLM calculation.
 */
import { computeCanonicalScenarios, calculateHarvestScenario } from './economicScenarioEngine';
import { ProbabilisticForecast } from '../types/forecast';

/**
 * Deterministic Harvest Optimizer
 * Evaluates full liquidation, full delay, and candidate partial splits.
 * Consumes the single canonical economic scenario engine. Zero LLM calculation.
 */
export function evaluateHarvestOptions(
  state: FarmState,
  riskAversion: number = 0.68,
  forecast?: ProbabilisticForecast | null
): CandidateHarvestOption[] {
  const totalQuantity = Math.max(1, state.estimatedHarvestQuintals > 0 ? state.estimatedHarvestQuintals : 25);
  const optimalMandiName = state.market.destinations[0]?.name || 'Primary Mandi (APMC)';
  const targetGdd = state.gddTarget > 0 ? state.gddTarget : 1950;
  const maturityPct = targetGdd > 0 ? (state.gddAccumulated / targetGdd) * 100 : 0;
  const isCropMature = maturityPct >= 85;

  const canonical = computeCanonicalScenarios(state, forecast);
  const { scenarioA, scenarioB, scenarioC } = canonical;

  // Defensive 60/40 Split calculation via canonical engine
  const qNow60 = Math.round(totalQuantity * 0.6);
  const qLater40 = totalQuantity - qNow60;
  const leg60Now = calculateHarvestScenario(state, { daysFromNow: 0, quantityQuintals: qNow60 }, forecast);
  const leg40Later = calculateHarvestScenario(state, { daysFromNow: 5, quantityQuintals: qLater40, isSplitSecondLeg: true }, forecast);
  const friction6040 = Math.round(250 + qLater40 * 8);
  const net6040 = Math.max(0, leg60Now.netTakeHome + leg40Later.netTakeHome - friction6040);
  const p10Net6040 = Math.round(net6040 * 0.95);
  const p90Net6040 = Math.round(net6040 * 1.04);
  const downside6040 = Math.max(0, net6040 - p10Net6040);

  const options: CandidateHarvestOption[] = [
    // 1. SELL NOW (100% Immediate Harvest) — Consumes Canonical Scenario A
    {
      id: `OPT-SELL-NOW-${totalQuantity}`,
      label: `100% Immediate Harvest (${totalQuantity} qtl Now)`,
      type: 'SELL_NOW',
      nowQuantityQuintals: totalQuantity,
      laterQuantityQuintals: 0,
      nowDestinationMandi: optimalMandiName,
      laterDestinationMandi: 'None',
      nowNetRealizationInr: scenarioA.netTakeHome,
      laterNetRealizationInr: 0,
      totalExpectedNetRealizationInr: scenarioA.netTakeHome,
      range: {
        p10: scenarioA.p10NetTakeHome,
        p50: scenarioA.netTakeHome,
        p90: scenarioA.p90NetTakeHome,
      },
      downsideExposureInr: scenarioA.downsideExposure,
      utilityScore: +( (scenarioA.netTakeHome - riskAversion * scenarioA.downsideExposure) / 1000 ).toFixed(1),
      isMathematicallyOptimal: isCropMature ? riskAversion >= 0.55 : false,
      strategicRationale: isCropMature
        ? `Liquidates 100% of yield within the clear weather window to lock in ₹${scenarioA.netTakeHome.toLocaleString('en-IN')}. Eliminates lodging and grain dockage risk from approaching rain.`
        : `Immediate harvest not recommended: ${state.crop || 'crop'} is only at ${maturityPct.toFixed(0)}% physiological maturity (${state.cropStage || 'developmental'}).`,
    },

    // 2. SPLIT HARVEST (Defensive 60/40 Hedge)
    {
      id: `OPT-SPLIT-${qNow60}-${qLater40}`,
      label: `Defensive Split (${qNow60} qtl Now / ${qLater40} qtl Later)`,
      type: 'SPLIT',
      nowQuantityQuintals: qNow60,
      laterQuantityQuintals: qLater40,
      nowDestinationMandi: optimalMandiName,
      laterDestinationMandi: optimalMandiName,
      nowNetRealizationInr: leg60Now.netTakeHome,
      laterNetRealizationInr: Math.max(0, leg40Later.netTakeHome - friction6040),
      totalExpectedNetRealizationInr: net6040,
      range: {
        p10: p10Net6040,
        p50: net6040,
        p90: p90Net6040,
      },
      downsideExposureInr: downside6040,
      utilityScore: +( (net6040 - riskAversion * downside6040) / 1000 ).toFixed(1),
      isMathematicallyOptimal: isCropMature && riskAversion > 0.40 && riskAversion < 0.55,
      strategicRationale: `Liquidates ${qNow60} qtl to lock in ₹${leg60Now.netTakeHome.toLocaleString('en-IN')} cash before storm, while holding ${qLater40} qtl for post-storm market upside.`,
    },

    // 3. BALANCED SPLIT (50/50 Hedge) — Consumes Canonical Scenario C
    {
      id: `OPT-SPLIT-${scenarioC.nowQuantity}-${scenarioC.laterQuantity}`,
      label: `Balanced 50/50 Split (${scenarioC.nowQuantity} qtl Now / ${scenarioC.laterQuantity} qtl Later)`,
      type: 'SPLIT',
      nowQuantityQuintals: scenarioC.nowQuantity,
      laterQuantityQuintals: scenarioC.laterQuantity,
      nowDestinationMandi: optimalMandiName,
      laterDestinationMandi: optimalMandiName,
      nowNetRealizationInr: scenarioC.immediateScenario.netTakeHome,
      laterNetRealizationInr: Math.max(0, scenarioC.futureScenario.netTakeHome - scenarioC.splitFrictionCost),
      totalExpectedNetRealizationInr: scenarioC.netTakeHome,
      range: {
        p10: scenarioC.p10NetTakeHome,
        p50: scenarioC.netTakeHome,
        p90: scenarioC.p90NetTakeHome,
      },
      downsideExposureInr: scenarioC.downsideExposure,
      utilityScore: +( (scenarioC.netTakeHome - riskAversion * scenarioC.downsideExposure) / 1000 ).toFixed(1),
      isMathematicallyOptimal: false,
      strategicRationale: `Equal partition: locks in ₹${scenarioC.immediateScenario.netTakeHome.toLocaleString('en-IN')} immediate liquidity, while holding ${scenarioC.laterQuantity} qtl for post-storm sale.`,
    },

    // 4. WAIT (100% Hold on Day +5) — Consumes Canonical Scenario B (+5 Days)
    {
      id: `OPT-WAIT-${totalQuantity}`,
      label: isCropMature ? '100% Speculative Hold (Harvest on Day +5)' : `Hold Standing ${state.crop || 'Crop'} (Growth & Bulking)`,
      type: 'WAIT',
      nowQuantityQuintals: 0,
      laterQuantityQuintals: totalQuantity,
      nowDestinationMandi: 'None',
      laterDestinationMandi: optimalMandiName,
      nowNetRealizationInr: 0,
      laterNetRealizationInr: scenarioB.netTakeHome,
      totalExpectedNetRealizationInr: scenarioB.netTakeHome,
      range: {
        p10: scenarioB.p10NetTakeHome,
        p50: scenarioB.netTakeHome,
        p90: scenarioB.p90NetTakeHome,
      },
      downsideExposureInr: scenarioB.downsideExposure,
      utilityScore: +( (scenarioB.netTakeHome - riskAversion * scenarioB.downsideExposure) / 1000 ).toFixed(1),
      isMathematicallyOptimal: !isCropMature ? true : riskAversion <= 0.35,
      strategicRationale: !isCropMature
        ? `Crop is in developmental stage (${state.cropStage || 'growing'}, ${maturityPct.toFixed(0)}% mature). Holding standing crop is required for physiological maturation and optimal yield.`
        : `Delays entire harvest to Day +5 (Expected Net: ₹${scenarioB.netTakeHome.toLocaleString('en-IN')}). Absorbs weather penalty of ₹${scenarioB.penalties.weatherPenalty.toLocaleString('en-IN')}.`,
    },
  ];

  return options;
}

export const defaultReassessmentTriggers: ReassessmentTrigger[] = [
  {
    id: 'TRIG-RAIN-15',
    title: 'Precipitation Probability Shift',
    conditionText: '48h rain forecast probability changes by more than 15 percentage points.',
    threshold: 'Δ Rain > 15%',
    monitoredSource: 'Open-Meteo High-Resolution Ensemble (Hourly Feed)',
  },
  {
    id: 'TRIG-PRICE-5',
    title: 'APMC Modal Price Drift',
    conditionText: 'Regional spot mandi price drifts by more than 5% (±₹120/qtl).',
    threshold: 'Δ Price > 5%',
    monitoredSource: 'AGMARKNET Daily Wholesale Bulletin (14:00 IST)',
  },
  {
    id: 'TRIG-CONF-LOW',
    title: 'Forecast Uncertainty Expansion',
    conditionText: 'Forecast engine source status drops to LOW confidence or telemetry degrades.',
    threshold: 'Confidence = LOW',
    monitoredSource: 'Audit Telemetry & Multi-Model Dispersion',
  },
  {
    id: 'TRIG-FREIGHT-15',
    title: 'Rural Logistics Surcharge',
    conditionText: 'Dedicated freight quote to Unnao Mandi changes by more than ₹200.',
    threshold: 'Δ Freight > 15%',
    monitoredSource: 'Local Transport Union / Route Matrix',
  },
];

/**
 * Formulates a concrete Harvest Action Plan for farmer review and execution.
 */
export function generateHarvestActionPlan(
  selectedOption: CandidateHarvestOption,
  state: FarmState
): HarvestActionPlan {
  const isSplit = selectedOption.type === 'SPLIT';
  const isWait = selectedOption.type === 'WAIT';

  const fieldName = state.fieldName || 'Active Field';
  const cropName = state.crop || 'Standing Crop';

  let immediateAction = `Harvest and mobilize ${selectedOption.nowQuantityQuintals} quintals immediately on ${fieldName}.`;
  let targetWindow = 'Next 36 Hours (Prior to Friday 18:00 IST)';
  let retainedAction: string | undefined = undefined;

  if (isWait) {
    immediateAction = `Hold standing ${cropName} crop on ${fieldName} for 5 days. Monitor weather updates.`;
    targetWindow = 'March 31 – April 02, 2026';
  } else if (isSplit) {
    immediateAction = `Mobilize combine for first lot of ${selectedOption.nowQuantityQuintals} quintals. Dispatch to ${selectedOption.nowDestinationMandi}.`;
    retainedAction = `Retain remaining ${selectedOption.laterQuantityQuintals} quintals under protected farm storage. Reassess market on March 30.`;
  }

  return {
    planId: `PLAN-${Date.now()}`,
    createdAt: new Date().toISOString(),
    selectedOption,
    immediateAction,
    destinationMandi: selectedOption.nowDestinationMandi,
    targetHarvestWindow: targetWindow,
    retainedBatchAction: retainedAction,
    expectedNetRealization: selectedOption.totalExpectedNetRealizationInr,
    expectedRange: selectedOption.range,
    confidence: 'HIGH',
    reassessmentTriggers: defaultReassessmentTriggers,
    approvalRequired: true,
    status: 'DRAFT',
  };
}
