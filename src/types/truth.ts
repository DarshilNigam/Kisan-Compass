/**
 * KISAN COMPASS — Field-Grade Truth Layer & Data-Origin Contract (Stage 12)
 * 
 * Formal definitions separating Data Origin, Data Freshness, and Data Verification.
 * Eliminates ambiguities between real telemetry, cached state, historical baselines, and simulations.
 */

export type DataOrigin = 
  | 'LIVE'         // Real-time verified external API / sensor feed
  | 'CACHED'       // Recent real telemetry preserved under network fallback
  | 'HISTORICAL'   // Empirical multi-year regional baseline datasets
  | 'DERIVED'      // Deterministic mathematical calculation from inputs
  | 'ASSUMED'      // Declared agronomic / economic model parameters
  | 'DEMO'         // Verified benchmark demonstration records (e.g. historical season)
  | 'SIMULATED'    // Counterfactual What-If / Sandbox runs
  | 'UNKNOWN';     // Unverified source

export type DataFreshness = 
  | 'LIVE'           // Under freshness threshold (e.g. < 45m)
  | 'RECENT'         // Valid but near threshold boundary
  | 'STALE'          // Beyond nominal threshold; fallback in effect
  | 'EXPIRED'        // Cache exceeded max time-to-live
  | 'NOT_APPLICABLE';// Static constants, formulas, or historical records

export type DataVerification = 
  | 'VERIFIED'           // Cryptographically / officially verified (Open-Meteo NWP forecast, ICAR benchmark, APMC receipt)
  | 'PARTIALLY_VERIFIED' // Single-source verified without secondary cross-check
  | 'UNVERIFIED'         // User input, manual override, or simulated sandbox event
  | 'NOT_APPLICABLE';    // Mathematical formulas and pure definitions

export interface TruthContract {
  id: string;
  name: string;
  category: 'SOURCE' | 'OBSERVATION' | 'CALCULATION' | 'DECISION' | 'EXECUTION' | 'OUTCOME' | 'EVALUATION';
  origin: DataOrigin;
  freshness: DataFreshness;
  verification: DataVerification;
  confidence: number; // 0.00 to 1.00
  provider: string;
  endpointOrProtocol?: string;
  lastVerifiedAt: string;
  ageMinutes?: number;
  freshnessThresholdMinutes?: number;
  valueDisplay: string;
  unit?: string;
  limitationReason?: string;
  governingRule?: string;
  arithmeticTraceId?: string;
}

export interface TruthInventory {
  totalContracts: number;
  liveCount: number;
  cachedCount: number;
  historicalCount: number;
  derivedCount: number;
  assumedCount: number;
  simulatedCount: number;
  verifiedCount: number;
  compositeAssurance: 'HIGH' | 'MODERATE' | 'LOW' | 'DEGRADED';
  activeLimitations: string[];
  autonomousActionsAllowed: false; // Invariant: system never performs automatic real-world actions
  lastAuditTimestamp: string;
}

export type DecisionProofTarget = 
  | 'EVIDENCE_GRAPH'
  | 'PROVENANCE_DRAWER'
  | 'CALCULATION_TRACE'
  | 'EVALUATION_LAB'
  | 'EXECUTION_CENTER'
  | 'DECISION_REPLAY'
  | 'OUTCOME_CENTER'
  | 'STRESS_TEST'
  | 'WHAT_IF';

export interface DecisionProofNode {
  stepIndex: number;
  nodeId: string;
  title: string;
  subtitle: string;
  category: 'FIELD' | 'WEATHER' | 'MARKET' | 'LOGISTICS' | 'AGRONOMY' | 'COUNTERFACTUAL' | 'UTILITY' | 'RECOMMENDATION' | 'APPROVAL' | 'EXECUTION' | 'OUTCOME' | 'EVALUATION' | 'CALIBRATION';
  origin: DataOrigin;
  freshness: DataFreshness;
  verification: DataVerification;
  confidence: number;
  primaryValue: string;
  detailRows: { label: string; value: string; isHighlighted?: boolean }[];
  mathematicalEquation?: string;
  actionLabel: string;
  targetModal: DecisionProofTarget;
  targetPayload?: string;
}

export interface JudgeCheckpoint {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  keyAssertion: string;
  honestBoundary: string;
  demonstrationInstruction: string;
  actionType: 'NAVIGATE' | 'OPEN_MODAL' | 'TRIGGER_SIMULATION' | 'PROVE_METRIC' | 'AUDIT_CHECK';
  targetTab?: 'compass' | 'field' | 'what-if' | 'markets' | 'decisions';
  targetModal?: DecisionProofTarget | 'JUDGE_PROOF' | 'TRUTH_INSPECTOR' | 'FAILURE_DRAWER';
  expectedOutcome: string;
}
