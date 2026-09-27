import { FarmState } from '../types/farm';
import { DecisionGradeConflict } from '../types/stressTest';

/**
 * Deterministic Decision-Grade Conflict Engine
 * Identifies and reconciles contradictions between weather, market price, maturity, and logistics.
 */
export function evaluateDecisionConflicts(state: FarmState): DecisionGradeConflict[] {
  const conflicts: DecisionGradeConflict[] = [];

  // 1. Weather vs Market Conflict
  const rainRisk = state.weather.rainfallProbability48h;
  const mandiPrice = state.market.modalPrice;

  if (rainRisk >= 50 && mandiPrice >= 2350) {
    conflicts.push({
      id: 'CONF-WEATHER-MARKET-01',
      category: 'WEATHER_VS_MARKET',
      title: 'Thunderstorm Threat vs Elevated Spot Price',
      signalA: {
        name: 'Weather Signal (Open-Meteo Ensemble)',
        value: `${rainRisk}% rain risk / 14.5mm thunderstorm in 48h`,
        favorsAction: 'SELL NOW (Immediate Harvest)',
      },
      signalB: {
        name: 'Market Signal (AGMARKNET Modal Quote)',
        value: `₹${mandiPrice}/qtl wholesale quote (+₹40 price drift)`,
        favorsAction: 'WAIT 5 DAYS (Hold for Upside)',
      },
      currentDecisionTradeoff: `Weather downside hazard (-₹4,800 lodging and moisture discount) currently outweighs the +₹1,280 expected price drift.`,
      dominatingFactor: 'Weather Downside Risk',
      severity: 'HIGH',
    });
  }

  // 2. Maturity vs Weather Conflict
  const gddRatio = (state.gddAccumulated / (state.gddTarget || 1950)) * 100;
  if (gddRatio >= 90 && state.weather.rainRiskWindowDays <= 3) {
    conflicts.push({
      id: 'CONF-MATURITY-WEATHER-02',
      category: 'MATURITY_VS_WEATHER',
      title: 'Biological Maturity Peak vs Approaching Storm Window',
      signalA: {
        name: 'Crop Maturity (GDD & Moisture Sensor)',
        value: `1,845 / 1,950 GDD (${gddRatio.toFixed(1)}% mature, 13.8% moisture)`,
        favorsAction: 'HARVEST NOW (Biologically Ready)',
      },
      signalB: {
        name: 'Atmospheric Radar (Rain Window)',
        value: `Storm front window closes in ${state.weather.rainRiskWindowDays} days`,
        favorsAction: 'MOBILIZE COMBINE IMMEDIATELY',
      },
      currentDecisionTradeoff: `Crop is physiologically mature; delaying incurs pure risk without biological grain fill benefit.`,
      dominatingFactor: 'Physiological Maturity + Weather Convergence',
      severity: 'MEDIUM',
    });
  }

  // 3. Price vs Logistics Conflict
  const unnaoMandi = state.market.destinations.find(d => d.name.includes('Unnao')) || state.market.destinations[0];
  const closerMandi = state.market.destinations.find(d => d.distanceKm < 20) || state.market.destinations[1];

  if (unnaoMandi && closerMandi && unnaoMandi.grossPricePerQuintal > closerMandi.grossPricePerQuintal) {
    const netDiff = unnaoMandi.totalNetRealization - closerMandi.totalNetRealization;
    conflicts.push({
      id: 'CONF-PRICE-LOGISTICS-03',
      category: 'PRICE_VS_LOGISTICS',
      title: 'Higher Distant Price vs Closer Mandi Lower Freight',
      signalA: {
        name: `Distant APMC (${unnaoMandi.name}, ${unnaoMandi.distanceKm} km)`,
        value: `₹${unnaoMandi.grossPricePerQuintal}/qtl (₹${unnaoMandi.estimatedTransportCost} freight)`,
        favorsAction: `Route to ${unnaoMandi.name} (₹${unnaoMandi.totalNetRealization.toLocaleString('en-IN')} Net)`,
      },
      signalB: {
        name: `Closer Yard (${closerMandi.name}, ${closerMandi.distanceKm} km)`,
        value: `₹${closerMandi.grossPricePerQuintal}/qtl (₹${closerMandi.estimatedTransportCost} freight)`,
        favorsAction: `Route to ${closerMandi.name} (₹${closerMandi.totalNetRealization.toLocaleString('en-IN')} Net)`,
      },
      currentDecisionTradeoff: `${unnaoMandi.name} delivers +₹${netDiff.toLocaleString('en-IN')} higher net cash in hand after deducting ₹${unnaoMandi.estimatedTransportCost} rural road transport.`,
      dominatingFactor: 'Net Realization Arbitrage',
      severity: 'LOW',
    });
  }

  return conflicts;
}
