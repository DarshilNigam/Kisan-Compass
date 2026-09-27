/**
 * KISAN COMPASS — STAGE 10: OUTCOME CALIBRATION & SELF-AUDITING INTELLIGENCE TYPES
 * 
 * Strict Statistical Honesty:
 * - Empirical Interval Coverage (vs theoretical 80% P10–P90 nominal interval).
 * - Zero black-box parameter retraining: all calibration suggestions are draft recommendations requiring farmer approval.
 * - Zero false causality: distinguish between observed price/freight error and established causation.
 */

export type IntervalCoverageClassification = 
  | 'WELL_CALIBRATED' 
  | 'TOO_NARROW' 
  | 'TOO_WIDE' 
  | 'INSUFFICIENT_DATA';

export interface ConfidenceAuditSummary {
  totalEvaluated: number;
  averageConfidence: number;
  overconfidenceCount: number;
  underconfidenceCount: number;
  wellCalibratedCount: number;
  brierScoreProxy: number;
  confidenceCalibrationRating: 'STRONG' | 'ACCEPTABLE' | 'POOR' | 'INSUFFICIENT_DATA';
  explanation: string;
}

export interface HorizonBucketPerformance {
  horizon: string;
  sampleSize: number;
  priceMAE: number;
  freightMAE: number;
  rainfallMAE: number;
  empiricalCoverage: number;
  calibrationState: IntervalCoverageClassification;
}

export interface AssumptionPerformanceItem {
  assumptionName: string;
  assumedValue: string;
  observedValue: string;
  status: 'VALIDATED' | 'VIOLATED' | 'WATCH';
  impactOnDecision: string;
}

export interface SignalAuditItem {
  signalName: string;
  source: string;
  availabilityRate: number;
  averageForecastError: number;
  impactOnFinalRealization: string;
}

export interface RetrospectiveDecisionAudit {
  decisionId: string;
  date: string;
  crop: string;
  plotId: string;
  recommendedAction: string;
  predictedNetRealization: number;
  predictedInterval: { p10: number; p50: number; p90: number };
  realizedNetRealization: number;
  wasInsidePredictedRange: boolean;
  wasActionExecuted: boolean;
  decisionConfidence: number;
  retrospectiveVerdict: string;
  forecastErrors: {
    mandiPrice: { signedError: number; percentageError: number };
    freightRate: { signedError: number; percentageError: number };
    weatherRainfall: { signedError: number; percentageError: number };
  };
  causalNote: string;
  keyTakeaway: string;
}

export interface LearningRecord {
  id: string;
  date: string;
  domain: string;
  observation: string;
  adjustmentNote: string;
}

export interface CalibrationSuggestion {
  id: string;
  title: string;
  targetParameter: string;
  currentValue: number;
  suggestedValue: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
  expectedImpact: string;
  status: 'PROPOSED' | 'APPLIED' | 'DISMISSED';
}

export interface RightAndWrongDecomposition {
  whatWeGotRight: Array<{ claim: string; evidence: string; impact: string }>;
  whatWeGotWrong: Array<{ claim: string; evidence: string; rootCause: string; remediation: string }>;
}

export interface OutcomeIntelligenceReport {
  empiricalIntervalCoverage: number;
  nominalCoverageTarget: number;
  totalVerifiedObservations: number;
  calibrationStatus: IntervalCoverageClassification;
  overallVerdict: string;
  meanAbsoluteError: number;
  rootMeanSquareError: number;
  meanSignedBias: number;
  confidenceAudit: ConfidenceAuditSummary;
  horizonBreakdown: HorizonBucketPerformance[];
  rightAndWrongDecomposition: RightAndWrongDecomposition;
  assumptionAudits: AssumptionPerformanceItem[];
  signalAudits: SignalAuditItem[];
  retrospectiveAudits: RetrospectiveDecisionAudit[];
  learningRecords: LearningRecord[];
  calibrationSuggestions: CalibrationSuggestion[];
  evaluatedAt: string;
}
