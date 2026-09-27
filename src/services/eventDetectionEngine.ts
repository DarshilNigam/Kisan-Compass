import { FarmState } from '../types/farm';
import { 
  FarmEvent, 
  EventOrigin, 
  MonitoredSignalItem, 
  ActionPlanHealth 
} from '../types/farmWatch';
import { 
  evaluateWeatherMateriality, 
  evaluateMarketMateriality, 
  SENSITIVITY_BOUNDARIES 
} from './materialityEngine';

/**
 * Deterministic Event Detection Engine for Stage 8 Farm Watch
 * Generates structured farm events, classifies severity, and deduplicates repeated signals.
 * Zero LLM hallucination.
 */

export const INITIAL_DEMO_EVENTS: FarmEvent[] = [
  {
    eventId: 'EVT-DEMO-01',
    timestamp: '12:44 IST',
    origin: 'DEMO',
    signalType: 'WEATHER',
    title: 'IMD Doppler Radar Convective Alert',
    previousValue: '56%',
    currentValue: '68%',
    deltaFormatted: '+12%',
    unit: 'Rain Probability',
    severity: 'WATCH',
    materiality: 'MATERIAL',
    decisionImpact: 'Downside storm risk increased from ₹3,100 to ₹3,838. Reinforced SELL NOW dominance.',
    affectedDecisionId: 'DEC-01',
    evidenceNodeIds: ['NODE-SRC-WEATHER', 'NODE-OBS-RAIN', 'NODE-SIG-WEATHER-RISK'],
    dedupKey: 'WEATHER_CONVECTIVE_ALERT',
    whyAlertSummary: 'Thunderstorm probability increased by +12% on radar scan, approaching maximum field risk threshold.',
  },
  {
    eventId: 'EVT-DEMO-02',
    timestamp: '13:58 IST',
    origin: 'DEMO',
    signalType: 'MARKET',
    title: 'Unnao Mandi Afternoon Clearing Session',
    previousValue: '₹2,345',
    currentValue: '₹2,380',
    deltaFormatted: '+₹35/qtl',
    unit: '₹/Qtl',
    severity: 'INFO',
    materiality: 'INFO',
    decisionImpact: 'Net realization at Unnao improved by +₹1,120 total. Below the +14.5% flip threshold.',
    affectedDecisionId: 'DEC-01',
    evidenceNodeIds: ['NODE-SRC-MARKET', 'NODE-OBS-PRICE', 'NODE-SIG-MARKET-OPP'],
    dedupKey: 'MARKET_UNNAO_CLEARING',
    whyAlertSummary: 'Modal spot price rose by +₹35/qtl, widening Unnao arbitrage advantage without flipping harvest window.',
  },
  {
    eventId: 'EVT-DEMO-03',
    timestamp: '14:32 IST',
    origin: 'DEMO',
    signalType: 'SOURCE_HEALTH',
    title: 'Telemetry Cycle & Multi-Model Ingestion',
    previousValue: '18m old',
    currentValue: '12m old',
    deltaFormatted: 'Synchronized',
    unit: 'Data Freshness',
    severity: 'INFO',
    materiality: 'NOISE',
    decisionImpact: 'All 5 critical telemetry streams synchronized. Decision confidence remains MODERATE.',
    affectedDecisionId: 'DEC-01',
    evidenceNodeIds: ['NODE-SRC-WEATHER', 'NODE-SRC-MARKET'],
    dedupKey: 'TELEMETRY_SYNC_CYCLE',
    whyAlertSummary: 'Routine telemetry polling cycle completed within freshness window.',
  },
];

/**
 * Builds the live monitored signals list with sensitivity regions.
 */
export function buildMonitoredSignals(
  state: FarmState,
  actionPlanHealth: ActionPlanHealth = 'VALID'
): MonitoredSignalItem[] {
  const rainProb = state.weather.rainfallProbability48h || 68;
  const modalPrice = state.market.modalPrice || 2380;
  const freight = 1340;
  const gdd = 1845;
  const targetGdd = 1950;
  const maturityPct = +(gdd / targetGdd * 100).toFixed(1);

  return [
    {
      id: 'SIG-WATCH-WEATHER',
      name: 'Thunderstorm Precipitation Hazard',
      category: 'WEATHER',
      currentValue: `${rainProb}% Rain Risk`,
      baselineValue: '68% (Thunderstorm Mar 28)',
      sensitivityRegion: `Flip to WAIT if ≤${SENSITIVITY_BOUNDARIES.rainWaitThreshold}%`,
      isDecisionSensitive: true,
      lastShiftText: rainProb < 45 ? 'DIMINISHED HAZARD' : 'SEVERE CONVECTIVE THREAT',
      status: rainProb <= SENSITIVITY_BOUNDARIES.rainWaitThreshold ? 'TRIGGERED' : rainProb <= 50 ? 'APPROACHING_TRIGGER' : 'NORMAL',
    },
    {
      id: 'SIG-WATCH-MARKET',
      name: 'Unnao Mandi APMC Spot Price',
      category: 'MARKET',
      currentValue: `₹${modalPrice} / Qtl`,
      baselineValue: '₹2,380 / Qtl (Wholesale)',
      sensitivityRegion: 'Flip to WAIT if ≥₹2,725 (+14.5%)',
      isDecisionSensitive: true,
      lastShiftText: modalPrice >= 2700 ? 'PREMIUM SURGE' : 'STABLE WHOLESALE',
      status: modalPrice >= 2725 ? 'TRIGGERED' : modalPrice >= 2500 ? 'APPROACHING_TRIGGER' : 'NORMAL',
    },
    {
      id: 'SIG-WATCH-LOGISTICS',
      name: 'Dedicated Haulage Tariff (28 km)',
      category: 'LOGISTICS',
      currentValue: `₹${freight}`,
      baselineValue: '₹1,340 (Dedicated Tractor)',
      sensitivityRegion: 'Switch to Kanpur if ≥₹1,943 (+45%)',
      isDecisionSensitive: false,
      lastShiftText: freight >= 1800 ? 'RURAL FREIGHT SURCHARGE' : 'STANDARD TARIFF',
      status: freight >= 1943 ? 'TRIGGERED' : 'NORMAL',
    },
    {
      id: 'SIG-WATCH-MATURITY',
      name: 'Wheat HD-2967 Biological GDD',
      category: 'MATURITY',
      currentValue: `${maturityPct}% Mature`,
      baselineValue: '1,845 / 1,950 GDD Target',
      sensitivityRegion: 'Physiologically mature at 90%',
      isDecisionSensitive: false,
      lastShiftText: 'COMMERCIALLY HARVEST READY',
      status: actionPlanHealth === 'COMPLETED' ? 'NORMAL' : 'NORMAL',
    },
  ];
}

/**
 * Evaluates live farm state vs baseline state and returns detected farm events.
 */
export function detectFarmEvents(
  baselineState: FarmState,
  currentState: FarmState,
  currentEvents: FarmEvent[] = [],
  origin: EventOrigin = 'LIVE'
): { newEvents: FarmEvent[]; isDecisionChanging: boolean } {
  const generatedEvents: FarmEvent[] = [];
  let isDecisionChanging = false;

  // 1. Weather Event Detection
  const baseRain = baselineState.weather.rainfallProbability48h;
  const currentRain = currentState.weather.rainfallProbability48h;
  if (baseRain !== currentRain) {
    const weatherMat = evaluateWeatherMateriality(baseRain, currentRain, currentState.currentDecision.action);
    if (weatherMat.classification !== 'NOISE') {
      const weatherEvt: FarmEvent = {
        eventId: `EVT-WTR-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        origin,
        signalType: 'WEATHER',
        title: weatherMat.isDecisionChanging ? 'Weather Regime Shift (Decision Impacting)' : 'Radar Storm Probability Update',
        previousValue: `${baseRain}%`,
        currentValue: `${currentRain}%`,
        deltaFormatted: `${currentRain - baseRain >= 0 ? '+' : ''}${currentRain - baseRain}%`,
        unit: 'Rain Risk',
        severity: weatherMat.severity,
        materiality: weatherMat.classification,
        decisionImpact: weatherMat.impactExplanation,
        affectedDecisionId: currentState.currentDecision.id,
        evidenceNodeIds: ['NODE-SRC-WEATHER', 'NODE-OBS-RAIN', 'NODE-SIG-WEATHER-RISK'],
        dedupKey: `WEATHER_SHIFT_${Math.round(currentRain / 10) * 10}`,
        whyAlertSummary: weatherMat.impactExplanation,
      };

      if (weatherMat.isDecisionChanging) isDecisionChanging = true;
      generatedEvents.push(weatherEvt);
    }
  }

  // 2. Market Event Detection
  const basePrice = baselineState.market.modalPrice;
  const currentPrice = currentState.market.modalPrice;
  if (basePrice !== currentPrice) {
    const marketMat = evaluateMarketMateriality(basePrice, currentPrice);
    if (marketMat.classification !== 'NOISE') {
      const marketEvt: FarmEvent = {
        eventId: `EVT-MKT-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        origin,
        signalType: 'MARKET',
        title: marketMat.isDecisionChanging ? 'Market Price Surge (Threshold Breach)' : 'APMC Mandi Price Update',
        previousValue: `₹${basePrice}`,
        currentValue: `₹${currentPrice}`,
        deltaFormatted: `${currentPrice - basePrice >= 0 ? '+' : ''}₹${currentPrice - basePrice}/qtl`,
        unit: '₹/Qtl',
        severity: marketMat.severity,
        materiality: marketMat.classification,
        decisionImpact: marketMat.impactExplanation,
        affectedDecisionId: currentState.currentDecision.id,
        evidenceNodeIds: ['NODE-SRC-MARKET', 'NODE-OBS-PRICE', 'NODE-SIG-MARKET-OPP'],
        dedupKey: `MARKET_SHIFT_${Math.round(currentPrice / 50) * 50}`,
        whyAlertSummary: marketMat.impactExplanation,
      };

      if (marketMat.isDecisionChanging) isDecisionChanging = true;
      generatedEvents.push(marketEvt);
    }
  }

  // 3. Deduplication against existing events
  const deduplicatedNewEvents = generatedEvents.filter(newEvent => {
    const existing = currentEvents.find(e => e.dedupKey === newEvent.dedupKey);
    return !existing;
  });

  return {
    newEvents: deduplicatedNewEvents,
    isDecisionChanging,
  };
}
