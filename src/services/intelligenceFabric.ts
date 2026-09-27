import { 
  IntelligenceSnapshot, 
  SignalConflict, 
  SoilIntelligence 
} from '../types/intelligence';
import { fetchLiveWeather } from './weatherService';
import { fetchMarketIntelligence } from './marketService';
import { generateProbabilisticForecast } from './forecastService';



export interface CreateSnapshotOptions {
  weatherFail?: boolean;
  marketFail?: boolean;
  soilFail?: boolean;
  forecastFail?: boolean;
  lat?: number;
  lon?: number;
  cropName?: string;
  quantityQuintals?: number;
  soilProfile?: {
    source_type?: 'USER_PROVIDED' | 'REGIONAL_REFERENCE';
    soil_type?: string;
    ph?: number;
    nitrogen_level?: string;
    organic_carbon_pct?: number;
    lab_name?: string;
  } | null;
}

export async function createIntelligenceSnapshot(
  options: CreateSnapshotOptions = {}
): Promise<IntelligenceSnapshot> {
  const lat = options.lat ?? 26.5123;
  const lon = options.lon ?? 80.2452;
  const cropName = options.cropName ?? 'Wheat';
  const batchQuintals = options.quantityQuintals ?? 32;

  const [weatherSnap, marketSnap] = await Promise.all([
    fetchLiveWeather(lat, lon, options.weatherFail),
    fetchMarketIntelligence(batchQuintals, cropName, options.marketFail, lat, lon),
  ]);

  const isUserMeasured = options.soilProfile?.source_type === 'USER_PROVIDED';
  const soilSnap: SoilIntelligence = {
    moisturePercentage: 28.5,
    ph: options.soilProfile?.ph || 7.2,
    nitrogenKgHa: options.soilProfile?.nitrogen_level === 'HIGH' ? 240 : options.soilProfile?.nitrogen_level === 'LOW' ? 120 : 184,
    phosphorusKgHa: 26,
    potassiumKgHa: 215,
    organicCarbon: options.soilProfile?.organic_carbon_pct || 0.58,
    soilType: options.soilProfile?.soil_type || 'Indo-Gangetic Alluvial Sandy Loam',
    metadata: {
      status: isUserMeasured ? 'LIVE' : (options.soilFail ? 'ESTIMATED' : 'CACHED'),
      sourceName: isUserMeasured 
        ? `Farmer Soil Health Card (${options.soilProfile?.lab_name || 'Laboratory Tested'})`
        : 'ICAR Regional Reference Baseline (No In-Situ Sensor)',
      provider: isUserMeasured ? 'Farmer Lab Submission' : 'ICAR-IARI District Benchmark',
      endpoint: isUserMeasured ? 'farmer://soil-health-card' : 'regional://icar-soil-benchmark',
      fetchedAt: isUserMeasured ? 'Farmer Provided' : 'District Baseline',
      ageMinutes: 0,
      confidence: isUserMeasured ? 0.95 : (options.soilFail ? 0.60 : 0.78),
      usedBy: ['Biological Maturity Estimator', 'Harvest Traction Risk', 'Soil Nitrogen Diagnostics'],
      isFallback: !isUserMeasured,
      rawRecordCount: isUserMeasured ? 1 : 4,
      note: isUserMeasured 
        ? 'Verified laboratory soil analysis provided by farmer.'
        : 'Regional soil benchmark. No field sensor is connected to this parcel.',
    },
  };

  const optimalMandi = marketSnap.destinations.find(d => d.isOptimal) || marketSnap.destinations[0];
  // Generate probabilistic quantile forecast
  const forecastSnap = generateProbabilisticForecast({
    batchQuintals: batchQuintals > 0 ? batchQuintals : 1,
    currentModalPrice: marketSnap.modalPrice,
    weatherSnap,
    forceFail: options.forecastFail || options.marketFail,
    commodity: cropName,
    marketName: optimalMandi ? `${optimalMandi.name} (Optimal)` : undefined,
    transportCost: optimalMandi?.estimatedTransportCost,
  });

  // Signal conflict detection
  const conflicts: SignalConflict[] = [];

  // Check for weather storm risk vs mandi volatility conflict
  if (weatherSnap.rainRiskLevel === 'HIGH' || weatherSnap.rainRiskLevel === 'CRITICAL') {
    if (marketSnap.volatility === 'LOW') {
      conflicts.push({
        id: 'CNF-WTR-MKT-01',
        type: 'WEATHER_MODEL_DISAGREEMENT',
        sources: ['Open-Meteo / IMD Radar', 'AGMARKNET Daily Modal Quote'],
        values: {
          'Predicted Rain Risk (48h)': `${weatherSnap.precipitationProbability48h}% Thunderstorm`,
          'Mandi Spot Volatility': 'Low / Delayed Reaction',
        },
        severity: 'MEDIUM',
        explanation: 'Wholesale mandi quotes have not yet priced in the impending 68% probability thunderstorm. Early liquidation captures standard prices before regional distress selling.',
      });
    }
  }

  // Composite confidence weighting
  const weatherWeight = 0.35;
  const marketWeight = 0.30;
  const soilWeight = 0.15;
  const forecastWeight = 0.20;

  const overallConfidence = +(
    weatherSnap.metadata.confidence * weatherWeight +
    marketSnap.metadata.confidence * marketWeight +
    soilSnap.metadata.confidence * soilWeight +
    forecastSnap.confidence * forecastWeight
  ).toFixed(2);

  let fabricStatus: IntelligenceSnapshot['fabricStatus'] = 'OPTIMAL';
  if (options.weatherFail || options.marketFail || options.soilFail || options.forecastFail) {
    fabricStatus = 'DEGRADED';
  }

  return {
    timestamp: new Date().toISOString(),
    farmCoordinates: [lat, lon],
    weather: weatherSnap,
    market: marketSnap,
    soil: soilSnap,
    forecast: forecastSnap,
    activeConflicts: conflicts,
    overallConfidence,
    fabricStatus,
  };
}
