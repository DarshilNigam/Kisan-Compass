export type CropStage = 
  | 'Vegetative' 
  | 'Tillering' 
  | 'Flowering' 
  | 'Grain Fill' 
  | 'Late maturity' 
  | 'Harvest Ready' 
  | 'Harvested';

export type TelemetryStatus = 
  | 'LIVE' 
  | 'FRESH' 
  | 'ESTIMATED' 
  | 'SIMULATED' 
  | 'CACHED' 
  | 'DEGRADED' 
  | 'OFFLINE';

export interface SoilSnapshot {
  moisturePercentage: number; // e.g., 28%
  ph: number;                 // e.g., 7.2
  nitrogenKgHa: number;       // e.g., 185
  phosphorusKgHa: number;     // e.g., 24
  potassiumKgHa: number;      // e.g., 210
  organicCarbon: number;      // e.g., 0.54%
  soilType: string;           // e.g., "Alluvial Sandy Loam"
  lastUpdated: string;
  source: string;
  telemetry: TelemetryStatus;
}

export interface WeatherPoint {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  rainProbability: number;
  precipitationMm: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rain' | 'Thunderstorm' | 'Overcast';
  windKmh: number;
  confidence: number;
}

export interface WeatherData {
  currentTemp: number;
  currentHumidity: number;
  rainfallProbability48h: number;
  rainRiskWindowDays: number;
  forecast: WeatherPoint[];
  lastUpdated: string;
  source: string;
  telemetry: TelemetryStatus;
}

export interface MandiDestination {
  id: string;
  name: string;
  district: string;
  distanceKm: number;
  transitHours: number;
  grossPricePerQuintal: number;
  estimatedTransportCost: number; // in ₹
  spoilageRiskPercent: number;    // % reduction due to transit time
  netRealizationPerQuintal: number;// ₹
  totalNetRealization: number;    // ₹ for total quantity
  isOptimal: boolean;
  arrivalWindow: string;
  tradeVolumeQuintals: number;
}

export interface SimulationStep {
  dayOffset: number;
  date: string;
  expectedPrice: number;
  p10Price: number;
  p90Price: number;
  rainRisk: number;
  storageDegradationCost: number;
  netRealizationExpected: number;
  netRealizationP10: number;
  netRealizationP90: number;
  recommendationAction: 'SELL NOW' | 'HOLD (2-3 DAYS)' | 'HOLD (4-7 DAYS)' | 'IMMEDIATE HARVEST';
}

export interface DecisionFactor {
  name: string;
  weight: number; // 0 to 1
  impact: 'POSITIVE' | 'NEUTRAL' | 'RISK';
  valueText: string;
  confidence: number; // 0 to 1
  sourceTelemetry: TelemetryStatus;
}

export interface DecisionRecord {
  id: string;
  fieldId: string;
  timestamp: string;
  title: string;
  action: 'SELL NOW' | 'WAIT 3 DAYS' | 'SPLIT HARVEST' | 'IRRIGATE' | 'TREAT FIELD';
  primaryRecommendation: string;
  confidence: number; // 0.0 - 1.0
  expectedFinancials: {
    expectedValueInr: number;
    rangeMinInr: number;
    rangeMaxInr: number;
  };
  reasoningFactors: DecisionFactor[];
  farmerAction?: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  rejectionReason?: 'TOO_RISKY' | 'NEED_IMMEDIATE_CASH' | 'DISAGREE_WEATHER' | 'BETTER_LOCAL_PRICE' | 'STORAGE_UNAVAILABLE' | 'OTHER' | 'SKIP';
  preferenceDeltaApplied?: string;
}

export interface PreferenceProfile {
  riskAversion: number;        // 0 (Aggressive) to 1 (Conservative)
  storageTrust: number;        // 0 to 1
  cashUrgency: number;         // 0 to 1
  weatherSensitivity: number;  // 0 to 1
  lastAdjustedDecisionId?: string;
  adjustmentSummary?: string;
}

export interface FarmState {
  farmId: string;
  farmerName: string;
  fieldId: string;
  fieldName: string;
  crop: string;
  variety: string;
  areaAcres: number;
  estimatedHarvestQuintals: number;
  cropStage: CropStage;
  gddAccumulated: number; // Growing Degree Days
  gddTarget: number;
  sowingDate: string;
  estimatedHarvestWindow: {
    start: string;
    optimal: string;
    deadline: string;
  };
  location: {
    village: string;
    block: string;
    district: string;
    state: string;
    coordinates: [number, number]; // [lat, lon]
  };
  soil: SoilSnapshot;
  weather: WeatherData;
  market: {
    modalPrice: number;
    priceTrend7d: 'RISING' | 'STABLE' | 'FALLING';
    volatility: 'LOW' | 'MEDIUM' | 'HIGH';
    destinations: MandiDestination[];
    telemetry: TelemetryStatus;
  };
  preferences: PreferenceProfile;
  currentDecision: DecisionRecord;
  decisionHistory: DecisionRecord[];
  activeScenarioSimulation: SimulationStep[];
  systemStatus: {
    weatherApiOnline: boolean;
    marketFeedOnline: boolean;
    soilCatalogOnline: boolean;
    routingServiceOnline: boolean;
    forecastEngineOnline: boolean;
    explanationEngineOnline: boolean;
    lastHeartbeat: string;
  };
}
