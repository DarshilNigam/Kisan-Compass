import { CropStage, DecisionFactor } from './farm';

export type FarmerActionType = 'ACCEPTED' | 'REJECTED' | 'MODIFIED' | 'PENDING';

export type RejectionReasonType = 
  | 'TOO_RISKY' 
  | 'NEED_IMMEDIATE_CASH' 
  | 'DISAGREE_WEATHER' 
  | 'BETTER_LOCAL_PRICE' 
  | 'STORAGE_UNAVAILABLE'
  | 'OTHER'
  | 'SKIP';

export type OutcomeStatus = 'PENDING' | 'CONFIRMED' | 'MISSED' | 'PARTIAL';

export type OutcomeClassification = 'ABOVE_P90' | 'WITHIN_RANGE' | 'NEAR_P50' | 'BELOW_P10';

export interface DecisionWeatherSnapshot {
  condition: string;
  currentTemp: number;
  rainfallProbability48h: number;
  rainRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  stormWindowDays: number;
  source: string;
}

export interface DecisionMarketSnapshot {
  mandi: string;
  grossPricePerQuintal: number;
  netRealizationPerQuintal: number;
  distanceKm: number;
  totalNetRealization: number;
  source: string;
}

export interface DecisionSoilSnapshot {
  moisturePercentage: number;
  gddAccumulated: number;
  gddTarget: number;
  maturityPercentage: number;
}

export interface DecisionPreferenceSnapshot {
  riskAversion: number;
  weatherSensitivity: number;
  liquidityPreference: number;
  priceUpsidePreference: number;
}

export interface ActualOutcomeReport {
  salePricePerQuintal: number;
  quantityQuintals: number;
  mandi: string;
  saleDate: string;
  transportCost: number;
  otherDeductions: number;
  actualGrossInr: number;
  actualNetInr: number;
  deltaVsExpectedNetInr: number;
  classification: OutcomeClassification;
  reportedAt: string;
  farmerNotes?: string;
}

export interface LongitudinalDecisionRecord {
  id: string;
  timestamp: string;
  fieldId: string;
  fieldName: string;
  crop: string;
  cropVariety: string;
  stage: CropStage;
  recommendation: 'SELL NOW' | 'WAIT 3 DAYS' | 'WAIT 5 DAYS' | 'HOLD' | 'SPLIT HARVEST' | 'IRRIGATE' | 'TREAT FIELD';
  recommendedHorizonDays: number;
  title: string;
  primaryRecommendation: string;
  farmerAction: FarmerActionType;
  rejectionReason?: RejectionReasonType;
  rejectionNotes?: string;
  
  forecast: {
    p10: number;
    p50: number;
    p90: number;
    horizonDays: number;
    modelName: string;
    source: 'LIVE_MODEL' | 'CACHED_FORECAST' | 'BASELINE';
    generatedAt: string;
  };

  expectedNetRealization: number;
  actualOutcome?: ActualOutcomeReport;
  outcomeStatus: OutcomeStatus;

  weatherSnapshot: DecisionWeatherSnapshot;
  marketSnapshot: DecisionMarketSnapshot;
  soilSnapshot?: DecisionSoilSnapshot;
  preferenceSnapshot: DecisionPreferenceSnapshot;

  confidence: number;
  reasoningFactors: DecisionFactor[];
  preferenceDeltaApplied?: string;
  isDemo?: boolean;
}

export interface PreferenceDimensionRecord {
  dimension: 'riskAversion' | 'weatherSensitivity' | 'liquidityPreference' | 'priceUpsidePreference';
  name: string;
  currentScore: number;
  previousScore: number;
  evidenceCount: number;
  signalStrength: 'WEAK SIGNAL' | 'MODERATE SIGNAL' | 'STRONG SIGNAL';
  description: string;
  observedPattern: string;
  lastUpdated: string;
}

export interface ForecastCalibrationStats {
  totalOutcomes: number;
  withinRangeCount: number;
  nearP50Count: number;
  belowP10Count: number;
  aboveP90Count: number;
  withinRangePercentage: number;
  summaryFactualStatement: string;
}
