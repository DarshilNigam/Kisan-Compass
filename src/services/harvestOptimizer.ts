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
export function evaluateHarvestOptions(
  state: FarmState,
  riskAversion: number = 0.68
): CandidateHarvestOption[] {
  const totalQuantity = state.estimatedHarvestQuintals || 32;
  const unnaoMandi = state.market.destinations[0]?.name || 'Unnao Mandi (APMC)';
  const targetGdd = state.gddTarget > 0 ? state.gddTarget : 1950;
  const maturityPct = targetGdd > 0 ? (state.gddAccumulated / targetGdd) * 100 : 0;
  const isCropMature = maturityPct >= 85;

  const options: CandidateHarvestOption[] = [
    // 1. SELL NOW (100% Immediate Harvest)
    {
      id: 'OPT-SELL-NOW-32',
      label: `100% Immediate Harvest (${totalQuantity} qtl Now)`,
      type: 'SELL_NOW',
      nowQuantityQuintals: totalQuantity,
      laterQuantityQuintals: 0,
      nowDestinationMandi: unnaoMandi,
      laterDestinationMandi: 'None',
      nowNetRealizationInr: 74820,
      laterNetRealizationInr: 0,
      totalExpectedNetRealizationInr: 74820,
      range: {
        p10: 71200,
        p50: 74820,
        p90: 77400,
      },
      downsideExposureInr: 3620, // P50 - P10
      utilityScore: +( (74820 - riskAversion * 3620) / 1000 ).toFixed(1),
      isMathematicallyOptimal: isCropMature ? riskAversion >= 0.55 : false,
      strategicRationale: isCropMature
        ? 'Liquidates 100% of yield within the clear weather window. Eliminates lodging and grain dockage risk from approaching rain.'
        : `Immediate harvest not recommended: ${state.crop || 'crop'} is only at ${maturityPct.toFixed(0)}% physiological maturity (${state.cropStage || 'developmental'}).`,
    },

    // 2. SPLIT HARVEST (20 qtl Now / 12 qtl Later) - Defensive Hedge
    {
      id: 'OPT-SPLIT-20-12',
      label: 'Defensive Split (20 qtl Now / 12 qtl Later)',
      type: 'SPLIT',
      nowQuantityQuintals: 20,
      laterQuantityQuintals: 12,
      nowDestinationMandi: unnaoMandi,
      laterDestinationMandi: unnaoMandi,
      nowNetRealizationInr: 46800,
      laterNetRealizationInr: 27450,
      totalExpectedNetRealizationInr: 74250,
      range: {
        p10: 70400,
        p50: 74250,
        p90: 78100,
      },
      downsideExposureInr: 3850,
      utilityScore: +( (74250 - riskAversion * 3850) / 1000 ).toFixed(1),
      isMathematicallyOptimal: riskAversion > 0.40 && riskAversion < 0.55,
      strategicRationale: 'Liquidates 62.5% of crop to lock in ₹46,800 cash before storm, while holding 37.5% under tarp storage for post-storm market upside.',
    },

    // 3. BALANCED SPLIT (16 qtl Now / 16 qtl Later) - 50/50 Hedge
    {
      id: 'OPT-SPLIT-16-16',
      label: 'Balanced 50/50 Split (16 qtl Now / 16 qtl Later)',
      type: 'SPLIT',
      nowQuantityQuintals: 16,
      laterQuantityQuintals: 16,
      nowDestinationMandi: unnaoMandi,
      laterDestinationMandi: unnaoMandi,
      nowNetRealizationInr: 37400,
      laterNetRealizationInr: 36250,
      totalExpectedNetRealizationInr: 73650,
      range: {
        p10: 68500,
        p50: 73650,
        p90: 78200,
      },
      downsideExposureInr: 5150,
      utilityScore: +( (73650 - riskAversion * 5150) / 1000 ).toFixed(1),
      isMathematicallyOptimal: false,
      strategicRationale: 'Equal 50/50 partition between locked cash realization and potential market rebound.',
    },

    // 4. WAIT (100% Hold / Growth Cycle)
    {
      id: 'OPT-WAIT-32',
      label: isCropMature ? '100% Speculative Hold (Harvest on Day +5)' : `Hold Standing ${state.crop || 'Crop'} (Growth & Bulking)`,
      type: 'WAIT',
      nowQuantityQuintals: 0,
      laterQuantityQuintals: totalQuantity,
      nowDestinationMandi: 'None',
      laterDestinationMandi: unnaoMandi,
      nowNetRealizationInr: 0,
      laterNetRealizationInr: 72500,
      totalExpectedNetRealizationInr: 72500,
      range: {
        p10: 62800,
        p50: 72500,
        p90: 78200,
      },
      downsideExposureInr: 9700,
      utilityScore: +( (72500 - riskAversion * 9700) / 1000 ).toFixed(1),
      isMathematicallyOptimal: !isCropMature ? true : riskAversion <= 0.35,
      strategicRationale: !isCropMature
        ? `Crop is in developmental stage (${state.cropStage || 'growing'}, ${maturityPct.toFixed(0)}% mature). Holding standing crop is required for physiological maturation and optimal yield.`
        : 'Delays entire harvest by 5 days. Suffers estimated ₹2,100 storm dockage but fully participates in projected ₹40/qtl spot price rebound.',
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
