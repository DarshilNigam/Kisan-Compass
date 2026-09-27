export type FarmWatchStatus = 
  | 'WATCHING' 
  | 'CHANGE_DETECTED' 
  | 'REASSESSMENT_REQUIRED' 
  | 'FARMER_REVIEW' 
  | 'RESOLVED' 
  | 'PAUSED';

export type EventSeverity = 
  | 'INFO' 
  | 'WATCH' 
  | 'MATERIAL' 
  | 'DECISION_CHANGING' 
  | 'CRITICAL';

export type MaterialityClassification = 
  | 'NOISE' 
  | 'INFO' 
  | 'MATERIAL' 
  | 'DECISION_CHANGING' 
  | 'CRITICAL';

export type EventOrigin = 'LIVE' | 'CACHED' | 'DEMO' | 'SIMULATED';

export type ActionPlanHealth = 'VALID' | 'WATCH' | 'AT_RISK' | 'INVALIDATED' | 'COMPLETED';

export interface MonitoredSignalItem {
  id: string;
  name: string;
  category: 'WEATHER' | 'MARKET' | 'LOGISTICS' | 'MATURITY';
  currentValue: string;
  baselineValue: string;
  sensitivityRegion: string;
  isDecisionSensitive: boolean;
  lastShiftText: string;
  status: 'NORMAL' | 'APPROACHING_TRIGGER' | 'TRIGGERED';
}

export interface FarmEvent {
  eventId: string;
  timestamp: string;
  origin: EventOrigin;
  signalType: 'WEATHER' | 'MARKET' | 'LOGISTICS' | 'MATURITY' | 'FORECAST_ASSURANCE' | 'SOURCE_HEALTH';
  title: string;
  previousValue: string | number;
  currentValue: string | number;
  deltaFormatted: string;
  unit: string;
  severity: EventSeverity;
  materiality: MaterialityClassification;
  decisionImpact: string;
  affectedDecisionId: string;
  evidenceNodeIds: string[];
  dedupKey: string;
  whyAlertSummary: string;
}

export interface ReassessmentFactorDiff {
  factor: string;
  from: string;
  to: string;
  impact: string;
}

export interface DecisionReassessmentRecord {
  reassessmentId: string;
  decisionId: string;
  createdAt: string;
  origin: EventOrigin;
  triggerEvent: FarmEvent;
  previousRecommendation: 'SELL NOW' | 'WAIT 3 DAYS' | 'WAIT 5 DAYS' | 'HOLD' | 'SPLIT HARVEST';
  previousExpectedNet: number;
  newRecommendation: 'SELL NOW' | 'WAIT 3 DAYS' | 'WAIT 5 DAYS' | 'HOLD' | 'SPLIT HARVEST';
  newExpectedNet: number;
  deltaInr: number;
  whyHeadline: string;
  whyBody: string;
  affectedFactors: ReassessmentFactorDiff[];
  farmerResponse: 'PENDING' | 'ACCEPTED_NEW' | 'KEPT_PREVIOUS' | 'DISMISSED';
  respondedAt?: string;
}

export interface FarmWatchState {
  watchId: string;
  decisionId: string;
  status: FarmWatchStatus;
  startedAt: string;
  lastEvaluatedAt: string;
  monitoredSignals: MonitoredSignalItem[];
  recentEvents: FarmEvent[];
  pendingReassessment: DecisionReassessmentRecord | null;
  reassessmentHistory: DecisionReassessmentRecord[];
  actionPlanHealth: ActionPlanHealth;
  actionPlanHealthReason: string;
}
