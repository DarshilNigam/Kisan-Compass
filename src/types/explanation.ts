import { SignalConflict } from './intelligence';
import { ForecastSource } from './forecast';

export type ExplanationLanguage = 'en' | 'hi';

export interface DecisionExplanationContext {
  decision: {
    recommendation: 'SELL NOW' | 'WAIT 3 DAYS' | 'WAIT 5 DAYS' | 'HOLD' | 'SPLIT HARVEST';
    horizonDays: number;
    expectedNetRealization: number;
    currentNetRealization: number;
    deltaVsTodayInr: number;
    range: {
      p10: number;
      p50: number;
      p90: number;
    };
  };
  forecast: {
    source: ForecastSource;
    modelName: string;
    horizonDays: number;
    p10Price: number;
    p50Price: number;
    p90Price: number;
    generatedAt: string;
    isFailed: boolean;
  };
  weather: {
    condition: string;
    currentTemp: number;
    precipitationProbability48h: number;
    rainRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    stormWindowDays: number;
    status: string;
    source: string;
  };
  market: {
    selectedMandi: string;
    grossPricePerQuintal: number;
    netRealizationPerQuintal: number;
    totalNetRealization: number;
    estimatedTransportCost: number;
    spoilageRiskPercent: number;
    status: string;
    source: string;
  };
  crop: {
    crop: string;
    variety: string;
    areaAcres: number;
    quantityQuintals: number;
    gddAccumulated: number;
    gddTarget: number;
    maturityPercent: number;
    harvestStage: string;
  };
  farmer: {
    riskAversion: number;
    riskCategory: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    weatherSensitivity: number;
    summaryNote: string;
  };
  uncertainty: {
    rating: 'HIGH' | 'MODERATE' | 'LOW';
    modelUncertaintyPercent: number;
    dataUncertaintyPercent: number;
    freshnessUncertaintyPercent: number;
    explanation: string;
  };
  provenance: {
    weatherProvider: string;
    marketProvider: string;
    forecastProvider: string;
    soilProvider: string;
  };
  conflicts: SignalConflict[];
}

export interface GroundedExplanation {
  headline: string;
  summary: string;
  whyDrivers: {
    factor: string;
    direction: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    amountInr?: number;
    explanation: string;
  }[];
  uncertaintyStatement: string;
  sourceProvenanceDisclosure: string;
  importantCaveat?: string;
  language: ExplanationLanguage;
  generatedAt: string;
  isDeterministicFallback: boolean;
  validatedGrounding: boolean;
}

export type GroundedQuestionType = 
  | 'WHY_DECISION' 
  | 'WHAT_IS_RISK' 
  | 'WHAT_IF_7D' 
  | 'WHY_UNNAO_MANDI' 
  | 'HOW_CERTAIN_WEATHER' 
  | 'FORECAST_SOURCE_STATUS'
  | 'WHAT_CHANGED'
  | 'WHY_RECOMMENDATION_CHANGED'
  | 'MY_DECISION_PATTERN'
  | 'FORECAST_TRACK_RECORD'
  | 'RECENT_OUTCOMES'
  | 'WHY_CANNOT_BE_MORE_CERTAIN';

export interface GroundedAnswer {
  question: string;
  questionType: GroundedQuestionType;
  answerHeadline: string;
  answerBody: string;
  supportingDataPoints: string[];
  groundedSources: string[];
  language: ExplanationLanguage;
}

export interface GroundingValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedExplanation: GroundedExplanation;
}
