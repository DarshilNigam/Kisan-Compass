export type ForecastSource = 'LIVE_MODEL' | 'CACHED_FORECAST' | 'BASELINE';

export interface ForecastQuantile {
  horizonDays: number;
  date: string;
  p10Price: number;              // Downside 10th percentile (₹/qtl)
  p50Price: number;              // Median expected 50th percentile (₹/qtl)
  p90Price: number;              // Upside 90th percentile (₹/qtl)
  expectedGrossValue: number;    // Gross value for batch (₹)
  weatherDownsidePenalty: number;// Rain risk penalty (₹)
  spoilageExposurePenalty: number;// Storage degradation (₹)
  transportCost: number;         // Freight deduction (₹)
  p10NetRealization: number;     // Downside net realization (₹)
  p50NetRealization: number;     // Median expected net realization (₹)
  p90NetRealization: number;     // Upside net realization (₹)
  recommendedAction: 'SELL NOW' | 'HOLD (2-3 DAYS)' | 'HOLD (4-7 DAYS)' | 'IMMEDIATE HARVEST';
  decisionConfidence: number;    // 0.0 - 1.0
  dominantRisk: string;
}

export interface UncertaintyDecomposition {
  modelUncertainty: number;      // 0.0 - 1.0 (Variance spread across forecast horizon)
  dataUncertainty: number;       // 0.0 - 1.0 (Market volatility & observation density)
  freshnessUncertainty: number;  // 0.0 - 1.0 (Age decay penalty)
  totalUncertainty: number;      // 0.0 - 1.0 (Composite uncertainty score)
  confidenceRating: 'HIGH' | 'MODERATE' | 'LOW';
  explanation: string;
}

export interface StructuredDecisionExplanation {
  recommendation: 'SELL NOW' | 'WAIT 3 DAYS' | 'WAIT 5 DAYS' | 'HOLD' | 'SPLIT HARVEST';
  horizonDays: number;
  expectedNetRealization: number;
  range: {
    p10: number;
    p50: number;
    p90: number;
  };
  deltaVsTodayInr: number;
  downsideExposureChangePercent: number;
  drivers: {
    factor: 'MARKET_FORECAST' | 'WEATHER_RISK' | 'SPOILAGE_EXPOSURE' | 'TRANSPORT_FRICTION' | 'FARMER_PREFERENCE';
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    deltaInr: number;
    detail: string;
  }[];
  uncertainty: UncertaintyDecomposition;
}

export interface ProbabilisticForecast {
  forecastId: string;
  metric: 'MANDI_PRICE' | 'NET_REALIZATION';
  commodity: string;
  variety: string;
  market: string;
  generatedAt: string;
  horizonDays: number;
  quantiles: ForecastQuantile[];
  source: ForecastSource;
  modelName: string;
  modelVersion: string;
  trainingObservations: number;
  confidence: number;
  dataFreshnessMinutes: number;
  uncertainty: UncertaintyDecomposition;
  warnings: string[];
  provenance: {
    inputSource: string;
    generatedBy: string;
    generatedAt: string;
    note: string;
  };
}
