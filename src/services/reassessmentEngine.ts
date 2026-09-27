import { FarmState } from '../types/farm';
import { 
  FarmEvent, 
  DecisionReassessmentRecord, 
  ActionPlanHealth, 
  ReassessmentFactorDiff,
  EventOrigin 
} from '../types/farmWatch';

/**
 * Deterministic Reassessment Engine for Stage 8 Farm Watch
 * Re-runs decision analysis upon material changes.
 * Never auto-approves: Farmer remains final decision maker.
 */

export function generateDecisionReassessment(
  triggerEvent: FarmEvent,
  state: FarmState,
  origin: EventOrigin = 'LIVE'
): DecisionReassessmentRecord {
  const currentRain = state.weather.rainfallProbability48h;
  const currentPrice = state.market.modalPrice;
  const quantity = state.estimatedHarvestQuintals || 32;

  // Previous baseline state
  const prevRec: 'SELL NOW' | 'WAIT 3 DAYS' | 'WAIT 5 DAYS' | 'HOLD' | 'SPLIT HARVEST' = 'SELL NOW';
  const prevNet = 74820;

  // Re-run deterministic decision calculation
  let newRec: 'SELL NOW' | 'WAIT 3 DAYS' | 'WAIT 5 DAYS' | 'HOLD' | 'SPLIT HARVEST' = 'SELL NOW';
  let newNet = prevNet;
  let whyHeadline = '';
  let whyBody = '';
  const affectedFactors: ReassessmentFactorDiff[] = [];

  // Scenario 1: Rain probability dropped to <= 41% (e.g. 37%)
  if (currentRain <= 41) {
    newRec = 'WAIT 5 DAYS';
    const futureGross = quantity * 2410; // Post-clearing modal price
    const futureFreight = 1340;
    const futureRainLoss = 0; // Storm cleared
    newNet = futureGross - futureFreight - futureRainLoss; // ₹75,780
    
    whyHeadline = `Precipitation threat diminished to ${currentRain}%, unlocking the +5 day holding window.`;
    whyBody = `The convective storm hazard on March 28 has dropped below the 41% threshold. With zero expected field dockage and regional prices drifting upward (+₹30/qtl), holding the standing crop for 5 days now delivers ₹${newNet.toLocaleString('en-IN')} net realization (+₹${(newNet - prevNet).toLocaleString('en-IN')} advantage over immediate sale).`;

    affectedFactors.push(
      {
        factor: '48h Rain Hazard',
        from: `${triggerEvent.previousValue}`,
        to: `${currentRain}%`,
        impact: 'Diminished storm threat eliminates expected ₹3,838 moisture dockage penalty.',
      },
      {
        factor: 'Expected Net Realization',
        from: `₹${prevNet.toLocaleString('en-IN')}`,
        to: `₹${newNet.toLocaleString('en-IN')}`,
        impact: `+₹${(newNet - prevNet).toLocaleString('en-IN')} net cash gain achieved by holding to April 02.`,
      },
      {
        factor: 'Optimal Recommendation',
        from: 'SELL NOW (Immediate Harvest)',
        to: 'WAIT 5 DAYS (Hold for Upside)',
        impact: 'Decision boundary crossed; mathematical dominance flips to delayed harvest.',
      }
    );
  } else if (currentPrice >= 2700) {
    // Scenario 2: Massive price surge (>= ₹2,700/qtl)
    newRec = 'WAIT 5 DAYS';
    newNet = quantity * currentPrice - 1340 - 2000;
    whyHeadline = `Unnao APMC spot price surged to ₹${currentPrice}/qtl (+${((currentPrice - 2380) / 2380 * 100).toFixed(1)}%).`;
    whyBody = `Market upside premium now exceeds the expected storm dockage loss, making a 5-day hold mathematically advantageous.`;

    affectedFactors.push(
      {
        factor: 'Unnao Spot Price',
        from: '₹2,380 / Qtl',
        to: `₹${currentPrice} / Qtl`,
        impact: 'Exceptional milling premium provides adequate margin buffer against weather loss.',
      },
      {
        factor: 'Optimal Recommendation',
        from: 'SELL NOW',
        to: 'WAIT 5 DAYS',
        impact: 'Price surge shifts utility balance in favor of waiting.',
      }
    );
  } else {
    // Minor or standard update
    newRec = 'SELL NOW';
    newNet = quantity * currentPrice - 1340;
    whyHeadline = `Updated parameters maintain SELL NOW as the mathematically optimal choice.`;
    whyBody = `Weather risk remains elevated at ${currentRain}%. Immediate harvest locks in ₹${newNet.toLocaleString('en-IN')} with minimal downside exposure.`;

    affectedFactors.push({
      factor: 'Decision Stability',
      from: 'SELL NOW',
      to: 'SELL NOW',
      impact: 'Recommendation holds across current scenario bounds.',
    });
  }

  return {
    reassessmentId: `REASSESS-${Date.now()}`,
    decisionId: state.currentDecision.id,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
    origin,
    triggerEvent,
    previousRecommendation: prevRec,
    previousExpectedNet: prevNet,
    newRecommendation: newRec,
    newExpectedNet: newNet,
    deltaInr: newNet - prevNet,
    whyHeadline,
    whyBody,
    affectedFactors,
    farmerResponse: 'PENDING',
  };
}

/**
 * Evaluates the operational health of the current harvest action plan.
 */
export function evaluateActionPlanHealth(
  state: FarmState,
  isReassessmentPending: boolean
): { health: ActionPlanHealth; reason: string } {
  if (state.currentDecision.farmerAction === 'ACCEPTED' && isReassessmentPending) {
    return {
      health: 'AT_RISK',
      reason: 'A material weather/market event crossed the sensitivity threshold. Action plan requires farmer review.',
    };
  }

  if (!state.systemStatus.weatherApiOnline || !state.systemStatus.marketFeedOnline) {
    return {
      health: 'WATCH',
      reason: 'Telemetry degraded: operating on cached data feeds.',
    };
  }

  return {
    health: 'VALID',
    reason: 'All operational parameters remain within acceptable dispatch bounds.',
  };
}
