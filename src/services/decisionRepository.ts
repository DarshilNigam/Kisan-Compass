import { LongitudinalDecisionRecord } from '../types/memory';
import { ExtendedPreferenceProfile, initialExtendedPreferences } from './preferenceEngine';

const STORAGE_KEY_DECISIONS = 'kisan_compass_decision_ledger_v1';
const STORAGE_KEY_PREFS = 'kisan_compass_preferences_v1';

export const seedLongitudinalDecisions: LongitudinalDecisionRecord[] = [
  {
    id: 'DEC-2026-03-26-01',
    timestamp: '2026-03-26T14:15:00+05:30',
    fieldId: 'FIELD-07',
    fieldName: 'North Plot (Field 07)',
    crop: 'Wheat',
    cropVariety: 'HD-2967 High Yield',
    stage: 'Late maturity',
    recommendation: 'SELL NOW',
    recommendedHorizonDays: 0,
    title: 'Pre-Storm Harvest & Unnao Mandi Liquidation',
    primaryRecommendation: 'Initiate harvest within the next 36 hours. Route harvest to Unnao Mandi to lock in ₹74,820 before the 68% probability Western Disturbance thunderstorm on Saturday.',
    farmerAction: 'PENDING',
    forecast: {
      p10: 71200,
      p50: 74820,
      p90: 77400,
      horizonDays: 0,
      modelName: 'Parameterized Mandi Baseline & Weather Downside Quantile Estimator',
      source: 'CACHED_FORECAST',
      generatedAt: '14:15 IST',
    },
    expectedNetRealization: 74820,
    outcomeStatus: 'PENDING',
    weatherSnapshot: {
      condition: 'Sunny (Storm Approaching)',
      currentTemp: 31.4,
      rainfallProbability48h: 68,
      rainRiskLevel: 'HIGH',
      stormWindowDays: 2,
      source: 'Open-Meteo Ensemble',
    },
    marketSnapshot: {
      mandi: 'Unnao Mandi (APMC)',
      grossPricePerQuintal: 2380,
      netRealizationPerQuintal: 2338.12,
      distanceKm: 28.4,
      totalNetRealization: 74820,
      source: 'AGMARKNET Daily APMC Feed',
    },
    soilSnapshot: {
      moisturePercentage: 28,
      gddAccumulated: 1845,
      gddTarget: 1950,
      maturityPercentage: 94.6,
    },
    preferenceSnapshot: {
      riskAversion: 0.68,
      weatherSensitivity: 0.82,
      liquidityPreference: 0.55,
      priceUpsidePreference: 0.42,
    },
    confidence: 0.89,
    reasoningFactors: [
      { name: 'Severe Weather Inversion Risk', weight: 0.40, impact: 'RISK', valueText: '68% rain risk / 14.5mm thunder precipitation expected Mar 28-29 on standing mature crop', confidence: 0.91, sourceTelemetry: 'LIVE' },
      { name: 'Net Mandi Realization', weight: 0.35, impact: 'POSITIVE', valueText: 'Unnao Mandi yields ₹2,338/qtl net (+₹920 over closer Chakeri yard after transport deduction)', confidence: 0.94, sourceTelemetry: 'LIVE' },
      { name: 'Crop GDD Maturity', weight: 0.25, impact: 'POSITIVE', valueText: 'GDD 1845/1950 (94.6% maturity). Grain moisture 13.8% ready for combine threshing', confidence: 0.96, sourceTelemetry: 'LIVE' },
    ],
    isDemo: false,
  },
  {
    id: 'DEC-2026-03-12',
    timestamp: '2026-03-12T09:30:00+05:30',
    fieldId: 'FIELD-07',
    fieldName: 'North Plot (Field 07)',
    crop: 'Wheat',
    cropVariety: 'HD-2967 High Yield',
    stage: 'Grain Fill',
    recommendation: 'WAIT 5 DAYS',
    recommendedHorizonDays: 5,
    title: 'Late Grain Fill Maturation & Price Arbitrage Hold',
    primaryRecommendation: 'Hold field for 5 days to allow grain weight accumulation. Model projects regional wholesale prices to rise +₹40/qtl as early distress arrivals clear.',
    farmerAction: 'ACCEPTED',
    forecast: {
      p10: 69500,
      p50: 76240,
      p90: 84700,
      horizonDays: 5,
      modelName: 'Parameterized Mandi Baseline & Weather Downside Quantile Estimator',
      source: 'CACHED_FORECAST',
      generatedAt: '09:30 IST',
    },
    expectedNetRealization: 76240,
    actualOutcome: {
      salePricePerQuintal: 2420,
      quantityQuintals: 32,
      mandi: 'Unnao Mandi',
      saleDate: '2026-03-17',
      transportCost: 1340,
      otherDeductions: 0,
      actualGrossInr: 77440,
      actualNetInr: 76100,
      deltaVsExpectedNetInr: -140,
      classification: 'NEAR_P50',
      reportedAt: '2026-03-18T10:00:00+05:30',
      farmerNotes: 'Sold 32 quintals at Unnao yard after 5 days. Grain weight was optimal and realized ₹2,420/qtl gross.',
    },
    outcomeStatus: 'CONFIRMED',
    weatherSnapshot: {
      condition: 'Partly Cloudy',
      currentTemp: 27.8,
      rainfallProbability48h: 12,
      rainRiskLevel: 'LOW',
      stormWindowDays: 6,
      source: 'Open-Meteo Ensemble',
    },
    marketSnapshot: {
      mandi: 'Unnao Mandi',
      grossPricePerQuintal: 2360,
      netRealizationPerQuintal: 2318.12,
      distanceKm: 28.4,
      totalNetRealization: 74180,
      source: 'AGMARKNET Daily APMC Feed',
    },
    soilSnapshot: {
      moisturePercentage: 32,
      gddAccumulated: 1610,
      gddTarget: 1950,
      maturityPercentage: 82.5,
    },
    preferenceSnapshot: {
      riskAversion: 0.60,
      weatherSensitivity: 0.74,
      liquidityPreference: 0.50,
      priceUpsidePreference: 0.48,
    },
    confidence: 0.88,
    reasoningFactors: [
      { name: 'Grain Weight Gain', weight: 0.55, impact: 'POSITIVE', valueText: '+4.2% test weight gain projected over 5 additional field days', confidence: 0.90, sourceTelemetry: 'LIVE' },
      { name: 'Stable Weather Window', weight: 0.45, impact: 'POSITIVE', valueText: 'Clear skies forecast for next 6 days with no rain hazard', confidence: 0.88, sourceTelemetry: 'LIVE' },
    ],
    preferenceDeltaApplied: 'Farmer accepted hold recommendation. Upside tolerance confirmed.',
    isDemo: true,
  },
  {
    id: 'DEC-2026-03-01',
    timestamp: '2026-03-01T11:00:00+05:30',
    fieldId: 'FIELD-07',
    fieldName: 'North Plot (Field 07)',
    crop: 'Wheat',
    cropVariety: 'HD-2967 High Yield',
    stage: 'Grain Fill',
    recommendation: 'WAIT 3 DAYS',
    recommendedHorizonDays: 3,
    title: 'Mid-Season Canopy Protection & Hold Strategy',
    primaryRecommendation: 'Delay foliar application and harvest timing by 3 days following mild temperature dip.',
    farmerAction: 'REJECTED',
    rejectionReason: 'NEED_IMMEDIATE_CASH',
    rejectionNotes: 'Needed cash for tractor diesel & scheduled tubewell pump maintenance.',
    forecast: {
      p10: 67000,
      p50: 73500,
      p90: 79000,
      horizonDays: 3,
      modelName: 'Parameterized Mandi Baseline & Weather Downside Quantile Estimator',
      source: 'BASELINE',
      generatedAt: '11:00 IST',
    },
    expectedNetRealization: 73500,
    actualOutcome: {
      salePricePerQuintal: 2310,
      quantityQuintals: 30,
      mandi: 'Chakeri Mandi (Local Yard)',
      saleDate: '2026-03-02',
      transportCost: 450,
      otherDeductions: 150,
      actualGrossInr: 69300,
      actualNetInr: 68700,
      deltaVsExpectedNetInr: -4800,
      classification: 'WITHIN_RANGE',
      reportedAt: '2026-03-03T16:00:00+05:30',
      farmerNotes: 'Sold small partial lot early at closer Chakeri yard to meet urgent pump maintenance bill.',
    },
    outcomeStatus: 'CONFIRMED',
    weatherSnapshot: {
      condition: 'Sunny',
      currentTemp: 26.2,
      rainfallProbability48h: 5,
      rainRiskLevel: 'LOW',
      stormWindowDays: 7,
      source: 'Open-Meteo Ensemble',
    },
    marketSnapshot: {
      mandi: 'Chakeri Mandi',
      grossPricePerQuintal: 2310,
      netRealizationPerQuintal: 2295.0,
      distanceKm: 8.2,
      totalNetRealization: 68700,
      source: 'AGMARKNET Daily APMC Feed',
    },
    soilSnapshot: {
      moisturePercentage: 35,
      gddAccumulated: 1380,
      gddTarget: 1950,
      maturityPercentage: 70.7,
    },
    preferenceSnapshot: {
      riskAversion: 0.58,
      weatherSensitivity: 0.70,
      liquidityPreference: 0.44,
      priceUpsidePreference: 0.52,
    },
    confidence: 0.82,
    reasoningFactors: [
      { name: 'Weather Stability', weight: 0.60, impact: 'POSITIVE', valueText: 'Low moisture stress', confidence: 0.85, sourceTelemetry: 'LIVE' },
    ],
    preferenceDeltaApplied: 'Farmer prioritized immediate cash liquidity over delayed upside. Liquidity preference raised +0.06.',
    isDemo: true,
  },
  {
    id: 'DEC-2026-02-20',
    timestamp: '2026-02-20T10:30:00+05:30',
    fieldId: 'FIELD-07',
    fieldName: 'North Plot (Field 07)',
    crop: 'Wheat',
    cropVariety: 'HD-2967 High Yield',
    stage: 'Flowering',
    recommendation: 'IRRIGATE',
    recommendedHorizonDays: 2,
    title: 'Crown Root Irrigation & Rainfall Coordination',
    primaryRecommendation: 'Hold tubewell irrigation for 48 hours to leverage predicted 7mm light shower.',
    farmerAction: 'REJECTED',
    rejectionReason: 'TOO_RISKY',
    rejectionNotes: 'Did not want to gamble on uncertain light shower during critical flowering stage.',
    forecast: {
      p10: 66000,
      p50: 68500,
      p90: 70000,
      horizonDays: 2,
      modelName: 'Historical Baseline Utility Engine',
      source: 'BASELINE',
      generatedAt: '10:30 IST',
    },
    expectedNetRealization: 68500,
    actualOutcome: {
      salePricePerQuintal: 2280,
      quantityQuintals: 30,
      mandi: 'Pukhrayan APMC',
      saleDate: '2026-02-22',
      transportCost: 2800,
      otherDeductions: 0,
      actualGrossInr: 68400,
      actualNetInr: 65600,
      deltaVsExpectedNetInr: -2900,
      classification: 'BELOW_P10',
      reportedAt: '2026-02-23T12:00:00+05:30',
      farmerNotes: 'Shower failed to materialize. Ran diesel tubewell to ensure full root zone saturation.',
    },
    outcomeStatus: 'CONFIRMED',
    weatherSnapshot: {
      condition: 'Overcast (Low Confidence Rain)',
      currentTemp: 24.1,
      rainfallProbability48h: 45,
      rainRiskLevel: 'MODERATE',
      stormWindowDays: 2,
      source: 'Open-Meteo Ensemble',
    },
    marketSnapshot: {
      mandi: 'Pukhrayan APMC',
      grossPricePerQuintal: 2280,
      netRealizationPerQuintal: 2186.6,
      distanceKm: 54.0,
      totalNetRealization: 65600,
      source: 'AGMARKNET Daily APMC Feed',
    },
    soilSnapshot: {
      moisturePercentage: 22,
      gddAccumulated: 1040,
      gddTarget: 1950,
      maturityPercentage: 53.3,
    },
    preferenceSnapshot: {
      riskAversion: 0.50,
      weatherSensitivity: 0.65,
      liquidityPreference: 0.40,
      priceUpsidePreference: 0.55,
    },
    confidence: 0.74,
    reasoningFactors: [
      { name: 'Rain Forecast', weight: 0.60, impact: 'POSITIVE', valueText: '7mm predicted shower', confidence: 0.72, sourceTelemetry: 'DEGRADED' },
    ],
    preferenceDeltaApplied: 'Farmer prioritized guaranteed tubewell irrigation over low-confidence rain forecast. Risk aversion raised +0.08.',
    isDemo: true,
  },
  {
    id: 'DEC-2026-02-05',
    timestamp: '2026-02-05T08:45:00+05:30',
    fieldId: 'FIELD-07',
    fieldName: 'North Plot (Field 07)',
    crop: 'Wheat',
    cropVariety: 'HD-2967 High Yield',
    stage: 'Tillering',
    recommendation: 'TREAT FIELD',
    recommendedHorizonDays: 1,
    title: 'Tillering Stage Micronutrient & Zinc Foliar Spray',
    primaryRecommendation: 'Apply 0.5% Zinc Sulphate + Urea foliar spray under calm morning wind conditions (<8 km/h).',
    farmerAction: 'ACCEPTED',
    forecast: {
      p10: 64000,
      p50: 66200,
      p90: 68000,
      horizonDays: 1,
      modelName: 'Historical Baseline Utility Engine',
      source: 'BASELINE',
      generatedAt: '08:45 IST',
    },
    expectedNetRealization: 66200,
    actualOutcome: {
      salePricePerQuintal: 2250,
      quantityQuintals: 30,
      mandi: 'Unnao Mandi',
      saleDate: '2026-02-06',
      transportCost: 1300,
      otherDeductions: 0,
      actualGrossInr: 67500,
      actualNetInr: 66200,
      deltaVsExpectedNetInr: 0,
      classification: 'NEAR_P50',
      reportedAt: '2026-02-07T09:00:00+05:30',
      farmerNotes: 'Completed spray successfully. Field vigor improved noticeably over next 10 days.',
    },
    outcomeStatus: 'CONFIRMED',
    weatherSnapshot: {
      condition: 'Sunny (Calm)',
      currentTemp: 21.0,
      rainfallProbability48h: 0,
      rainRiskLevel: 'LOW',
      stormWindowDays: 10,
      source: 'Open-Meteo Ensemble',
    },
    marketSnapshot: {
      mandi: 'Unnao Mandi',
      grossPricePerQuintal: 2250,
      netRealizationPerQuintal: 2206.6,
      distanceKm: 28.4,
      totalNetRealization: 66200,
      source: 'AGMARKNET Daily APMC Feed',
    },
    soilSnapshot: {
      moisturePercentage: 34,
      gddAccumulated: 720,
      gddTarget: 1950,
      maturityPercentage: 36.9,
    },
    preferenceSnapshot: {
      riskAversion: 0.46,
      weatherSensitivity: 0.60,
      liquidityPreference: 0.40,
      priceUpsidePreference: 0.55,
    },
    confidence: 0.92,
    reasoningFactors: [
      { name: 'Optimal Wind Window', weight: 0.70, impact: 'POSITIVE', valueText: 'Calm morning winds (<8 km/h) prevents drift loss', confidence: 0.94, sourceTelemetry: 'LIVE' },
    ],
    preferenceDeltaApplied: 'Applied agronomic recommendation cleanly.',
    isDemo: true,
  },
  {
    id: 'DEC-2026-01-15',
    timestamp: '2026-01-15T14:00:00+05:30',
    fieldId: 'FIELD-07',
    fieldName: 'North Plot (Field 07)',
    crop: 'Wheat',
    cropVariety: 'HD-2967 High Yield',
    stage: 'Vegetative',
    recommendation: 'SPLIT HARVEST',
    recommendedHorizonDays: 0,
    title: 'First Top-Dressing Nitrogen Schedule',
    primaryRecommendation: 'Split nitrogen application into two doses before second irrigation cycle.',
    farmerAction: 'ACCEPTED',
    forecast: {
      p10: 62000,
      p50: 64500,
      p90: 66800,
      horizonDays: 0,
      modelName: 'Historical Baseline Utility Engine',
      source: 'BASELINE',
      generatedAt: '14:00 IST',
    },
    expectedNetRealization: 64500,
    actualOutcome: {
      salePricePerQuintal: 2200,
      quantityQuintals: 30,
      mandi: 'Unnao Mandi',
      saleDate: '2026-01-16',
      transportCost: 1250,
      otherDeductions: 0,
      actualGrossInr: 66000,
      actualNetInr: 64750,
      deltaVsExpectedNetInr: 250,
      classification: 'WITHIN_RANGE',
      reportedAt: '2026-01-17T11:00:00+05:30',
      farmerNotes: 'Split dose applied before second irrigation.',
    },
    outcomeStatus: 'CONFIRMED',
    weatherSnapshot: {
      condition: 'Sunny',
      currentTemp: 19.5,
      rainfallProbability48h: 0,
      rainRiskLevel: 'LOW',
      stormWindowDays: 14,
      source: 'Open-Meteo Ensemble',
    },
    marketSnapshot: {
      mandi: 'Unnao Mandi',
      grossPricePerQuintal: 2200,
      netRealizationPerQuintal: 2158.3,
      distanceKm: 28.4,
      totalNetRealization: 64750,
      source: 'AGMARKNET Daily APMC Feed',
    },
    soilSnapshot: {
      moisturePercentage: 38,
      gddAccumulated: 380,
      gddTarget: 1950,
      maturityPercentage: 19.5,
    },
    preferenceSnapshot: {
      riskAversion: 0.44,
      weatherSensitivity: 0.58,
      liquidityPreference: 0.40,
      priceUpsidePreference: 0.55,
    },
    confidence: 0.95,
    reasoningFactors: [
      { name: 'Vegetative Vigor', weight: 0.80, impact: 'POSITIVE', valueText: 'High root absorption efficiency', confidence: 0.95, sourceTelemetry: 'LIVE' },
    ],
    isDemo: true,
  },
];

export function loadDecisionLedger(tenantKey?: string): LongitudinalDecisionRecord[] {
  const key = tenantKey ? `${STORAGE_KEY_DECISIONS}_${tenantKey}` : STORAGE_KEY_DECISIONS;
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[DecisionRepository] Failed to read from localStorage:', err);
    }
  }
  // For a specific authenticated tenant/field, new entities must have a fresh state
  // and must NEVER inherit seed decisions from Rameshwar Singh / Field 07
  if (tenantKey) {
    return [];
  }
  return seedLongitudinalDecisions;
}

export function saveDecisionLedger(decisions: LongitudinalDecisionRecord[], tenantKey?: string): void {
  const key = tenantKey ? `${STORAGE_KEY_DECISIONS}_${tenantKey}` : STORAGE_KEY_DECISIONS;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(decisions));
    } catch (err) {
      console.warn('[DecisionRepository] Failed to save to localStorage:', err);
    }
  }
}

export function loadStoredPreferences(): ExtendedPreferenceProfile {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.riskAversion === 'number') {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[DecisionRepository] Failed to read preferences:', err);
    }
  }
  return initialExtendedPreferences;
}

export function saveStoredPreferences(prefs: ExtendedPreferenceProfile): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
    } catch (err) {
      console.warn('[DecisionRepository] Failed to save preferences:', err);
    }
  }
}
