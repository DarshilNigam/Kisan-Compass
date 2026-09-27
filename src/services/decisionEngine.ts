import { 
  ProbabilisticForecast, 
  StructuredDecisionExplanation 
} from '../types/forecast';
import { PreferenceProfile } from '../types/farm';

export interface DecisionAttributionContext {
  batchQuintals?: number;
  destinationMandi?: string;
  distanceKm?: number;
}

export function computeDecisionExplanation(
  forecast: ProbabilisticForecast,
  selectedDayOffset: number,
  preferences: PreferenceProfile,
  context?: DecisionAttributionContext
): StructuredDecisionExplanation {
  const currentToday = forecast.quantiles[0] || forecast.quantiles[0];
  const selectedStep = forecast.quantiles.find(q => q.horizonDays === selectedDayOffset) || forecast.quantiles[selectedDayOffset] || currentToday;

  const deltaVsToday = selectedStep.p50NetRealization - currentToday.p50NetRealization;

  // Calculate downside spread widening (P50 - P10)
  const todaySpread = currentToday.p50NetRealization - currentToday.p10NetRealization;
  const targetSpread = selectedStep.p50NetRealization - selectedStep.p10NetRealization;
  const downsideExposureChangePercent = todaySpread > 0 
    ? Math.round(((targetSpread - todaySpread) / todaySpread) * 100)
    : 0;

  // Financial attribution drivers
  const quintals = context?.batchQuintals ?? (currentToday.expectedGrossValue > 0 && currentToday.p50Price > 0 ? Math.round(currentToday.expectedGrossValue / currentToday.p50Price) : 32);
  const marketGrossDiff = (selectedStep.p50Price - currentToday.p50Price) * quintals;
  const weatherPenalty = selectedStep.weatherDownsidePenalty;
  const spoilagePenalty = selectedStep.spoilageExposurePenalty;
  const transportFriction = selectedStep.transportCost;

  const destName = context?.destinationMandi || forecast.market || 'Optimal Mandi';
  const distStr = context?.distanceKm ? ` (${context.distanceKm} km)` : '';

  const drivers: StructuredDecisionExplanation['drivers'] = [
    {
      factor: 'MARKET_FORECAST',
      name: 'Mandi Wholesale Price Drift',
      impact: marketGrossDiff >= 0 ? 'positive' : 'negative',
      deltaInr: marketGrossDiff,
      detail: marketGrossDiff >= 0
        ? `+₹${marketGrossDiff.toLocaleString('en-IN')} (+₹${selectedStep.p50Price - currentToday.p50Price}/qtl modal quote drift across ${quintals} qtl)`
        : `-₹${Math.abs(marketGrossDiff).toLocaleString('en-IN')} quote softening across ${quintals} qtl`,
    },
    {
      factor: 'WEATHER_RISK',
      name: 'Severe Weather Inversion Penalty',
      impact: weatherPenalty > 0 ? 'negative' : 'neutral',
      deltaInr: -weatherPenalty,
      detail: weatherPenalty > 0 
        ? `-₹${weatherPenalty.toLocaleString('en-IN')} rain hazard discount (standing crop moisture risk)`
        : '₹0 minimal atmospheric penalty',
    },
    {
      factor: 'SPOILAGE_EXPOSURE',
      name: 'Field & Storage Degradation',
      impact: spoilagePenalty > 0 ? 'negative' : 'neutral',
      deltaInr: -spoilagePenalty,
      detail: `-₹${spoilagePenalty.toLocaleString('en-IN')} physiological weathering over ${selectedStep.horizonDays} days`,
    },
    {
      factor: 'TRANSPORT_FRICTION',
      name: 'Road Freight Deduction',
      impact: 'negative',
      deltaInr: -transportFriction,
      detail: `-₹${transportFriction.toLocaleString('en-IN')} dedicated transport freight to ${destName}${distStr}`,
    },
    {
      factor: 'FARMER_PREFERENCE',
      name: 'Farmer Risk Tolerance Weighting',
      impact: preferences.riskAversion > 0.6 ? 'negative' : 'positive',
      deltaInr: 0,
      detail: `Learned preference: Risk Aversion at ${(preferences.riskAversion * 100).toFixed(0)}% (${
        preferences.riskAversion > 0.65 ? 'Conservative: penalizes delay' : 'Aggressive: tolerates volatility'
      })`,
    },
  ];

  let recommendation: StructuredDecisionExplanation['recommendation'] = 'SELL NOW';
  if (selectedStep.horizonDays === 0 || selectedStep.horizonDays === 1) {
    recommendation = 'SELL NOW';
  } else if (selectedStep.horizonDays === 2 || selectedStep.horizonDays === 3) {
    recommendation = 'HOLD';
  } else if (selectedStep.horizonDays === 5) {
    recommendation = 'WAIT 5 DAYS';
  } else {
    recommendation = 'HOLD';
  }

  return {
    recommendation,
    horizonDays: selectedStep.horizonDays,
    expectedNetRealization: selectedStep.p50NetRealization,
    range: {
      p10: selectedStep.p10NetRealization,
      p50: selectedStep.p50NetRealization,
      p90: selectedStep.p90NetRealization,
    },
    deltaVsTodayInr: deltaVsToday,
    downsideExposureChangePercent,
    drivers,
    uncertainty: forecast.uncertainty,
  };
}
