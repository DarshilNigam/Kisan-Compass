import { 
  ActualOutcomeReport, 
  ForecastCalibrationStats, 
  LongitudinalDecisionRecord, 
  OutcomeClassification 
} from '../types/memory';

export interface OutcomeEntryInput {
  decisionId: string;
  salePricePerQuintal: number;
  quantityQuintals: number;
  mandi: string;
  saleDate: string;
  transportCost: number;
  otherDeductions: number;
  farmerNotes?: string;
}

/**
 * Deterministically calculates actual net realization and outcome classification.
 * Zero LLM calculation.
 */
export function processOutcomeEntry(
  input: OutcomeEntryInput,
  decision: LongitudinalDecisionRecord
): ActualOutcomeReport {
  const actualGrossInr = Math.round(input.salePricePerQuintal * input.quantityQuintals);
  const actualNetInr = Math.round(actualGrossInr - input.transportCost - input.otherDeductions);
  const deltaVsExpectedNetInr = actualNetInr - decision.expectedNetRealization;

  const { p10, p50, p90 } = decision.forecast;

  let classification: OutcomeClassification = 'WITHIN_RANGE';

  if (actualNetInr > p90) {
    classification = 'ABOVE_P90';
  } else if (actualNetInr < p10) {
    classification = 'BELOW_P10';
  } else {
    const spread = p90 - p10;
    if (Math.abs(actualNetInr - p50) <= spread * 0.15) {
      classification = 'NEAR_P50';
    } else {
      classification = 'WITHIN_RANGE';
    }
  }

  return {
    salePricePerQuintal: input.salePricePerQuintal,
    quantityQuintals: input.quantityQuintals,
    mandi: input.mandi,
    saleDate: input.saleDate,
    transportCost: input.transportCost,
    otherDeductions: input.otherDeductions,
    actualGrossInr,
    actualNetInr,
    deltaVsExpectedNetInr,
    classification,
    reportedAt: new Date().toISOString(),
    farmerNotes: input.farmerNotes,
  };
}

/**
 * Computes factual, observable calibration track record.
 * Avoids inflated "AI Accuracy = 99%" claims.
 */
export function computeForecastCalibrationStats(
  decisions: LongitudinalDecisionRecord[]
): ForecastCalibrationStats {
  const confirmed = decisions.filter(d => d.outcomeStatus === 'CONFIRMED' && d.actualOutcome);

  if (confirmed.length === 0) {
    return {
      totalOutcomes: 0,
      withinRangeCount: 0,
      nearP50Count: 0,
      belowP10Count: 0,
      aboveP90Count: 0,
      withinRangePercentage: 0,
      summaryFactualStatement: 'No verified outcomes recorded yet for this season.',
    };
  }

  let withinRange = 0;
  let nearP50 = 0;
  let belowP10 = 0;
  let aboveP90 = 0;

  for (const d of confirmed) {
    const cls = d.actualOutcome!.classification;
    if (cls === 'WITHIN_RANGE' || cls === 'NEAR_P50') {
      withinRange++;
      if (cls === 'NEAR_P50') nearP50++;
    } else if (cls === 'BELOW_P10') {
      belowP10++;
    } else if (cls === 'ABOVE_P90') {
      aboveP90++;
    }
  }

  const total = confirmed.length;
  const pct = Math.round((withinRange / total) * 100);

  return {
    totalOutcomes: total,
    withinRangeCount: withinRange,
    nearP50Count: nearP50,
    belowP10Count: belowP10,
    aboveP90Count: aboveP90,
    withinRangePercentage: pct,
    summaryFactualStatement: `${withinRange} of ${total} recorded outcomes (${pct}%) fell inside the displayed P10–P90 forecast range.`,
  };
}
