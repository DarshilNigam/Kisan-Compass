/**
 * STAGE 9: FIELD EXECUTION INTELLIGENCE + ACTION VERIFICATION TYPES
 * 
 * Strict separation of:
 * 1. Decision Assurance (How good is the mathematical recommendation?)
 * 2. Execution Assurance (Can this plan realistically happen under physical constraints?)
 * 3. Outcome Verification (What actually occurred afterward?)
 * 
 * Zero fake logistics. Zero fake GPS. Explicit provenance: LIVE, FARMER_CONFIRMED, DEMO, SIMULATED.
 */

export type ExecutionFeasibilityStatus = 
  | 'READY' 
  | 'READY_WITH_CAUTION' 
  | 'CONSTRAINED' 
  | 'BLOCKED' 
  | 'UNKNOWN';

export type ReadinessFactorCategory = 
  | 'WEATHER_WINDOW' 
  | 'CROP_MATURITY' 
  | 'LOGISTICS' 
  | 'MARKET_WINDOW' 
  | 'HOLDING_CAPACITY' 
  | 'TIME_CONSTRAINT' 
  | 'HARVEST_CAPACITY';

export type ReadinessFactorStatus = 
  | 'READY' 
  | 'CAUTION' 
  | 'CONSTRAINED' 
  | 'BLOCKED' 
  | 'UNKNOWN';

export type VerificationOrigin = 
  | 'UNVERIFIED' 
  | 'FARMER_CONFIRMED' 
  | 'SYSTEM_OBSERVED' 
  | 'EXTERNAL_SOURCE_VERIFIED' 
  | 'DEMO' 
  | 'SIMULATED';

export type ExecutionStepStatus = 
  | 'NOT_STARTED' 
  | 'READY' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'BLOCKED' 
  | 'SKIPPED' 
  | 'UNKNOWN';

export type ExecutionEventType = 
  | 'PLAN_APPROVED' 
  | 'HARVEST_STARTED' 
  | 'HARVEST_COMPLETED' 
  | 'TRANSPORT_CONFIRMED' 
  | 'LOADING_STARTED' 
  | 'DISPATCHED' 
  | 'ARRIVED_AT_MANDI' 
  | 'SALE_RECORDED' 
  | 'EXECUTION_DELAYED' 
  | 'EXECUTION_BLOCKED' 
  | 'EXECUTION_CANCELLED';

export interface ExecutionReadinessFactor {
  id: string;
  category: ReadinessFactorCategory;
  name: string;
  status: ReadinessFactorStatus;
  evidence: string;
  details: string;
  source: string;
  origin: VerificationOrigin;
  isBlocker: boolean;
  whatIsNeeded: string;
}

export interface ExecutionFeasibilityReport {
  overallStatus: ExecutionFeasibilityStatus;
  headline: string;
  summary: string;
  confirmedCount: number;
  cautionCount: number;
  unknownCount: number;
  blockerCount: number;
  factors: ExecutionReadinessFactor[];
  evaluatedAt: string;
  actionReadinessScore: number; // 0 to 100
}

export interface ExecutionStep {
  stepNumber: number;
  id: string;
  title: string;
  description: string;
  category: 'PRE_HARVEST' | 'HARVEST' | 'POST_HARVEST' | 'LOGISTICS' | 'MANDI' | 'FINANCIAL';
  status: ExecutionStepStatus;
  requiredRole: string;
  estimatedDurationMinutes: number;
  verificationOrigin: VerificationOrigin;
  verifiedAt?: string;
  verificationEvidence?: string;
  isMandatory: boolean;
  dependencies: string[];
}

export interface ExecutionPlan {
  planId: string;
  decisionId: string;
  version: number;
  title: string;
  actionType: 'SELL NOW' | 'WAIT 3 DAYS' | 'WAIT 5 DAYS' | 'HOLD' | 'SPLIT HARVEST';
  crop: string;
  variety: string;
  plot: string;
  targetQuantityQuintals: number;
  targetMandi: string;
  timeWindowHours: number;
  deadlineTimestamp: string;
  expectedGrossInr: number;
  expectedFreightInr: number;
  expectedNetInr: number;
  overallReadiness: ExecutionFeasibilityStatus;
  steps: ExecutionStep[];
  createdAt: string;
  farmerApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
}

export interface ExecutionEvent {
  eventId: string;
  executionPlanId: string;
  timestamp: string;
  type: ExecutionEventType;
  status: 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO';
  source: string;
  origin: VerificationOrigin;
  title: string;
  previousState: string;
  currentState: string;
  evidence: string;
  notes?: string;
}

export type DeviationType = 
  | 'TIME_DELAY' 
  | 'PRICE_CHANGE' 
  | 'QUANTITY_CHANGE' 
  | 'DESTINATION_CHANGE' 
  | 'FREIGHT_SURGE' 
  | 'WEATHER_NARROWING';

export interface ExecutionDeviation {
  id: string;
  type: DeviationType;
  severity: 'INFO' | 'MODERATE' | 'MATERIAL' | 'CRITICAL';
  title: string;
  expectedValue: string | number;
  actualValue: string | number;
  deltaFormatted: string;
  financialImpactInr: number; // positive = upside, negative = dockage/penalty
  explanation: string;
  isMaterialToDecision: boolean; // triggers Farm Watch reassessment if true
  timestamp: string;
}

export interface ExecutionDeviationReport {
  hasDeviations: boolean;
  deviations: ExecutionDeviation[];
  cumulativeFinancialImpactInr: number;
  reassessmentRecommended: boolean;
  reassessmentReason?: string;
}

export interface ExecutionState {
  activePlan: ExecutionPlan;
  feasibility: ExecutionFeasibilityReport;
  events: ExecutionEvent[];
  deviationReport: ExecutionDeviationReport;
  currentStepIndex: number;
  isSimulated: boolean;
  lastUpdated: string;
}
