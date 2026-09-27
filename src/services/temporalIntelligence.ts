import { FarmState } from '../types/farm';
import { 
  FarmWatchState, 
  FarmEvent, 
  DecisionReassessmentRecord 
} from '../types/farmWatch';
import { 
  buildMonitoredSignals, 
  INITIAL_DEMO_EVENTS 
} from './eventDetectionEngine';
import { 
  generateDecisionReassessment, 
  evaluateActionPlanHealth 
} from './reassessmentEngine';

/**
 * Temporal Intelligence Engine for Stage 8 Farm Watch
 * Orchestrates continuous monitoring, event detection, materiality evaluation, and reassessment history.
 * Zero LLM speculation.
 */

export function createInitialFarmWatchState(state: FarmState): FarmWatchState {
  const monitoredSignals = buildMonitoredSignals(state, 'VALID');
  const planHealth = evaluateActionPlanHealth(state, false);

  return {
    watchId: `WATCH-${state.fieldId || 'FIELD-ACTIVE'}`,
    decisionId: state.currentDecision.id,
    status: 'WATCHING',
    startedAt: '08:00 IST',
    lastEvaluatedAt: 'Just now (12m latency)',
    monitoredSignals,
    recentEvents: INITIAL_DEMO_EVENTS,
    pendingReassessment: null,
    reassessmentHistory: [],
    actionPlanHealth: planHealth.health,
    actionPlanHealthReason: planHealth.reason,
  };
}

/**
 * Simulates a controlled decision-changing weather event for judge demonstration.
 * Marked explicitly as SIMULATED.
 */
export function simulateDecisionChangingEvent(
  currentState: FarmState,
  currentWatchState: FarmWatchState,
  targetRainProb: number = 37
): { updatedState: FarmState; updatedWatchState: FarmWatchState } {
  const previousRain = currentState.weather.rainfallProbability48h;

  const simulatedWeatherState: FarmState = {
    ...currentState,
    weather: {
      ...currentState.weather,
      rainfallProbability48h: targetRainProb,
      forecast: currentState.weather.forecast.map((f, i) => 
        i === 0 ? { ...f, rainProbability: targetRainProb, condition: 'Partly Cloudy' } : f
      ),
    },
  };

  const triggerEvent: FarmEvent = {
    eventId: `EVT-SIM-WTR-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
    origin: 'SIMULATED',
    signalType: 'WEATHER',
    title: 'Simulated Radar Weather Clearing',
    previousValue: `${previousRain}%`,
    currentValue: `${targetRainProb}%`,
    deltaFormatted: `${targetRainProb - previousRain}%`,
    unit: 'Rain Risk',
    severity: 'DECISION_CHANGING',
    materiality: 'DECISION_CHANGING',
    decisionImpact: `Rain hazard dropped below the 41% threshold. Diminished storm penalty makes WAIT 5 DAYS dominant.`,
    affectedDecisionId: currentState.currentDecision.id,
    evidenceNodeIds: ['NODE-SRC-WEATHER', 'NODE-OBS-RAIN', 'NODE-SIG-WEATHER-RISK'],
    dedupKey: `SIM_WEATHER_CLEARING_${targetRainProb}`,
    whyAlertSummary: `Radar scan detects front dissipating: Rain probability moved from ${previousRain}% to ${targetRainProb}%, crossing the decision boundary.`,
  };

  const reassessment = generateDecisionReassessment(triggerEvent, simulatedWeatherState, 'SIMULATED');
  const monitoredSignals = buildMonitoredSignals(simulatedWeatherState, 'AT_RISK');
  const planHealth = evaluateActionPlanHealth(simulatedWeatherState, true);

  const updatedWatchState: FarmWatchState = {
    ...currentWatchState,
    status: 'REASSESSMENT_REQUIRED',
    lastEvaluatedAt: 'Just now',
    monitoredSignals,
    recentEvents: [triggerEvent, ...currentWatchState.recentEvents],
    pendingReassessment: reassessment,
    actionPlanHealth: planHealth.health,
    actionPlanHealthReason: planHealth.reason,
  };

  return {
    updatedState: simulatedWeatherState,
    updatedWatchState,
  };
}

/**
 * Simulates a minor market noise event (+₹15/qtl) that does NOT trigger an alert.
 */
export function simulateMarketNoiseEvent(
  currentState: FarmState,
  currentWatchState: FarmWatchState,
  deltaInr: number = 15
): { updatedState: FarmState; updatedWatchState: FarmWatchState } {
  const previousPrice = currentState.market.modalPrice;
  const newPrice = previousPrice + deltaInr;

  const simulatedMarketState: FarmState = {
    ...currentState,
    market: {
      ...currentState.market,
      modalPrice: newPrice,
    },
  };

  const noiseEvent: FarmEvent = {
    eventId: `EVT-SIM-MKT-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
    origin: 'SIMULATED',
    signalType: 'MARKET',
    title: 'Minor Intra-day APMC Spot Fluctuation',
    previousValue: `₹${previousPrice}`,
    currentValue: `₹${newPrice}`,
    deltaFormatted: `+₹${deltaInr}/qtl`,
    unit: '₹/Qtl',
    severity: 'INFO',
    materiality: 'NOISE',
    decisionImpact: 'Change is below the +14.5% threshold. Zero impact on harvest timing recommendation.',
    affectedDecisionId: currentState.currentDecision.id,
    evidenceNodeIds: ['NODE-SRC-MARKET', 'NODE-OBS-PRICE'],
    dedupKey: `SIM_MARKET_NOISE_${Date.now()}`,
    whyAlertSummary: `Spot price changed by +₹${deltaInr}/qtl. Categorized as non-actionable market noise.`,
  };

  const monitoredSignals = buildMonitoredSignals(simulatedMarketState, currentWatchState.actionPlanHealth);

  const updatedWatchState: FarmWatchState = {
    ...currentWatchState,
    lastEvaluatedAt: 'Just now',
    monitoredSignals,
    recentEvents: [noiseEvent, ...currentWatchState.recentEvents],
  };

  return {
    updatedState: simulatedMarketState,
    updatedWatchState,
  };
}

/**
 * Resolves a pending decision reassessment with the farmer's explicit choice.
 */
export function resolveReassessment(
  watchState: FarmWatchState,
  reassessment: DecisionReassessmentRecord,
  farmerResponse: 'ACCEPTED_NEW' | 'KEPT_PREVIOUS' | 'DISMISSED'
): FarmWatchState {
  const resolvedRecord: DecisionReassessmentRecord = {
    ...reassessment,
    farmerResponse,
    respondedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
  };

  return {
    ...watchState,
    status: 'WATCHING',
    pendingReassessment: null,
    reassessmentHistory: [resolvedRecord, ...watchState.reassessmentHistory],
    actionPlanHealth: farmerResponse === 'ACCEPTED_NEW' ? 'VALID' : watchState.actionPlanHealth,
    actionPlanHealthReason: farmerResponse === 'ACCEPTED_NEW' 
      ? 'Farmer accepted updated decision plan.' 
      : 'Farmer maintained existing decision plan.',
  };
}
