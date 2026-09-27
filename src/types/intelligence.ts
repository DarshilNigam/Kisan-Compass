import { TelemetryStatus } from './farm';

export interface SourceMetadata {
  status: TelemetryStatus;
  sourceName: string;
  provider: string;
  endpoint?: string;
  fetchedAt: string;
  ageMinutes: number;
  confidence: number; // 0.0 to 1.0
  usedBy: string[];
  isFallback: boolean;
  rawRecordCount?: number;
  note?: string;
}

export interface WeatherDayForecast {
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

export interface WeatherSnapshot {
  currentTemp: number;
  apparentTemp: number;
  relativeHumidity: number;
  precipitationCurrentMm: number;
  precipitationProbability48h: number;
  rainRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  weatherCode: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rain' | 'Thunderstorm' | 'Overcast';
  windSpeedKmh: number;
  forecast7d: WeatherDayForecast[];
  stormFrontWindowDays: number;
  metadata: SourceMetadata;
}

export interface MarketObservation {
  id: string;
  name: string;
  mandiId: string;
  mandiName: string;
  district: string;
  distanceKm: number;
  transitHours: number;
  grossPricePerQuintal: number;
  estimatedTransportCost: number;
  spoilageRiskPercent: number;
  netRealizationPerQuintal: number;
  totalNetRealization: number;
  isOptimal: boolean;
  arrivalWindow: string;
  tradeVolumeQuintals: number;
}

export interface MarketIntelligence {
  modalPrice: number;
  priceTrend7d: 'RISING' | 'STABLE' | 'FALLING';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  destinations: MarketObservation[];
  metadata: SourceMetadata;
}

export interface SoilIntelligence {
  moisturePercentage: number;
  ph: number;
  nitrogenKgHa: number;
  phosphorusKgHa: number;
  potassiumKgHa: number;
  organicCarbon: number;
  soilType: string;
  metadata: SourceMetadata;
}

export interface SignalConflict {
  id: string;
  type: 'WEATHER_MODEL_DISAGREEMENT' | 'MARKET_VOLATILITY_MISMATCH' | 'SOIL_CANOPY_DISCREPANCY';
  sources: string[];
  values: Record<string, string | number>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
}

import { ProbabilisticForecast } from './forecast';

export interface IntelligenceSnapshot {
  timestamp: string;
  farmCoordinates: [number, number];
  weather: WeatherSnapshot;
  market: MarketIntelligence;
  soil: SoilIntelligence;
  forecast?: ProbabilisticForecast;
  activeConflicts: SignalConflict[];
  overallConfidence: number;
  fabricStatus: 'OPTIMAL' | 'DEGRADED' | 'FALLBACK';
}
