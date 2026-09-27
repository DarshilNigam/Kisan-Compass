import { 
  ExecutionPlan, 
  ExecutionDeviation, 
  ExecutionDeviationReport 
} from '../types/execution';

/**
 * Deterministic Execution Deviation Engine
 * Detects discrepancies between the planned execution and real-world occurrences.
 * 
 * Capabilities:
 * - Quantifies financial impact of price, quantity, and freight shifts.
 * - Detects time slippage and weather window compression.
 * - Recommends Stage 8 Farm Watch reassessment if a deviation crosses materiality thresholds.
 */

export interface ActualExecutionInput {
  actualPricePerQuintal?: number;
  actualQuantityQuintals?: number;
  actualFreightInr?: number;
  actualMandi?: string;
  actualDispatchTimeHours?: number; // e.g. 17.5 for 17:30
  plannedDispatchTimeHours?: number; // e.g. 14.0 for 14:00
}

export function evaluateExecutionDeviations(
  plan: ExecutionPlan,
  actuals: ActualExecutionInput
): ExecutionDeviationReport {
  const deviations: ExecutionDeviation[] = [];
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';

  let cumulativeFinancialImpactInr = 0;
  let reassessmentRecommended = false;
  let reassessmentReason = '';

  // 1. Price Deviation
  if (actuals.actualPricePerQuintal !== undefined) {
    const expectedPrice = Math.round(plan.expectedGrossInr / plan.targetQuantityQuintals);
    const diff = actuals.actualPricePerQuintal - expectedPrice;
    if (diff !== 0) {
      const impact = diff * (actuals.actualQuantityQuintals ?? plan.targetQuantityQuintals);
      cumulativeFinancialImpactInr += impact;

      const pct = Math.abs((diff / expectedPrice) * 100);
      const severity = pct > 10 ? 'MATERIAL' : pct > 5 ? 'MODERATE' : 'INFO';

      deviations.push({
        id: 'DEV-PRICE',
        type: 'PRICE_CHANGE',
        severity,
        title: `Mandi Spot Price Adjustment (${diff >= 0 ? '+' : ''}₹${diff}/qtl)`,
        expectedValue: `₹${expectedPrice}/qtl`,
        actualValue: `₹${actuals.actualPricePerQuintal}/qtl`,
        deltaFormatted: `${diff >= 0 ? '+' : ''}₹${diff}/qtl (${(diff / expectedPrice * 100).toFixed(1)}%)`,
        financialImpactInr: impact,
        explanation: diff > 0 
          ? `Higher realized auction clearing bid yields +₹${impact.toLocaleString('en-IN')} net upside.`
          : `Market cleared at lower bid, reducing gross revenue by ₹${Math.abs(impact).toLocaleString('en-IN')}.`,
        isMaterialToDecision: pct > 14.5,
        timestamp: nowTime,
      });

      if (pct > 14.5) {
        reassessmentRecommended = true;
        reassessmentReason = `Price deviation of ${pct.toFixed(1)}% crosses the Stage 8 market sensitivity threshold.`;
      }
    }
  }

  // 2. Quantity Deviation
  if (actuals.actualQuantityQuintals !== undefined && actuals.actualQuantityQuintals !== plan.targetQuantityQuintals) {
    const expectedQty = plan.targetQuantityQuintals;
    const diffQty = actuals.actualQuantityQuintals - expectedQty;
    const price = actuals.actualPricePerQuintal ?? Math.round(plan.expectedGrossInr / plan.targetQuantityQuintals);
    const impact = diffQty * price;
    cumulativeFinancialImpactInr += impact;

    deviations.push({
      id: 'DEV-QUANTITY',
      type: 'QUANTITY_CHANGE',
      severity: Math.abs(diffQty) > 3 ? 'MODERATE' : 'INFO',
      title: `Threshed Yield Variance (${diffQty >= 0 ? '+' : ''}${diffQty} qtl)`,
      expectedValue: `${expectedQty} quintals`,
      actualValue: `${actuals.actualQuantityQuintals} quintals`,
      deltaFormatted: `${diffQty >= 0 ? '+' : ''}${diffQty} qtl`,
      financialImpactInr: impact,
      explanation: diffQty > 0
        ? `Plot yielded +${diffQty} qtl above estimate, generating +₹${impact.toLocaleString('en-IN')} extra revenue.`
        : `Harvested yield was ${Math.abs(diffQty)} qtl lower than visual estimate (₹${Math.abs(impact).toLocaleString('en-IN')} variance).`,
      isMaterialToDecision: false,
      timestamp: nowTime,
    });
  }

  // 3. Freight Surcharge Deviation
  if (actuals.actualFreightInr !== undefined && actuals.actualFreightInr !== plan.expectedFreightInr) {
    const diffFreight = actuals.actualFreightInr - plan.expectedFreightInr;
    const impact = -diffFreight; // higher freight reduces net realization
    cumulativeFinancialImpactInr += impact;

    deviations.push({
      id: 'DEV-FREIGHT',
      type: 'FREIGHT_SURGE',
      severity: diffFreight > 200 ? 'MODERATE' : 'INFO',
      title: `Transport Tariff Variance (${diffFreight >= 0 ? '+' : ''}₹${diffFreight})`,
      expectedValue: `₹${plan.expectedFreightInr}`,
      actualValue: `₹${actuals.actualFreightInr}`,
      deltaFormatted: `${diffFreight >= 0 ? '+' : ''}₹${diffFreight}`,
      financialImpactInr: impact,
      explanation: diffFreight > 0
        ? `Driver negotiated ₹${diffFreight} additional loading surcharge for Field 07 access road.`
        : `Secured ₹${Math.abs(diffFreight)} freight discount through return-load sharing.`,
      isMaterialToDecision: diffFreight > 400,
      timestamp: nowTime,
    });
  }

  // 4. Time Delay / Window Compression
  if (actuals.actualDispatchTimeHours !== undefined && actuals.plannedDispatchTimeHours !== undefined) {
    const delayHours = actuals.actualDispatchTimeHours - actuals.plannedDispatchTimeHours;
    if (delayHours > 1.5) {
      deviations.push({
        id: 'DEV-TIME-DELAY',
        type: 'TIME_DELAY',
        severity: delayHours > 3.0 ? 'MATERIAL' : 'MODERATE',
        title: `Harvest & Loading Delay (+${delayHours.toFixed(1)} hours)`,
        expectedValue: `${actuals.plannedDispatchTimeHours}:00 IST`,
        actualValue: `${actuals.actualDispatchTimeHours}:00 IST`,
        deltaFormatted: `+${delayHours.toFixed(1)}h Delay`,
        financialImpactInr: 0,
        explanation: `Departure delayed by ${delayHours.toFixed(1)} hours. Remaining clear harvest window before storm front compressed from 36h to ${Math.max(6, Math.round(36 - delayHours))}h.`,
        isMaterialToDecision: delayHours > 4.0,
        timestamp: nowTime,
      });

      if (delayHours > 4.0) {
        reassessmentRecommended = true;
        reassessmentReason = `Time delay of ${delayHours.toFixed(1)}h threatens field transit before storm arrival.`;
      }
    }
  }

  return {
    hasDeviations: deviations.length > 0,
    deviations,
    cumulativeFinancialImpactInr,
    reassessmentRecommended,
    reassessmentReason: reassessmentReason || undefined,
  };
}
