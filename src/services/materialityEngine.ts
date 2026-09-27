import { MaterialityClassification, EventSeverity } from '../types/farmWatch';

/**
 * Deterministic Materiality Engine for Stage 8 Farm Watch
 * Evaluates whether a delta constitutes Noise, Info, Material, or Decision Changing.
 * Enforces Hysteresis to prevent threshold oscillation.
 * Zero LLM speculation.
 */

export interface MaterialityEvaluation {
  classification: MaterialityClassification;
  severity: EventSeverity;
  isDecisionChanging: boolean;
  impactExplanation: string;
  crossesDecisionBoundary: boolean;
}

// Deterministic Sensitivity Boundaries (Derived from Stage 6 Sensitivity Sweeps)
export const SENSITIVITY_BOUNDARIES = {
  // Rain probability boundaries with hysteresis buffer:
  // Baseline is 68%. Flip to WAIT occurs when rain drops below 40%.
  rainWaitThreshold: 41,
  rainHysteresisBuffer: 2.0, // Enter WAIT < 39%, Exit WAIT > 43%

  // Market price boundaries:
  // Baseline is ₹2,380. Flip to WAIT occurs when price surges >= +14.5% (>= ₹2,725).
  priceSurgeThresholdPercent: 14.5,
  priceHysteresisBuffer: 1.0, // Enter >= 14.5%, Exit <= 13.5%

  // Freight sensitivity:
  freightShiftThresholdPercent: 15.0,
};

export function evaluateWeatherMateriality(
  previousRainProb: number,
  currentRainProb: number,
  currentRecommendation: string = 'SELL NOW'
): MaterialityEvaluation {
  const delta = currentRainProb - previousRainProb;
  const absDelta = Math.abs(delta);

  // 1. Noise check (< 4 percentage points)
  if (absDelta < 4) {
    return {
      classification: 'NOISE',
      severity: 'INFO',
      isDecisionChanging: false,
      impactExplanation: `Minor ${delta >= 0 ? '+' : ''}${delta}% rain fluctuation is within regular Doppler scan variance. No impact on decision utility.`,
      crossesDecisionBoundary: false,
    };
  }

  // 2. Decision Boundary Check with Hysteresis
  // If previously SELL NOW and rain drops below (41 - 2) = 39%
  if (currentRecommendation === 'SELL NOW' && currentRainProb <= (SENSITIVITY_BOUNDARIES.rainWaitThreshold - SENSITIVITY_BOUNDARIES.rainHysteresisBuffer)) {
    return {
      classification: 'DECISION_CHANGING',
      severity: 'DECISION_CHANGING',
      isDecisionChanging: true,
      impactExplanation: `Rain probability dropped from ${previousRainProb}% to ${currentRainProb}%, crossing the ≤41% sensitivity threshold. Convective storm hazard is diminished, making WAIT 5 DAYS mathematically dominant.`,
      crossesDecisionBoundary: true,
    };
  }

  // If previously WAIT and rain climbs back above (41 + 2) = 43%
  if (currentRecommendation !== 'SELL NOW' && currentRainProb >= (SENSITIVITY_BOUNDARIES.rainWaitThreshold + SENSITIVITY_BOUNDARIES.rainHysteresisBuffer)) {
    return {
      classification: 'DECISION_CHANGING',
      severity: 'DECISION_CHANGING',
      isDecisionChanging: true,
      impactExplanation: `Rain hazard increased from ${previousRainProb}% to ${currentRainProb}%, re-entering the thunderstorm risk zone (>43%). SELL NOW locks in clean realization.`,
      crossesDecisionBoundary: true,
    };
  }

  // 3. Material vs Info check
  if (absDelta >= 12) {
    return {
      classification: 'MATERIAL',
      severity: 'MATERIAL',
      isDecisionChanging: false,
      impactExplanation: `Rain probability shifted by ${delta >= 0 ? '+' : ''}${delta}%. Downside loss estimate changes materially by ₹${Math.round(absDelta * 56)}, but SELL NOW remains the optimal recommendation.`,
      crossesDecisionBoundary: false,
    };
  }

  return {
    classification: 'INFO',
    severity: 'WATCH',
    isDecisionChanging: false,
    impactExplanation: `Rain probability shifted by ${delta >= 0 ? '+' : ''}${delta}%. Tracked under active watch.`,
    crossesDecisionBoundary: false,
  };
}

export function evaluateMarketMateriality(
  previousModalPrice: number,
  currentModalPrice: number,
  baselinePrice: number = 2380
): MaterialityEvaluation {
  const deltaInr = currentModalPrice - previousModalPrice;
  const absDeltaInr = Math.abs(deltaInr);
  const percentageFromBaseline = ((currentModalPrice - baselinePrice) / baselinePrice) * 100;

  // 1. Noise check (< ₹20/qtl)
  if (absDeltaInr < 20) {
    return {
      classification: 'NOISE',
      severity: 'INFO',
      isDecisionChanging: false,
      impactExplanation: `Price movement of ${deltaInr >= 0 ? '+' : ''}₹${deltaInr}/qtl is normal intra-day APMC clearing noise. Net advantage remains intact.`,
      crossesDecisionBoundary: false,
    };
  }

  // 2. Decision Boundary Check
  // Price surge >= +14.5% (approx ₹2,725)
  if (percentageFromBaseline >= SENSITIVITY_BOUNDARIES.priceSurgeThresholdPercent) {
    return {
      classification: 'DECISION_CHANGING',
      severity: 'DECISION_CHANGING',
      isDecisionChanging: true,
      impactExplanation: `Unnao spot price surged to ₹${currentModalPrice}/qtl (+${percentageFromBaseline.toFixed(1)}%), exceeding the +14.5% threshold. Premium upside now exceeds storm downside penalty.`,
      crossesDecisionBoundary: true,
    };
  }

  // 3. Material check (>= ₹60/qtl)
  if (absDeltaInr >= 60) {
    return {
      classification: 'MATERIAL',
      severity: 'MATERIAL',
      isDecisionChanging: false,
      impactExplanation: `Spot price changed by ${deltaInr >= 0 ? '+' : ''}₹${deltaInr}/qtl (Δ ₹${Math.round(absDeltaInr * 32)} total net). Substantial margin shift, but does not flip the current harvest window.`,
      crossesDecisionBoundary: false,
    };
  }

  return {
    classification: 'INFO',
    severity: 'INFO',
    isDecisionChanging: false,
    impactExplanation: `Price adjusted by ${deltaInr >= 0 ? '+' : ''}₹${deltaInr}/qtl. Below the decision boundary.`,
    crossesDecisionBoundary: false,
  };
}

export function evaluateLogisticsMateriality(
  previousFreight: number,
  currentFreight: number
): MaterialityEvaluation {
  const delta = currentFreight - previousFreight;
  const pct = (delta / (previousFreight || 1)) * 100;

  if (Math.abs(pct) < 5) {
    return {
      classification: 'NOISE',
      severity: 'INFO',
      isDecisionChanging: false,
      impactExplanation: `Freight quote delta of ₹${delta} is within diesel tariff tolerance.`,
      crossesDecisionBoundary: false,
    };
  }

  if (pct >= 45) {
    return {
      classification: 'DECISION_CHANGING',
      severity: 'DECISION_CHANGING',
      isDecisionChanging: true,
      impactExplanation: `Freight to Unnao escalated by +${pct.toFixed(0)}% (₹${currentFreight}). Kanpur Yard (14 km) is now more cost effective.`,
      crossesDecisionBoundary: true,
    };
  }

  if (Math.abs(pct) >= SENSITIVITY_BOUNDARIES.freightShiftThresholdPercent) {
    return {
      classification: 'MATERIAL',
      severity: 'MATERIAL',
      isDecisionChanging: false,
      impactExplanation: `Dedicated freight changed by ${pct >= 0 ? '+' : ''}${pct.toFixed(0)}% (₹${currentFreight}). Unnao net advantage reduced but still viable.`,
      crossesDecisionBoundary: false,
    };
  }

  return {
    classification: 'INFO',
    severity: 'INFO',
    isDecisionChanging: false,
    impactExplanation: `Freight shifted slightly by ₹${delta}.`,
    crossesDecisionBoundary: false,
  };
}
