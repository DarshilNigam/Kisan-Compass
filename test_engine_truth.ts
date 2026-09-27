import { generateHarvestActionPlan, evaluateHarvestOptions } from './src/services/harvestOptimizer';
import { initialFarmState } from './src/data/seedFarmData';
import { FarmState } from './src/types';
import { validateExplanationGrounding } from './src/services/groundingValidator';

console.log('====================================================');
console.log('KISAN COMPASS — DETERMINISTIC ENGINE TRUTH TEST');
console.log('====================================================\n');

// 1. Test Quantity Scaling & Dynamic Crop Variation
console.log('TEST 1: Dynamic Quantity Scaling & Crop Adaptation');

const testCases = [
  { field: 'North Acre', crop: 'Wheat', yield: 43.6, acreage: 2.2 },
  { field: 'South Ridge', crop: 'Mustard', yield: 81.2, acreage: 4.1 },
  { field: 'Canal Basin', crop: 'Sugarcane', yield: 350.0, acreage: 7.0 },
];

for (const tc of testCases) {
  const customState: FarmState = {
    ...initialFarmState,
    fieldName: tc.field,
    crop: tc.crop,
    acreage: tc.acreage,
    cropYieldQuintals: tc.yield,
    estimatedHarvestQuintals: tc.yield,
  };

  const options = evaluateHarvestOptions(customState);
  const plan = generateHarvestActionPlan(options[0], customState);

  console.log(`\nScenario: ${tc.field} | ${tc.crop} | ${tc.yield} Quintals`);
  console.log(`- Immediate Action: ${plan.immediateAction}`);
  console.log(`- Destination Mandi: ${plan.destinationMandi}`);
  console.log(`- Target Window: ${plan.targetHarvestWindow}`);
  console.log(`- Expected Net Realization: ₹${plan.expectedNetRealization}`);

  // Checks
  if (!plan.immediateAction.includes(tc.field)) {
    throw new Error(`FAIL: Field ${tc.field} not dynamically included in immediateAction: ${plan.immediateAction}`);
  }
  if (!plan.immediateAction.includes(String(tc.yield))) {
    throw new Error(`FAIL: Yield ${tc.yield} not dynamically included in immediateAction: ${plan.immediateAction}`);
  }

  // Check forbidden claims in plan
  const planJson = JSON.stringify(plan).toLowerCase();
  const forbidden = ['doppler', 'chronos', 'openrouteservice', 'probe #04', 'lora station'];
  for (const f of forbidden) {
    if (planJson.includes(f)) {
      throw new Error(`FAIL: Forbidden claim "${f}" detected in generated plan!`);
    }
  }
}
console.log('\n[PASS] Dynamic quantity scaling and crop adaptation verified without hardcoding!');

// 2. Test Grounding Validator on Truthfulness
console.log('\nTEST 2: Grounding Validator Strict Enforcement');
const mockExplanation = {
  headline: 'CHRONOS PREDICTS HIGHER PRICES NEXT WEEK',
  summary: 'Hold harvest for 3 days to maximize net gain.',
  recommendationAction: 'WAIT_FOR_WINDOW',
  confidenceScore: 0.85,
  uncertaintyStatement: 'Live Chronos model projects rising mandi trends.',
  keyDrivers: [],
  counterFactual: '',
  riskMitigation: '',
};

const mockContext: any = {
  decision: {
    recommendation: 'WAIT 3 DAYS',
    expectedNetRealization: 75000,
    currentNetRealization: 72000,
    range: { p10: 70000, p50: 75000, p90: 78000 },
    deltaVsTodayInr: 3000,
    horizonDays: 3,
  },
  forecast: { source: 'BASELINE', modelName: 'Mandi Baseline', horizonDays: 3, p10Price: 2200, p50Price: 2350, p90Price: 2450, generatedAt: new Date().toISOString(), isFailed: false },
  farm: { crop: 'Wheat', fieldName: 'Field 07', acreage: 2.4, yieldQuintals: 48 },
  crop: { quantityQuintals: 48, areaAcres: 2.4, gddAccumulated: 1845, gddTarget: 1950, maturityPercent: 94.6 },
  weather: { condition: 'Rain', currentTemp: 28, precipitationProbability48h: 70, rainRiskLevel: 'HIGH', stormWindowDays: 2, status: 'OK', source: 'Open-Meteo' },
  market: { selectedMandi: 'Kanpur', grossPricePerQuintal: 2350, modalPrice: 2350, transportCostPerQuintal: 45, netRealizationPerQuintal: 2305, totalNetRealization: 75000, estimatedTransportCost: 2160, spoilageRiskPercent: 4.5, trend: 'STABLE', arrivalsQuintals: 1200, lastUpdated: '10m ago', distanceKm: 28 },
  farmer: { riskPreference: 'BALANCED', storageCapacityQuintals: 100, riskAversion: 0.65 },
};

const validationResult = validateExplanationGrounding(mockExplanation as any, mockContext as any);
console.log(`- Validator output valid: ${validationResult.isValid}`);
console.log(`- Violations caught: ${validationResult.errors.join('; ')}`);

if (validationResult.isValid) {
  throw new Error('FAIL: Validator failed to catch Chronos forbidden claim!');
}
if (!validationResult.errors.some(e => e.includes('Truthfulness violation'))) {
  throw new Error('FAIL: Truthfulness violation message not raised!');
}
console.log('[PASS] Grounding validator strictly forbids Chronos / neural claims!');

console.log('\n====================================================');
console.log('ALL DETERMINISTIC ENGINE TESTS PASSED WITH 100% TRUTH!');
console.log('====================================================');
