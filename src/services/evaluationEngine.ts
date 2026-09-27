/**
 * KISAN COMPASS — Evaluation Engine (Stage 11)
 * 
 * Deterministic, pure evaluation engine:
 * Given a dataset snapshot + metric definition -> computes exact MetricProvenance with step-by-step arithmetic traces.
 * Guarantees 100% reproducibility: Run 1 on Dataset A === Run 2 on Dataset A.
 */

import { 
  EvaluationDataset, 
  EvaluationRun, 
  MetricProvenance, 
  EvaluationManifest,
  HorizonEvaluationSummary,
  OriginType
} from '../types/evaluation';
import { METRIC_REGISTRY } from './metricRegistry';
import { EvaluationLeakageGuard } from './evaluationLeakageGuard';
import { LongitudinalDecisionRecord } from '../types/memory';
import { EvaluationDatasetService } from './evaluationDatasetService';

export class EvaluationEngine {
  /**
   * Executes a full deterministic evaluation run on a dataset.
   */
  public static evaluateDataset(
    dataset: EvaluationDataset,
    versionNumber: number = 1,
    rawRecords: LongitudinalDecisionRecord[] = []
  ): EvaluationRun {
    const runId = `EVAL-2026-03-26-${versionNumber.toString().padStart(3, '0')}`;
    const obs = dataset.eligibleObservations;
    const N = obs.length;

    const observationIds = obs.map(o => o.observationId);
    const overallOrigin: OriginType = dataset.filterMode === 'SIMULATION_ONLY'
      ? 'SIMULATED'
      : dataset.filterMode === 'REAL_ONLY'
      ? 'REAL_VERIFIED'
      : 'SEEDED_DEMO';

    const timestamp = new Date().toISOString();

    // 1. Compute P50 MAE
    const maeDef = METRIC_REGISTRY.FORECAST_P50_MAE;
    const isMaeSufficient = N >= maeDef.minimumSampleSize;
    const absErrors = obs.map(o => ({ id: o.observationId, label: `${o.observationId} (|${o.realizedNetInr} - ${o.forecastP50}|)`, value: o.absoluteError }));
    const totalAbsError = absErrors.reduce((sum, item) => sum + item.value, 0);
    const p50MaeVal = N > 0 ? Math.round(totalAbsError / N) : 0;

    const p50Mae: MetricProvenance = {
      metricId: `METRIC-PROV-MAE-${versionNumber}`,
      metricKey: maeDef.key,
      metricName: maeDef.name,
      value: p50MaeVal,
      formattedValue: N > 0 ? `₹${p50MaeVal.toLocaleString('en-IN')}` : 'N/A',
      unit: maeDef.unit,
      formula: maeDef.formula,
      datasetId: dataset.datasetId,
      datasetVersion: dataset.datasetVersion,
      observationIds,
      sampleSize: N,
      minimumSampleSize: maeDef.minimumSampleSize,
      isSampleSufficient: isMaeSufficient,
      status: isMaeSufficient ? 'SUPPORTED' : 'INSUFFICIENT_DATA',
      origin: overallOrigin,
      generatedAt: timestamp,
      limitations: maeDef.limitations,
      interpretation: `${maeDef.interpretation} Across ${N} observations, the mean deviation was ₹${p50MaeVal}/qtl.`,
      whyThisNumberExists: `Derived deterministically from ${N} eligible harvest settlements by computing the mean of individual absolute deviations.`,
      calculationTrace: [
        {
          stepNumber: 1,
          label: 'Collect Individual Absolute Errors',
          formula: '|RealizedNet - P50| for each observation',
          substitution: absErrors.map(e => `|${e.id}: ₹${e.value}|`).join(' + '),
          result: `Σ |Errors| = ₹${totalAbsError.toLocaleString('en-IN')}`,
          componentValues: absErrors
        },
        {
          stepNumber: 2,
          label: 'Divide by Eligible Sample Size (N)',
          formula: 'Total Absolute Error / N',
          substitution: `₹${totalAbsError.toLocaleString('en-IN')} / ${N}`,
          result: `₹${p50MaeVal} / qtl`
        }
      ]
    };

    // 2. Compute RMSE
    const rmseDef = METRIC_REGISTRY.FORECAST_RMSE;
    const isRmseSufficient = N >= rmseDef.minimumSampleSize;
    const squaredErrors = obs.map(o => ({ id: o.observationId, label: `${o.observationId} (${o.signedError}^2)`, value: o.signedError * o.signedError }));
    const totalSquaredError = squaredErrors.reduce((sum, item) => sum + item.value, 0);
    const rmseVal = N > 0 ? Math.round(Math.sqrt(totalSquaredError / N)) : 0;

    const rmse: MetricProvenance = {
      metricId: `METRIC-PROV-RMSE-${versionNumber}`,
      metricKey: rmseDef.key,
      metricName: rmseDef.name,
      value: rmseVal,
      formattedValue: N > 0 ? `₹${rmseVal.toLocaleString('en-IN')}` : 'N/A',
      unit: rmseDef.unit,
      formula: rmseDef.formula,
      datasetId: dataset.datasetId,
      datasetVersion: dataset.datasetVersion,
      observationIds,
      sampleSize: N,
      minimumSampleSize: rmseDef.minimumSampleSize,
      isSampleSufficient: isRmseSufficient,
      status: isRmseSufficient ? 'SUPPORTED' : 'INSUFFICIENT_DATA',
      origin: overallOrigin,
      generatedAt: timestamp,
      limitations: rmseDef.limitations,
      interpretation: `${rmseDef.interpretation} Quadratic weighting yields an RMSE of ₹${rmseVal}/qtl.`,
      whyThisNumberExists: `Evaluates dispersion of forecast realization errors across ${N} events.`,
      calculationTrace: [
        {
          stepNumber: 1,
          label: 'Calculate Sum of Squared Realization Errors',
          formula: 'Σ (RealizedNet - P50)^2',
          substitution: squaredErrors.map(e => `${e.id}: (${e.value})`).join(' + '),
          result: `Σ Squared Errors = ${totalSquaredError.toLocaleString('en-IN')}`,
          componentValues: squaredErrors
        },
        {
          stepNumber: 2,
          label: 'Square Root of Mean Squared Error',
          formula: 'sqrt(SumSquaredErrors / N)',
          substitution: `sqrt(${totalSquaredError.toLocaleString('en-IN')} / ${N})`,
          result: `₹${rmseVal} / qtl`
        }
      ]
    };

    // 3. Compute Mean Signed Bias
    const biasDef = METRIC_REGISTRY.FORECAST_SIGNED_BIAS;
    const isBiasSufficient = N >= biasDef.minimumSampleSize;
    const signedErrors = obs.map(o => ({ id: o.observationId, label: `${o.observationId} (${o.signedError})`, value: o.signedError }));
    const totalSignedError = signedErrors.reduce((sum, item) => sum + item.value, 0);
    const biasVal = N > 0 ? Math.round(totalSignedError / N) : 0;

    const meanSignedBias: MetricProvenance = {
      metricId: `METRIC-PROV-BIAS-${versionNumber}`,
      metricKey: biasDef.key,
      metricName: biasDef.name,
      value: biasVal,
      formattedValue: N > 0 ? `${biasVal >= 0 ? '+' : ''}₹${biasVal.toLocaleString('en-IN')}` : 'N/A',
      unit: biasDef.unit,
      formula: biasDef.formula,
      datasetId: dataset.datasetId,
      datasetVersion: dataset.datasetVersion,
      observationIds,
      sampleSize: N,
      minimumSampleSize: biasDef.minimumSampleSize,
      isSampleSufficient: isBiasSufficient,
      status: isBiasSufficient ? 'SUPPORTED' : 'INSUFFICIENT_DATA',
      origin: overallOrigin,
      generatedAt: timestamp,
      limitations: biasDef.limitations,
      interpretation: biasVal > 20 
        ? `Model is conservatively under-projecting revenue by ₹${biasVal}/qtl on average.` 
        : biasVal < -20 
        ? `Model is over-projecting revenue by ₹${Math.abs(biasVal)}/qtl on average.` 
        : 'Model demonstrates balanced estimation with minimal directional skew.',
      whyThisNumberExists: `Determines whether systematic forecast optimism or pessimism exists across ${N} outcomes.`,
      calculationTrace: [
        {
          stepNumber: 1,
          label: 'Sum of Signed Variances',
          formula: 'Σ (RealizedNet - P50)',
          substitution: signedErrors.map(e => `${e.id}: ${e.value >= 0 ? '+' : ''}${e.value}`).join(' + '),
          result: `Total Signed Variance = ${totalSignedError >= 0 ? '+' : ''}₹${totalSignedError.toLocaleString('en-IN')}`,
          componentValues: signedErrors
        },
        {
          stepNumber: 2,
          label: 'Divide by Sample Size (N)',
          formula: 'Total Signed Variance / N',
          substitution: `${totalSignedError} / ${N}`,
          result: `${biasVal >= 0 ? '+' : ''}₹${biasVal} / qtl`
        }
      ]
    };

    // 4. Compute Interval Coverage Rate
    const covDef = METRIC_REGISTRY.INTERVAL_COVERAGE;
    const isCovSufficient = N >= covDef.minimumSampleSize;
    const insideList = obs.map(o => ({ id: o.observationId, label: o.observationId, value: o.isInsideInterval ? 1 : 0 }));
    const insideCount = insideList.filter(item => item.value === 1).length;
    const coverageFraction = N > 0 ? (insideCount / N) : 0;
    const coveragePct = Math.round(coverageFraction * 100);

    const intervalCoverage: MetricProvenance = {
      metricId: `METRIC-PROV-COV-${versionNumber}`,
      metricKey: covDef.key,
      metricName: covDef.name,
      value: coveragePct,
      formattedValue: N > 0 ? `${coveragePct}% (${insideCount}/${N})` : 'N/A',
      unit: covDef.unit,
      formula: covDef.formula,
      datasetId: dataset.datasetId,
      datasetVersion: dataset.datasetVersion,
      observationIds,
      sampleSize: N,
      minimumSampleSize: covDef.minimumSampleSize,
      isSampleSufficient: isCovSufficient,
      status: isCovSufficient ? 'SUPPORTED' : 'INSUFFICIENT_DATA',
      origin: overallOrigin,
      generatedAt: timestamp,
      limitations: covDef.limitations,
      interpretation: coveragePct >= 75 && coveragePct <= 90
        ? `Well calibrated: ${insideCount}/${N} realized outcomes fell inside the theoretical 80% P10–P90 interval.`
        : coveragePct < 75
        ? `Intervals are too narrow: only ${insideCount}/${N} outcomes fell inside the predicted bounds.`
        : `Intervals are conservatively wide: ${insideCount}/${N} outcomes fell inside bounds.`,
      whyThisNumberExists: `Measures statistical coverage of the P10–P90 quantile spread against actual realizations.`,
      calculationTrace: [
        {
          stepNumber: 1,
          label: 'Test Each Observation Against [P10, P90] Bounds',
          formula: 'Is P10 ≤ RealizedNet ≤ P90 ?',
          substitution: obs.map(o => `${o.observationId}: [₹${o.forecastP10} ≤ ₹${o.realizedNetInr} ≤ ₹${o.forecastP90}] -> ${o.isInsideInterval ? 'PASS' : 'FAIL'}`).join('; '),
          result: `${insideCount} of ${N} inside predicted interval`
        },
        {
          stepNumber: 2,
          label: 'Calculate Empirical Percentage',
          formula: '(Inside Count / N) * 100',
          substitution: `(${insideCount} / ${N}) * 100`,
          result: `${coveragePct}% Empirical Interval Coverage`
        }
      ]
    };

    // 5. Compute Confidence-Outcome Alignment Index
    const alignDef = METRIC_REGISTRY.CONFIDENCE_OUTCOME_ALIGNMENT;
    const isAlignSufficient = N >= alignDef.minimumSampleSize;
    let brierSum = 0;
    const alignmentComponents: Array<{ id: string; label: string; value: number }> = [];

    obs.forEach(o => {
      const confFrac = (o.statedConfidence || 85) / 100;
      const isAccurate = (o.absoluteError / Math.max(1, o.forecastP50)) <= 0.15 ? 1 : 0;
      const squaredDiff = Math.pow(confFrac - isAccurate, 2);
      brierSum += squaredDiff;
      alignmentComponents.push({
        id: o.observationId,
        label: `${o.observationId} (Conf: ${(confFrac * 100).toFixed(0)}%, Accurate: ${isAccurate})`,
        value: Math.round(squaredDiff * 100) / 100
      });
    });

    const brierProxy = N > 0 ? (brierSum / N) : 0;
    const alignmentIndex = N > 0 ? Math.round((1 - brierProxy) * 100) : 0;

    const confidenceAlignment: MetricProvenance = {
      metricId: `METRIC-PROV-ALIGN-${versionNumber}`,
      metricKey: alignDef.key,
      metricName: alignDef.name,
      value: alignmentIndex,
      formattedValue: N > 0 ? `${alignmentIndex}/100 (Brier: ${brierProxy.toFixed(2)})` : 'N/A',
      unit: alignDef.unit,
      formula: alignDef.formula,
      datasetId: dataset.datasetId,
      datasetVersion: dataset.datasetVersion,
      observationIds,
      sampleSize: N,
      minimumSampleSize: alignDef.minimumSampleSize,
      isSampleSufficient: isAlignSufficient,
      status: isAlignSufficient ? 'SUPPORTED' : 'INSUFFICIENT_DATA',
      origin: overallOrigin,
      generatedAt: timestamp,
      limitations: alignDef.limitations,
      interpretation: alignmentIndex >= 80 
        ? `Strong alignment: Ex-ante confidence reliably reflected realization accuracy across ${N} cycles.`
        : `Moderate alignment: Occasional divergence between confidence level and realized market variance.`,
      whyThisNumberExists: `Mathematically audits whether decision confidence was justified by subsequent outcomes.`,
      calculationTrace: [
        {
          stepNumber: 1,
          label: 'Compute Squared Confidence-Outcome Discrepancy per Event',
          formula: '(ConfidenceFraction - IsWithin15PctTolerance)^2',
          substitution: alignmentComponents.map(c => `${c.id}: (${c.value})`).join(' + '),
          result: `Sum Squared Discrepancy = ${brierSum.toFixed(3)}`,
          componentValues: alignmentComponents
        },
        {
          stepNumber: 2,
          label: 'Calculate Alignment Score Index (1 - Mean Discrepancy)',
          formula: '100 * (1 - (Sum / N))',
          substitution: `100 * (1 - (${brierSum.toFixed(3)} / ${N}))`,
          result: `${alignmentIndex} / 100 Alignment Score`
        }
      ]
    };

    // 6. Horizon breakdown
    const horizonBuckets: Array<'0-1d' | '2-4d' | '5-7d'> = ['0-1d', '2-4d', '5-7d'];
    const horizonBreakdown: HorizonEvaluationSummary[] = horizonBuckets.map(bucket => {
      const bucketObs = obs.filter(o => o.horizonBucket === bucket);
      const bN = bucketObs.length;
      const bTotalAbsErr = bucketObs.reduce((s, o) => s + o.absoluteError, 0);
      const bMae = bN > 0 ? Math.round(bTotalAbsErr / bN) : 0;
      const bInside = bucketObs.filter(o => o.isInsideInterval).length;
      const bCov = bN > 0 ? Math.round((bInside / bN) * 100) : 0;

      const label = bucket === '0-1d' ? '1-Day Lead Time' : bucket === '2-4d' ? '3-Day Lead Time' : '7-Day Lead Time';

      const bMaeProv: MetricProvenance = {
        metricId: `HORIZON-MAE-${bucket}`,
        metricKey: `HORIZON_MAE_${bucket}`,
        metricName: `${label} MAE`,
        value: bMae,
        formattedValue: `₹${bMae}`,
        unit: '₹/qtl',
        formula: 'Σ |Actual - P50| / N_bucket',
        datasetId: dataset.datasetId,
        datasetVersion: dataset.datasetVersion,
        observationIds: bucketObs.map(o => o.observationId),
        sampleSize: bN,
        minimumSampleSize: 3,
        isSampleSufficient: bN >= 3,
        status: bN >= 3 ? 'SUPPORTED' : 'INSUFFICIENT_DATA',
        origin: overallOrigin,
        generatedAt: timestamp,
        calculationTrace: [],
        limitations: [`Horizon bucket contains ${bN} observations.`],
        interpretation: `Mean point error for ${label} forecasts is ₹${bMae}/qtl.`,
        whyThisNumberExists: `Evaluates lead-time degradation for ${label}.`
      };

      const bCovProv: MetricProvenance = {
        metricId: `HORIZON-COV-${bucket}`,
        metricKey: `HORIZON_COV_${bucket}`,
        metricName: `${label} Interval Coverage`,
        value: bCov,
        formattedValue: `${bCov}%`,
        unit: '%',
        formula: '(Count(Inside) / N_bucket) * 100',
        datasetId: dataset.datasetId,
        datasetVersion: dataset.datasetVersion,
        observationIds: bucketObs.map(o => o.observationId),
        sampleSize: bN,
        minimumSampleSize: 3,
        isSampleSufficient: bN >= 3,
        status: bN >= 3 ? 'SUPPORTED' : 'INSUFFICIENT_DATA',
        origin: overallOrigin,
        generatedAt: timestamp,
        calculationTrace: [],
        limitations: [`Bucket sample size N=${bN}.`],
        interpretation: `${bInside}/${bN} observations inside P10–P90 interval.`,
        whyThisNumberExists: `Evaluates uncertainty coverage for ${label}.`
      };

      return {
        horizonBucket: bucket,
        label,
        sampleSize: bN,
        mae: bMaeProv,
        coverage: bCovProv,
        status: bN < 3 ? 'INSUFFICIENT_DATA' : bCov >= 70 ? 'WELL_CALIBRATED' : 'TOO_NARROW'
      };
    });

    // 7. Temporal Integrity Audit
    const temporalIntegrity = EvaluationLeakageGuard.auditTemporalIntegrity(rawRecords);

    // 8. Evaluation Manifest
    const manifest: EvaluationManifest = {
      runId,
      datasetVersion: dataset.datasetVersion,
      forecastEngineVersion: 'BASELINE-v1.1 (Historical Quantile Engine)',
      decisionEngineVersion: 'DECISION-v3 (Multi-Factor Utility Engine)',
      calibrationEngineVersion: 'CALIBRATION-v3 (Deterministic Truth Engine)',
      evaluationEngineVersion: 'EVALUATION-LAB-v1.0',
      generatedAt: timestamp,
      origin: overallOrigin,
      observationCount: N,
      exclusionCount: dataset.exclusions.length,
      reproducibilityHash: `HASH-${dataset.datasetVersion}-${N}-${p50MaeVal}-${coveragePct}`
    };

    const summaryStatement = N >= 5
      ? `Evaluation Run ${runId} confirms ${coveragePct}% interval coverage (${insideCount}/${N} inside P10–P90) with ₹${p50MaeVal}/qtl MAE across ${dataset.filterMode} mode.`
      : `Evaluation Run ${runId} contains ${N} observations (Sample size threshold monitoring).`;

    return {
      runId,
      versionNumber,
      createdAt: timestamp,
      dataset,
      manifest,
      temporalIntegrity,
      metrics: {
        p50Mae,
        rmse,
        meanSignedBias,
        intervalCoverage,
        confidenceAlignment
      },
      horizonBreakdown,
      summaryStatement
    };
  }

  /**
   * Helper to build and evaluate raw records in one step.
   */
  public static runFullEvaluation(
    records: LongitudinalDecisionRecord[],
    filterMode: 'REAL_ONLY' | 'INCLUDE_DEMO' | 'SIMULATION_ONLY' = 'INCLUDE_DEMO',
    versionNumber: number = 1
  ): EvaluationRun {
    const datasetVersion = `CALIBRATION-v${versionNumber}`;
    const dataset = EvaluationDatasetService.buildEvaluationDataset(records, filterMode, datasetVersion);
    return this.evaluateDataset(dataset, versionNumber, records);
  }
}
