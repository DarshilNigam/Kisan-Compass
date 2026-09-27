export type DecisionRobustnessClassification = 'ROBUST' | 'SENSITIVE' | 'FRAGILE';

export interface StressTestScenarioInputs {
  rainProbability: number; // 0 to 100%
  priceMultiplier: number;  // 0.80 to 1.20 (i.e. -20% to +20%)
  freightMultiplier: number;// 0.80 to 1.40 (i.e. -20% to +40%)
  confidenceLevel: 'HIGH' | 'MODERATE' | 'LOW';
  simulatedRiskAversion: number; // 0.10 to 0.90
}

export interface WhatWouldChangeMyMindResult {
  currentRecommendation: string;
  flippedRecommendation: string;
  rainFlipThresholdPercent?: number;
  priceFlipThresholdPercent?: number;
  flipConditionSummary: string;
  hasStableFlipThreshold: boolean;
  dominantSensitivity: string;
}

export interface StressTestResult {
  scenario: StressTestScenarioInputs;
  recalculatedGrossInr: number;
  recalculatedFreightInr: number;
  recalculatedWeatherPenaltyInr: number;
  recalculatedSpoilagePenaltyInr: number;
  recalculatedNetRealization: number;
  recalculatedRange: {
    p10: number;
    p50: number;
    p90: number;
  };
  recalculatedUtilityScore: number;
  recalculatedRecommendation: 'SELL NOW' | 'WAIT 3 DAYS' | 'WAIT 5 DAYS' | 'SPLIT HARVEST';
  decisionRobustness: DecisionRobustnessClassification;
  robustnessExplanation: string;
  primarySensitivityFactor: string;
  whatWouldChangeMyMind: WhatWouldChangeMyMindResult;
  isFlippedFromBaseline: boolean;
}

export interface DecisionGradeConflict {
  id: string;
  category: 'WEATHER_VS_MARKET' | 'MATURITY_VS_WEATHER' | 'PRICE_VS_LOGISTICS';
  title: string;
  signalA: {
    name: string;
    value: string;
    favorsAction: string;
  };
  signalB: {
    name: string;
    value: string;
    favorsAction: string;
  };
  currentDecisionTradeoff: string;
  dominatingFactor: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CandidateHarvestOption {
  id: string;
  label: string;
  type: 'SELL_NOW' | 'WAIT' | 'SPLIT';
  nowQuantityQuintals: number;
  laterQuantityQuintals: number;
  nowDestinationMandi: string;
  laterDestinationMandi: string;
  nowNetRealizationInr: number;
  laterNetRealizationInr: number;
  totalExpectedNetRealizationInr: number;
  range: {
    p10: number;
    p50: number;
    p90: number;
  };
  downsideExposureInr: number;
  utilityScore: number;
  isMathematicallyOptimal: boolean;
  strategicRationale: string;
}

export interface ReassessmentTrigger {
  id: string;
  title: string;
  conditionText: string;
  threshold: string;
  monitoredSource: string;
}

export interface HarvestActionPlan {
  planId: string;
  createdAt: string;
  selectedOption: CandidateHarvestOption;
  immediateAction: string;
  destinationMandi: string;
  targetHarvestWindow: string;
  retainedBatchAction?: string;
  expectedNetRealization: number;
  expectedRange: {
    p10: number;
    p50: number;
    p90: number;
  };
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  reassessmentTriggers: ReassessmentTrigger[];
  approvalRequired: boolean;
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
}
