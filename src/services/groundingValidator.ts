import { DecisionExplanationContext, GroundedExplanation, GroundingValidationResult } from '../types/explanation';

export function validateExplanationGrounding(
  explanation: GroundedExplanation,
  context: DecisionExplanationContext
): GroundingValidationResult {
  const errors: string[] = [];

  // 1. Check Recommendation Consistency
  const recUpper = context.decision.recommendation.toUpperCase();
  const headlineUpper = explanation.headline.toUpperCase();
  const summaryUpper = explanation.summary.toUpperCase();

  const isSellNow = recUpper.includes('SELL');
  const isWait = recUpper.includes('WAIT') || recUpper.includes('HOLD');

  if (isSellNow && (headlineUpper.includes('WAIT') || summaryUpper.includes('WAIT'))) {
    if (!headlineUpper.includes('NOT WAIT') && !summaryUpper.includes('RATHER THAN WAIT')) {
      errors.push(`Recommendation mismatch: Context is ${recUpper} but explanation suggests waiting.`);
    }
  }

  if (isWait && headlineUpper.includes('SELL IMMEDIATELY')) {
    errors.push(`Recommendation mismatch: Context is ${recUpper} but explanation suggests immediate sale.`);
  }

  // 2. Check Forecast Source Truthfulness
  if (context.forecast.source === 'BASELINE') {
    if (
      headlineUpper.includes('CHRONOS PREDICTS') ||
      summaryUpper.includes('CHRONOS PREDICTS') ||
      explanation.uncertaintyStatement.toUpperCase().includes('LIVE CHRONOS MODEL')
    ) {
      errors.push('Truthfulness violation: Claimed live Chronos model prediction when forecast source is BASELINE.');
    }
  }

  // 3. Extract numbers from text and check if they exist in context (allowing minor formatting differences)
  const fullText = `${explanation.headline} ${explanation.summary} ${explanation.uncertaintyStatement}`;
  const numberRegex = /₹?\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)/g;
  const matches = fullText.match(numberRegex) || [];

  const validNumbers = new Set<number>([
    context.decision.expectedNetRealization,
    context.decision.currentNetRealization,
    context.decision.range.p10,
    context.decision.range.p50,
    context.decision.range.p90,
    Math.abs(context.decision.deltaVsTodayInr),
    context.decision.horizonDays,
    context.forecast.p10Price,
    context.forecast.p50Price,
    context.forecast.p90Price,
    context.weather.precipitationProbability48h,
    context.weather.currentTemp,
    context.market.grossPricePerQuintal,
    context.market.netRealizationPerQuintal,
    context.market.totalNetRealization,
    context.market.estimatedTransportCost,
    context.market.spoilageRiskPercent,
    context.crop.quantityQuintals,
    context.crop.areaAcres,
    context.crop.gddAccumulated,
    context.crop.gddTarget,
    Math.round(context.crop.maturityPercent),
    Math.round(context.farmer.riskAversion * 100),
    Math.round(context.weather.precipitationProbability48h),
    28, 29, 30, 31, 32, 14, 7, 5, 3, 2, 1, 0 // Common date offsets / horizons
  ]);

  for (const match of matches) {
    const cleanNum = parseFloat(match.replace(/[₹,\s]/g, ''));
    if (!isNaN(cleanNum) && cleanNum > 100) { // Check major financial figures
      let matched = false;
      for (const val of validNumbers) {
        if (Math.abs(cleanNum - val) < 5 || Math.abs(cleanNum - val * 1000) < 5) {
          matched = true;
          break;
        }
      }
      if (!matched && cleanNum > 1000) {
        console.warn(`[GroundingValidator] Unverified financial token: ${match} in explanation.`);
      }
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    sanitizedExplanation: {
      ...explanation,
      validatedGrounding: isValid,
    },
  };
}
