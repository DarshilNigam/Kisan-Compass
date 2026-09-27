export type EvidenceNodeType =
  | 'SOURCE'
  | 'OBSERVATION'
  | 'SIGNAL'
  | 'FACTOR'
  | 'CALCULATION'
  | 'DECISION'
  | 'ACTION'
  | 'OUTCOME'
  | 'EVALUATION';

export type EvidenceRelationType =
  | 'INFORMS'
  | 'DERIVES'
  | 'AFFECTS'
  | 'CONTRADICTS'
  | 'SUPPORTS'
  | 'TRIGGERS'
  | 'RESULTS_IN'
  | 'AUDITS'
  | 'MEASURES'
  | 'INCLUDED_IN';

export type EpistemicCategory = 'OBSERVED' | 'ESTIMATED' | 'DERIVED' | 'ASSUMED';

export type SourceHealthStatus =
  | 'LIVE'
  | 'CACHED'
  | 'STALE'
  | 'FAILED'
  | 'UNAVAILABLE'
  | 'ESTIMATED';

export type ConflictSeverity = 'INFO' | 'WATCH' | 'MATERIAL' | 'CRITICAL';

export interface EvidenceNode {
  id: string;
  type: EvidenceNodeType;
  label: string;
  value: string | number;
  unit?: string;
  timestamp: string;
  source?: string;
  freshness?: string;
  confidence?: number;
  status?: SourceHealthStatus;
  epistemicCategory: EpistemicCategory;
  details?: string;
  actionTarget?: 'SHOW_CALCULATION' | 'SHOW_PROVENANCE' | 'SHOW_CONFLICT' | 'SHOW_STRESS_TEST';
  actionPayload?: string;
}

export interface EvidenceEdge {
  from: string;
  to: string;
  relation: EvidenceRelationType;
  label?: string;
}

export interface DecisionEvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  rootSourceIds: string[];
  decisionNodeId: string;
  actionNodeId: string;
  summaryNarrative: string;
}

export interface AssumptionItem {
  id: string;
  label: string;
  value: string;
  category: EpistemicCategory;
  source: string;
  sensitivity: 'HIGH' | 'MEDIUM' | 'LOW';
  decisionImpact: string;
  whatIfShift: string;
}

export interface SourceHealthItem {
  id: string;
  name: string;
  provider: string;
  status: SourceHealthStatus;
  ageMinutes: number;
  freshnessThresholdMinutes: number;
  isWithinThreshold: boolean;
  lastSuccessfulFetch: string;
  endpoint?: string;
  confidence: number;
  usedBy: string[];
  degradedImpact: string;
}

export interface ConfidenceFactor {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  note: string;
}

export interface CompositeConfidence {
  score: number; // 0.0 to 1.0
  rating: 'HIGH' | 'MODERATE' | 'LOW';
  usableSourcesCount: number;
  totalSourcesCount: number;
  usableSourcesRatio: string;
  freshnessCompliance: boolean;
  forecastModelSource: 'LIVE_MODEL' | 'CACHED_FORECAST' | 'BASELINE';
  unresolvedConflictCount: number;
  justification: string;
  factors: ConfidenceFactor[];
}

export interface CalculationInput {
  label: string;
  value: number | string;
  unit?: string;
  category: EpistemicCategory;
}

export interface CalculationTraceStep {
  id: string;
  title: string;
  formulaText: string;
  inputs: CalculationInput[];
  intermediateMath: string;
  outputValue: number | string;
  outputUnit: string;
  interpretation: string;
}

export interface DecisionAuditSnapshot {
  snapshotId: string;
  createdAt: string;
  fieldId: string;
  cropVariety: string;
  maturityPercentage: number;
  primaryRecommendation: string;
  expectedNetRealizationInr: number;
  compositeConfidence: CompositeConfidence;
  sources: SourceHealthItem[];
  activeConflicts: {
    category: string;
    title: string;
    severity: ConflictSeverity;
    tradeoff: string;
  }[];
  assumptions: AssumptionItem[];
  calculationTrace: CalculationTraceStep[];
  farmerAction?: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  actualOutcomeInr?: number;
}
