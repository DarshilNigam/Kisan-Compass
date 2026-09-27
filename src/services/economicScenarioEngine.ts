/**
 * Deterministic Economic Scenario Engine — KISAN COMPASS
 * 
 * Single Canonical Source of Truth for all financial outcomes:
 * - Option A (Sell now / Day 0)
 * - Option B (Wait 5 days / Day 5)
 * - Option C (Split harvest / Half & Half)
 * - Timing Comparison (Day 0, Day 2, Day 5, Day 7, Day 14)
 * - What-If counterfactual simulations
 * - Harvest Optimizer & Stress Test Laboratory
 * 
 * Hard Invariants:
 * 1. Option B.netTakeHome === TimingComparison(+5 days).netTakeHome (IDENTICAL object/path)
 * 2. Option A.netTakeHome === TimingComparison(Today).netTakeHome
 * 3. Option C consumes the exact same per-quintal price, freight, and penalty models.
 * 4. Strict unit safety: all outputs explicitly represent TOTAL TAKE-HOME (₹) for the active batch.
 */

import { FarmState } from '../types/farm';
import { ProbabilisticForecast, ForecastQuantile } from '../types/forecast';

export interface HarvestScenarioInput {
  daysFromNow: number;
  quantityQuintals?: number;
  basePricePerQuintal?: number;
  destinationMandi?: string;
  distanceKm?: number;
  transportCost?: number;
  rainProbability?: number;
  priceMultiplier?: number;
  freightMultiplier?: number;
  isSplitSecondLeg?: boolean;
}

export interface CanonicalHarvestScenario {
  id: string;
  label: string;
  desc: string;
  daysFromNow: number;
  harvestQuantity: number;
  grossRevenue: number;
  pricePerQuintal: number;
  freight: number;
  penalties: {
    weatherPenalty: number;
    spoilagePenalty: number;
    totalPenalties: number;
  };
  storageCost: number;
  otherCosts: number;
  netTakeHome: number;
  p10NetTakeHome: number;
  p90NetTakeHome: number;
  downsideExposure: number;
  riskFlags: string[];
  assumptions: string[];
  confidence: number;
  provenance: string;
  action: string;
}

export interface CanonicalSplitScenario {
  id: string;
  label: string;
  desc: string;
  totalQuantity: number;
  nowQuantity: number;
  laterQuantity: number;
  immediateScenario: CanonicalHarvestScenario;
  futureScenario: CanonicalHarvestScenario;
  splitFrictionCost: number;
  totalGrossRevenue: number;
  totalFreight: number;
  freight: number;
  totalPenalties: number;
  totalStorageCost: number;
  netTakeHome: number;
  p10NetTakeHome: number;
  p90NetTakeHome: number;
  downsideExposure: number;
  assumptions: string[];
  action: string;
}

export interface CanonicalEconomicSet {
  scenarioA: CanonicalHarvestScenario;
  scenarioB: CanonicalHarvestScenario;
  scenarioC: CanonicalSplitScenario;
  timingScenarios: CanonicalHarvestScenario[];
}

export interface ScenarioPerturbationOverrides {
  priceMultiplier?: number;
  freightMultiplier?: number;
  rainProbability?: number;
}

/**
 * Calculates a single deterministic harvest scenario for a given day horizon.
 */
export function calculateHarvestScenario(
  state: FarmState,
  input: HarvestScenarioInput,
  forecast?: ProbabilisticForecast | null
): CanonicalHarvestScenario {
  const daysFromNow = Math.max(0, input.daysFromNow);
  const totalFarmQuantityQtl = Math.max(1, state.estimatedHarvestQuintals > 0 ? state.estimatedHarvestQuintals : 25);
  const quantityQtl = Math.max(1, input.quantityQuintals ?? totalFarmQuantityQtl);

  const optimalMandi = state.market.destinations.find(d => d.isOptimal) || state.market.destinations[0];
  const mandiName = input.destinationMandi || optimalMandi?.name || 'Primary APMC Mandi';
  const distanceKm = input.distanceKm ?? (optimalMandi?.distanceKm ?? 28);

  // 1. Price Per Quintal with deterministic horizon drift
  const basePricePerQtl = input.basePricePerQuintal ?? (optimalMandi ? optimalMandi.grossPricePerQuintal : (state.market.modalPrice || 2380));
  
  let pricePerQtl: number;
  const fq: ForecastQuantile | undefined = forecast?.quantiles?.find(q => q.horizonDays === daysFromNow);
  
  if (fq && fq.p50Price > 0) {
    pricePerQtl = fq.p50Price;
  } else {
    // Deterministic drift: +₹6.5/qtl per day
    const drift = Math.round(daysFromNow * 6.5);
    pricePerQtl = basePricePerQtl + drift;
  }

  if (input.priceMultiplier && input.priceMultiplier > 0) {
    pricePerQtl = Math.round(pricePerQtl * input.priceMultiplier);
  }

  // 2. Gross Revenue (₹)
  const grossRevenue = Math.round(quantityQtl * pricePerQtl);

  // 3. Freight Cost (₹)
  const fullBatchFreight = optimalMandi?.estimatedTransportCost ?? Math.round(200 + distanceKm * 38 + totalFarmQuantityQtl * 12);
  let freightCost = Math.round(fullBatchFreight * (quantityQtl / totalFarmQuantityQtl));
  if (input.transportCost !== undefined) {
    freightCost = input.transportCost;
  } else if (input.freightMultiplier && input.freightMultiplier > 0) {
    freightCost = Math.round(freightCost * input.freightMultiplier);
  }

  // 4. Weather & Rain Risk
  let rainProbability = 12;
  if (input.rainProbability !== undefined) {
    rainProbability = input.rainProbability;
  } else if (fq) {
    rainProbability = fq.weatherDownsidePenalty > 0 ? (state.weather.rainfallProbability48h || 68) : (state.weather.rainfallProbability48h || 12);
  } else if (state.weather.forecast && state.weather.forecast.length > 0) {
    const forecastItem = state.weather.forecast[Math.min(daysFromNow, state.weather.forecast.length - 1)];
    rainProbability = forecastItem?.rainProbability ?? 12;
  } else {
    if (daysFromNow === 1) rainProbability = 25;
    else if (daysFromNow === 2) rainProbability = 68;
    else if (daysFromNow === 3) rainProbability = 72;
    else if (daysFromNow === 5) rainProbability = 58;
    else if (daysFromNow === 7) rainProbability = 15;
    else if (daysFromNow >= 10) rainProbability = 25;
  }

  // 5. Penalties (Weather dockage & field/storage degradation)
  let weatherPenalty = 0;
  if (daysFromNow === 0) {
    // Day 0: Sold immediately before approaching storm. Zero moisture penalty.
    weatherPenalty = 0;
  } else if (rainProbability > 40) {
    // Grain lodging & high moisture APMC dockage
    const baseWeatherPenalty = Math.round(grossRevenue * (rainProbability / 100) * 0.045);
    // If second leg of split is protected in storage, dockage risk is reduced by 50%
    weatherPenalty = input.isSplitSecondLeg ? Math.round(baseWeatherPenalty * 0.5) : baseWeatherPenalty;
  }

  const spoilagePenalty = Math.round(grossRevenue * (0.0035 * daysFromNow));

  // 6. Storage Costs (if applicable)
  const storageCost = input.isSplitSecondLeg ? Math.round(quantityQtl * 15) : 0;
  const otherCosts = 0;

  const totalPenalties = weatherPenalty + spoilagePenalty;

  // 7. Net Take-Home (₹) — Strict Unit Safety
  const netTakeHome = Math.max(0, Math.round(grossRevenue - freightCost - totalPenalties - storageCost - otherCosts));

  // 8. Quantile spread
  let p10NetTakeHome: number;
  let p90NetTakeHome: number;
  if (fq && fq.p50NetRealization > 0) {
    const p10Ratio = fq.p10NetRealization / fq.p50NetRealization;
    const p90Ratio = fq.p90NetRealization / fq.p50NetRealization;
    p10NetTakeHome = Math.round(netTakeHome * p10Ratio);
    p90NetTakeHome = Math.round(netTakeHome * p90Ratio);
  } else {
    p10NetTakeHome = Math.round(netTakeHome * 0.95);
    p90NetTakeHome = Math.round(netTakeHome * 1.04);
  }

  const downsideExposure = Math.max(0, netTakeHome - p10NetTakeHome);

  // 9. Meta, labels, and action attribution
  let label = `Day +${daysFromNow}`;
  let desc = 'Standard harvest';
  let action = 'Hold standing crop';

  if (daysFromNow === 0) {
    label = 'Today';
    desc = 'Sell before rain arrives';
    action = 'Sell now (Best choice)';
  } else if (daysFromNow === 2) {
    label = '+2 Days';
    desc = 'Rain arrives';
    action = 'Harvest risky';
  } else if (daysFromNow === 5) {
    label = '+5 Days';
    desc = 'Wet soil & dockage';
    action = 'Wait out rain';
  } else if (daysFromNow === 7) {
    label = '+7 Days';
    desc = 'Post-rain clearance';
    action = 'Delayed sale';
  } else if (daysFromNow === 14) {
    label = '+14 Days';
    desc = 'Overripe grain';
    action = 'Grain shatter loss';
  }

  const riskFlags: string[] = [];
  if (rainProbability > 50) riskFlags.push(`High rain risk (${rainProbability}%)`);
  if (spoilagePenalty > 500) riskFlags.push('Elevated field weathering loss');
  if (weatherPenalty > 1000) riskFlags.push('APMC moisture dockage penalty');

  const assumptions = [
    `${quantityQtl} quintals of ${state.crop || 'crop'}`,
    `₹${pricePerQtl}/qtl wholesale quote at ${mandiName}`,
    `₹${freightCost.toLocaleString('en-IN')} dedicated haulage (${distanceKm} km)`,
    weatherPenalty > 0 ? `₹${weatherPenalty.toLocaleString('en-IN')} rain hazard dockage` : 'Zero rain dockage',
  ];

  return {
    id: `SCENARIO-${daysFromNow}D-${quantityQtl}QTL`,
    label,
    desc,
    daysFromNow,
    harvestQuantity: quantityQtl,
    grossRevenue,
    pricePerQuintal: pricePerQtl,
    freight: freightCost,
    penalties: {
      weatherPenalty,
      spoilagePenalty,
      totalPenalties,
    },
    storageCost,
    otherCosts,
    netTakeHome,
    p10NetTakeHome,
    p90NetTakeHome,
    downsideExposure,
    riskFlags,
    assumptions,
    confidence: fq?.decisionConfidence ?? 0.92,
    provenance: 'ICAR-AGMARKNET Canonical Scenario Model',
    action,
  };
}

/**
 * Computes the unified, canonical set of economic scenarios for the active farm.
 * Option B IS timingScenarios[2] (+5 Days).
 * Option A IS timingScenarios[0] (Today).
 * Option C is the canonical 50/50 defensive split.
 */
export function computeCanonicalScenarios(
  state: FarmState,
  forecast?: ProbabilisticForecast | null,
  overrides?: ScenarioPerturbationOverrides
): CanonicalEconomicSet {
  const horizonDays = [0, 2, 5, 7, 14];

  // 1. Generate all timing scenarios from single canonical function
  const timingScenarios: CanonicalHarvestScenario[] = horizonDays.map((d) =>
    calculateHarvestScenario(
      state,
      {
        daysFromNow: d,
        priceMultiplier: overrides?.priceMultiplier,
        freightMultiplier: overrides?.freightMultiplier,
        rainProbability: overrides?.rainProbability,
      },
      forecast
    )
  );

  // 2. HARD INVARIANT: Option A IS timingScenarios[0] (Today)
  const scenarioA = timingScenarios[0];

  // 3. HARD INVARIANT: Option B IS timingScenarios[2] (+5 Days)
  const scenarioB = timingScenarios.find((s) => s.daysFromNow === 5) || timingScenarios[2];

  // 4. Option C: Split Harvest (Half now / Half later)
  const totalFarmQuantityQtl = Math.max(1, state.estimatedHarvestQuintals > 0 ? state.estimatedHarvestQuintals : 25);
  const nowQuantity = Math.round(totalFarmQuantityQtl / 2);
  const laterQuantity = totalFarmQuantityQtl - nowQuantity;

  const immediateLeg = calculateHarvestScenario(
    state,
    {
      daysFromNow: 0,
      quantityQuintals: nowQuantity,
      priceMultiplier: overrides?.priceMultiplier,
      freightMultiplier: overrides?.freightMultiplier,
      rainProbability: overrides?.rainProbability,
    },
    forecast
  );

  const futureLeg = calculateHarvestScenario(
    state,
    {
      daysFromNow: 5,
      quantityQuintals: laterQuantity,
      isSplitSecondLeg: true,
      priceMultiplier: overrides?.priceMultiplier,
      freightMultiplier: overrides?.freightMultiplier,
      rainProbability: overrides?.rainProbability,
    },
    forecast
  );

  // Split friction: multiple tractor dispatch & local godown staging
  const splitFrictionCost = Math.round(250 + laterQuantity * 8);
  const splitNet = Math.max(0, immediateLeg.netTakeHome + futureLeg.netTakeHome - splitFrictionCost);

  const totalGrossRevenue = immediateLeg.grossRevenue + futureLeg.grossRevenue;
  const totalFreight = immediateLeg.freight + futureLeg.freight;
  const totalPenalties = immediateLeg.penalties.totalPenalties + futureLeg.penalties.totalPenalties;
  const totalStorageCost = immediateLeg.storageCost + futureLeg.storageCost;

  const p10NetTakeHome = Math.round(splitNet * 0.95);
  const p90NetTakeHome = Math.round(splitNet * 1.04);
  const downsideExposure = Math.max(0, splitNet - p10NetTakeHome);

  const scenarioC: CanonicalSplitScenario = {
    id: `SCENARIO-SPLIT-${nowQuantity}-${laterQuantity}`,
    label: `Split harvest (${nowQuantity} qtl Now / ${laterQuantity} qtl Later)`,
    desc: `Harvest ${nowQuantity} quintals immediately; store ${laterQuantity} quintals for post-storm sale.`,
    totalQuantity: totalFarmQuantityQtl,
    nowQuantity,
    laterQuantity,
    immediateScenario: immediateLeg,
    futureScenario: futureLeg,
    splitFrictionCost,
    totalGrossRevenue,
    totalFreight,
    freight: totalFreight,
    totalPenalties,
    totalStorageCost,
    netTakeHome: splitNet,
    p10NetTakeHome,
    p90NetTakeHome,
    downsideExposure,
    assumptions: [
      `Immediate leg: ${nowQuantity} qtl at ₹${immediateLeg.pricePerQuintal}/qtl (Net: ₹${immediateLeg.netTakeHome.toLocaleString('en-IN')})`,
      `Deferred leg: ${laterQuantity} qtl stored for Day +5 at ₹${futureLeg.pricePerQuintal}/qtl (Net: ₹${futureLeg.netTakeHome.toLocaleString('en-IN')})`,
      `Split logistics & handling friction: ₹${splitFrictionCost.toLocaleString('en-IN')}`,
    ],
    action: 'Defensive split harvest',
  };

  return {
    scenarioA,
    scenarioB,
    scenarioC,
    timingScenarios,
  };
}
