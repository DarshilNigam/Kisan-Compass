/**
 * KISAN COMPASS — Metric Registry (Stage 11)
 * 
 * Central registry of all formal evaluation metrics, formulas, sample size requirements, and interpretations.
 * Prevents ad-hoc or ungrounded performance claims.
 */

import { OriginType } from '../types/evaluation';

export interface RegisteredMetricDefinition {
  id: string;
  key: string;
  name: string;
  shortName: string;
  unit: string;
  formula: string;
  minimumSampleSize: number;
  governanceThresholdNote: string;
  allowedOrigins: OriginType[];
  interpretation: string;
  limitations: string[];
  scientificReference: string;
}

export const METRIC_REGISTRY: Record<string, RegisteredMetricDefinition> = {
  FORECAST_P50_MAE: {
    id: 'METRIC-MAE-01',
    key: 'FORECAST_P50_MAE',
    name: 'Mean Absolute Error (P50 Net Realization)',
    shortName: 'P50 MAE',
    unit: '₹/qtl',
    formula: 'MAE = (1 / N) * Σ |RealizedNet - PredictedP50|',
    minimumSampleSize: 3,
    governanceThresholdNote: 'Requires N ≥ 3 verified harvest realizations to compute meaningful point error.',
    allowedOrigins: ['REAL_VERIFIED', 'SEEDED_DEMO', 'SIMULATED'],
    interpretation: 'Measures average magnitude of forecast deviation from actual net financial realization without penalizing direction.',
    limitations: [
      'Does not capture asymmetric downside risks (e.g. rain spoilage vs price upside).',
      'Assumes linear loss function across all quantity tranches.',
      'Small regional sample size (< 20 observations) in current pilot.'
    ],
    scientificReference: 'Hyndman, R. J., & Koehler, A. B. (2006). Another look at measures of forecast accuracy. International Journal of Forecasting.'
  },

  FORECAST_RMSE: {
    id: 'METRIC-RMSE-01',
    key: 'FORECAST_RMSE',
    name: 'Root Mean Squared Error (Net Realization)',
    shortName: 'RMSE',
    unit: '₹/qtl',
    formula: 'RMSE = sqrt((1 / N) * Σ (RealizedNet - PredictedP50)^2)',
    minimumSampleSize: 3,
    governanceThresholdNote: 'Requires N ≥ 3 verified realizations; quadratic penalty for large error outliers.',
    allowedOrigins: ['REAL_VERIFIED', 'SEEDED_DEMO', 'SIMULATED'],
    interpretation: 'Measures dispersion of realization errors with greater weight given to large prediction shocks.',
    limitations: [
      'Sensitive to isolated single-day APMC arrival spikes or unexpected diesel fuel surges.'
    ],
    scientificReference: 'Willmott, C. J., & Matsuura, K. (2005). Advantages of the mean absolute error (MAE) over the root mean squared error (RMSE) in assessing average model performance.'
  },

  FORECAST_SIGNED_BIAS: {
    id: 'METRIC-BIAS-01',
    key: 'FORECAST_SIGNED_BIAS',
    name: 'Mean Signed Model Bias',
    shortName: 'Signed Bias',
    unit: '₹/qtl',
    formula: 'Bias = (1 / N) * Σ (RealizedNet - PredictedP50)',
    minimumSampleSize: 3,
    governanceThresholdNote: 'Requires N ≥ 3 verified realizations to detect systemic over- or under-estimation.',
    allowedOrigins: ['REAL_VERIFIED', 'SEEDED_DEMO', 'SIMULATED'],
    interpretation: 'Positive value indicates actual realization exceeded forecast (conservative estimate); negative value indicates systematic overestimation.',
    limitations: [
      'Can cancel out large positive and negative errors, masking underlying variance.'
    ],
    scientificReference: 'Silver, N. (2012). The Signal and the Noise: Why So Many Predictions Fail—but Some Don\'t.'
  },

  INTERVAL_COVERAGE: {
    id: 'METRIC-COV-01',
    key: 'INTERVAL_COVERAGE',
    name: 'Empirical Interval Coverage Rate',
    shortName: 'Interval Coverage',
    unit: '%',
    formula: 'Coverage = (Count(P10 ≤ RealizedNet ≤ P90) / N) * 100',
    minimumSampleSize: 5,
    governanceThresholdNote: 'Governance threshold: N ≥ 5 required to evaluate nominal 80% P10–P90 coverage reliably.',
    allowedOrigins: ['REAL_VERIFIED', 'SEEDED_DEMO', 'SIMULATED'],
    interpretation: 'Tests whether the 80% theoretical confidence interval contains approximately 80% of real-world outcomes.',
    limitations: [
      'Requires substantial sample size (N ≥ 20) for statistical significance; N=5-15 serves as governance monitoring.',
      'Binary scoring does not quantify how far outside the boundary an extreme outlier landed.'
    ],
    scientificReference: 'Gneiting, T., & Raftery, A. E. (2007). Strictly proper scoring rules, prediction, and estimation. Journal of the American Statistical Association.'
  },

  CONFIDENCE_OUTCOME_ALIGNMENT: {
    id: 'METRIC-CONF-ALIGN-01',
    key: 'CONFIDENCE_OUTCOME_ALIGNMENT',
    name: 'Confidence-Outcome Alignment Index',
    shortName: 'Confidence Alignment',
    unit: 'Score (0–100)',
    formula: 'Alignment = 100 * (1 - (1 / N) * Σ (StatedConfidenceFraction - OutcomeAccuracyBinary)^2)',
    minimumSampleSize: 3,
    governanceThresholdNote: 'Evaluates ex-ante decision confidence versus subsequent realization accuracy.',
    allowedOrigins: ['REAL_VERIFIED', 'SEEDED_DEMO', 'SIMULATED'],
    interpretation: 'Replaces improper Brier claims for continuous distributions. Measures whether high confidence (>80%) correlated with accurate realized net outcomes within 15% tolerance.',
    limitations: [
      'Uses binary outcome classification proxy (±15% of prediction) rather than native categorical events.',
      'Small sample size restricts generalizability to other crop commodities.'
    ],
    scientificReference: 'Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review. (Adapted for deterministic decision confidence governance).'
  }
};

export function getRegisteredMetric(metricKey: string): RegisteredMetricDefinition | undefined {
  return METRIC_REGISTRY[metricKey];
}
