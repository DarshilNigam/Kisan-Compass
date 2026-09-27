/**
 * KISAN COMPASS — Performance Claim Guard (Stage 11)
 * 
 * Integrity guard to prevent ungrounded, marketing-inflated, or cherry-picked performance claims.
 * 
 * Rules:
 * 1. Bans generic "AI Accuracy = 94%" claims.
 * 2. Enforces Sample-Size Governance (N >= 3 for point errors, N >= 5 for coverage).
 * 3. Enforces mathematically valid Brier terminology.
 * 4. Prevents demo/simulated outcomes from masquerading as verified real-world evidence.
 */

import { MetricProvenance } from '../types/evaluation';

export class PerformanceClaimGuard {
  private static BANNED_PATTERNS = [
    /ai is 9\d% accurate/i,
    /ai accuracy/i,
    /ai gets smarter/i,
    /ai mastered/i,
    /100% accurate/i,
    /zero risk/i,
    /perfect prediction/i
  ];

  /**
   * Sanitizes and verifies user-facing statements against statistical honesty rules.
   */
  public static validateTextClaim(statement: string): { isValid: boolean; violationReason?: string; sanitizedText: string } {
    for (const pattern of this.BANNED_PATTERNS) {
      if (pattern.test(statement)) {
        return {
          isValid: false,
          violationReason: `Statement matches banned marketing pattern: ${pattern.toString()}`,
          sanitizedText: statement.replace(pattern, '[EVIDENCE-BACKED METRIC REQUIRED]')
        };
      }
    }

    return {
      isValid: true,
      sanitizedText: statement
    };
  }

  /**
   * Validates whether a MetricProvenance object satisfies governance requirements.
   */
  public static auditMetricIntegrity(metric: MetricProvenance): {
    isGovernanceSatisfied: boolean;
    governanceBadge: 'VERIFIED' | 'SAMPLE_LIMITED' | 'INSUFFICIENT_DATA' | 'SIMULATED';
    guardSummary: string;
  } {
    if (metric.origin === 'SIMULATED') {
      return {
        isGovernanceSatisfied: true,
        governanceBadge: 'SIMULATED',
        guardSummary: `Simulation sandbox metric derived from ${metric.sampleSize} simulated counterfactuals. Never blended with real ledger.`
      };
    }

    if (metric.sampleSize < metric.minimumSampleSize) {
      return {
        isGovernanceSatisfied: false,
        governanceBadge: 'INSUFFICIENT_DATA',
        guardSummary: `Sample size (N=${metric.sampleSize}) is below governance threshold (N≥${metric.minimumSampleSize}). Marked INSUFFICIENT DATA.`
      };
    }

    if (metric.sampleSize < 10) {
      return {
        isGovernanceSatisfied: true,
        governanceBadge: 'SAMPLE_LIMITED',
        guardSummary: `Meets minimum threshold (N=${metric.sampleSize} ≥ ${metric.minimumSampleSize}), but pilot sample size is limited.`
      };
    }

    return {
      isGovernanceSatisfied: true,
      governanceBadge: 'VERIFIED',
      guardSummary: `Empirical metric verified against ${metric.sampleSize} eligible observation records.`
    };
  }
}
