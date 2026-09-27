/**
 * KISAN COMPASS — Multi-Tenant Farmer & Farm Data Domain Models
 * 
 * Strict architectural types mapping 1:1 with PostgreSQL relational schema:
 * auth.users(id) -> farmers -> farms -> fields -> crop_cycles -> decisions -> outcomes
 */

export type PreferredLanguage = 'en' | 'hi';
export type LocationSource = 'GPS' | 'MANUAL' | 'FARM_DEFAULT' | 'APPROXIMATE';
export type AreaUnit = 'ACRES' | 'HECTARES' | 'BIGHA';
export type QuantityUnit = 'QUINTALS' | 'KILOGRAMS' | 'TONNES';
export type SowingDatePrecision = 'EXACT' | 'APPROXIMATE' | 'UNKNOWN';
export type QuantityStatus = 'KNOWN' | 'UNKNOWN';
export type CropCycleStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
export type RiskPosture = 'SAFER' | 'BALANCED' | 'OPPORTUNITY';
export type FarmerDecisionAction = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface FarmerProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone?: string;
  preferred_language: PreferredLanguage;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  farmer_id: string;
  farm_name: string;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  location_source: LocationSource;
  location_accuracy?: number; // in meters if GPS
  created_at: string;
  updated_at: string;
}

export interface Field {
  id: string;
  farm_id: string;
  field_name: string;
  area_acres: number;
  area_unit: AreaUnit;
  latitude?: number;
  longitude?: number;
  location_source?: LocationSource;
  created_at: string;
  updated_at: string;
}

export interface CropCycle {
  id: string;
  field_id: string;
  crop_name: string;
  crop_variety?: string;
  sowing_date?: string;
  sowing_date_precision: SowingDatePrecision;
  crop_stage: string; // e.g. "Just planted", "Growing", "Flowering", "Nearly ready", "Ready to harvest"
  quantity_quintals: number | null;
  quantity_unit: QuantityUnit;
  quantity_status: QuantityStatus;
  status: CropCycleStatus;
  created_at: string;
  updated_at: string;
}

export interface SoilProfile {
  id: string;
  field_id: string;
  has_test: boolean;
  ph?: number;
  moisture_percentage?: number;
  nitrogen_kg_ha?: number;
  phosphorus_kg_ha?: number;
  potassium_kg_ha?: number;
  organic_carbon?: number;
  source: 'USER_TEST' | 'REGIONAL_REFERENCE' | 'IN_SITU_SENSOR';
  tested_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmerPreferences {
  id: string;
  farmer_id: string;
  risk_posture: RiskPosture;
  immediate_cash_weight: number;
  weather_risk_aversion: number;
  created_at: string;
  updated_at: string;
}

export interface UserDecisionRecord {
  id: string;
  field_id: string;
  crop_cycle_id?: string;
  action: string;
  primary_recommendation: string;
  expected_realization_inr: number;
  p10_inr?: number;
  p90_inr?: number;
  confidence: number;
  farmer_action: FarmerDecisionAction;
  rejection_reason?: string;
  farmer_notes?: string;
  action_taken_at?: string;
  created_at: string;
}

export interface UserHarvestOutcome {
  id: string;
  decision_id?: string;
  field_id: string;
  mandi_name: string;
  sold_quintals: number;
  price_per_quintal: number;
  transport_paid_inr: number;
  mandi_fees_paid_inr: number;
  actual_net_realization_inr: number;
  sale_date: string;
  receipt_verified: boolean;
  reported_at: string;
}

export interface CurrentFarmState {
  farmer: FarmerProfile | null;
  farms: Farm[];
  activeFarm: Farm | null;
  fields: Field[];
  activeField: Field | null;
  activeCropCycle: CropCycle | null;
  soilProfile: SoilProfile | null;
  preferences: FarmerPreferences | null;
  decisions: UserDecisionRecord[];
  outcomes: UserHarvestOutcome[];
  isDemoMode: boolean;
  loading: boolean;
  initialized: boolean;
}
