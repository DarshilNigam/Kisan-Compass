/**
 * KISAN COMPASS — STAGE 11: EVIDENCE-GROUNDED EVALUATION LAB & REPRODUCIBILITY TYPES
 * 
 * Strict Evaluation Integrity:
 * - No metric without lineage: METRIC -> DATASET -> OBSERVATIONS -> CALCULATION -> RESULT.
 * - Explicit distinction between REAL_VERIFIED, SEEDED_DEMO, SIMULATED, and SYNTHETIC.
 * - Temporal integrity & anti-future-leakage guarantees.
 * - Deterministic, immutable evaluation snapshots with version manifests.
 */

export type OriginType = 'REAL_VERIFIED' | 'SEEDED_DEMO' | 'SIMULATED' | 'SYNTHETIC';

export type DatasetFilterMode = 'REAL_ONLY' | 'INCLUDE_DEMO' | 'SIMULATION_ONLY';

export type ObservationExclusionRule = 
  | 'OUTCOME_NOT_VERIFIED'
  | 'SIMULATED_EXCLUDED'
  | 'DEMO_ONLY_EXCLUDED'
  | 'MISSING_FORECAST_QUANTILES'
  | 'TEMPORAL_ORDER_VIOLATED'
  | 'INCOMPLETE_FINANCIALS';

export interface ObservationExclusion {
  observationId: string;
  decisionId: string;
  rule: ObservationExclusionRule;
  reason: string;
  timestamp: string;
  recordOrigin: OriginType;
}

export interface EvaluationObservation {
  observationId: string;
  decisionId: string;
  crop: string;
  plotId: string;
  forecastTime: string;
  decisionTime: string;
  executionTime: string;
  outcomeTime: string;
  horizonDays: number;
  horizonBucket: '0-1d' | '2-4d' | '5-7d' | '8-14d';
  forecastP10: number;
  forecastP50: number;
  forecastP90: number;
  forecastModel: string;
  forecastOrigin: 'LIVE_MODEL' | 'CACHED_FORECAST' | 'BASELINE';
  statedConfidence: number;
  realizedPricePerQuintal: number;
  realizedGrossInr: number;
  realizedFreightInr: number;
  realizedNetInr: number;
  signedError: number; // RealizedNet - P50
  absoluteError: number; // |RealizedNet - P50|
  percentageError: number;
  isInsideInterval: boolean;
  intervalPosition: 'INSIDE' | 'BELOW_P10' | 'ABOVE_P90';
  origin: OriginType;
  mandi: string;
  provenanceChain: {
    forecastSource: string;
    marketSource: string;
    weatherSource: string;
    settlementReceipt: string;
  };
}

export interface CalculationTraceStep {
  stepNumber: number;
  label: string;
  formula: string;
  substitution: string;
  result: string;
  componentValues?: Array<{ id: string; label: string; value: number }>;
}

export interface MetricProvenance {
  metricId: string;
  metricKey: string;
  metricName: string;
  value: number;
  formattedValue: string;
  unit: string;
  formula: string;
  datasetId: string;
  datasetVersion: string;
  observationIds: string[];
  sampleSize: number;
  minimumSampleSize: number;
  isSampleSufficient: boolean;
  status: 'SUPPORTED' | 'INSUFFICIENT_DATA' | 'EXCLUDED';
  origin: OriginType;
  generatedAt: string;
  calculationTrace: CalculationTraceStep[];
  limitations: string[];
  interpretation: string;
  whyThisNumberExists: string;
}

export interface EvaluationDataset {
  datasetId: string;
  datasetVersion: string;
  createdAt: string;
  filterMode: DatasetFilterMode;
  totalRecordsScanned: number;
  eligibleObservations: EvaluationObservation[];
  exclusions: ObservationExclusion[];
  includedCount: number;
  excludedCount: number;
  samplePeriod: { start: string; end: string };
  supportedCrops: string[];
  supportedLocations: string[];
}

export interface TemporalIntegrityViolation {
  decisionId: string;
  check: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING';
}

export interface TemporalIntegrityReport {
  status: 'VALID' | 'WARNING' | 'LEAKAGE_DETECTED';
  checksPassedCount: number;
  violationsCount: number;
  violations: TemporalIntegrityViolation[];
  leakageGuardActive: boolean;
}

export interface EvaluationManifest {
  runId: string;
  datasetVersion: string;
  forecastEngineVersion: string;
  decisionEngineVersion: string;
  calibrationEngineVersion: string;
  evaluationEngineVersion: string;
  generatedAt: string;
  origin: OriginType;
  observationCount: number;
  exclusionCount: number;
  reproducibilityHash: string;
}

export interface HorizonEvaluationSummary {
  horizonBucket: '0-1d' | '2-4d' | '5-7d' | '8-14d';
  label: string;
  sampleSize: number;
  mae: MetricProvenance;
  coverage: MetricProvenance;
  status: 'WELL_CALIBRATED' | 'TOO_NARROW' | 'INSUFFICIENT_DATA';
}

export interface EvaluationRun {
  runId: string;
  versionNumber: number;
  createdAt: string;
  dataset: EvaluationDataset;
  manifest: EvaluationManifest;
  temporalIntegrity: TemporalIntegrityReport;
  metrics: {
    p50Mae: MetricProvenance;
    rmse: MetricProvenance;
    meanSignedBias: MetricProvenance;
    intervalCoverage: MetricProvenance;
    confidenceAlignment: MetricProvenance;
  };
  horizonBreakdown: HorizonEvaluationSummary[];
  summaryStatement: string;
}
