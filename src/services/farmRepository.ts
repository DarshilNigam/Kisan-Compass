/**
 * KISAN COMPASS — Multi-Tenant Farm Data Repository
 * 
 * Supports both:
 * 1. Live Supabase PostgreSQL database (with Row-Level Security)
 * 2. High-fidelity isolated tenant storage (keyed by auth_user_id) for local/offline resilience
 * 
 * Enforces:
 * - Farmer A can NEVER access or mutate Farmer B's data
 * - Real relational foreign keys: farmer -> farm -> field -> crop_cycle -> decisions -> outcomes
 * - Production Mode Hardening: When VITE_APP_MODE === 'production', fails explicitly if Supabase
 *   is unconfigured or unreachable, rather than silently falling back to local storage.
 */

import {
  FarmerProfile,
  Farm,
  Field,
  CropCycle,
  SoilProfile,
  FarmerPreferences,
  UserDecisionRecord,
  UserHarvestOutcome,
  CurrentFarmState,
} from '../types/farmerData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export type AppMode = 'development' | 'demo' | 'production';

export function getAppMode(): AppMode {
  const mode = (
    import.meta.env.VITE_APP_MODE || 
    import.meta.env.VITE_APP_ENV || 
    (import.meta.env.DEV ? 'development' : 'production')
  ).toLowerCase();
  
  if (mode.includes('demo')) return 'demo';
  if (mode.includes('prod')) return 'production';
  return 'development';
}

export class DatabaseConnectionError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

// Storage keys for isolated multi-tenant records in development / offline
const STORAGE_PREFIX = 'kisan_compass_v2_';

function getTenantKey(authUserId: string, entity: string): string {
  return `${STORAGE_PREFIX}${authUserId}_${entity}`;
}

export const FarmRepository = {
  /**
   * Health check / connectivity test for Supabase PostgreSQL
   */
  async checkConnection(): Promise<{ connected: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      if (getAppMode() === 'production') {
        return { connected: false, error: 'Database credentials not configured in production mode.' };
      }
      return { connected: true }; // Local multi-tenant fallback active in dev
    }

    try {
      const { error } = await supabase.from('farmers').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        return { connected: false, error: error.message };
      }
      return { connected: true };
    } catch (err: any) {
      return { connected: false, error: err?.message || 'Network connection failed' };
    }
  },

  // ---------------------------------------------------------------------------
  // Farmer Profile
  // ---------------------------------------------------------------------------
  async getFarmerProfile(authUserId: string): Promise<FarmerProfile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('farmers')
          .select('*')
          .eq('auth_user_id', authUserId)
          .maybeSingle();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to fetch farmer profile: ${error.message}`, error);
          }
          console.warn('[FarmRepository] Supabase fetch error, using local tenant storage:', error.message);
        } else if (data) {
          return data as FarmerProfile;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while retrieving profile', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    // Development / offline local storage fallback
    try {
      const raw = localStorage.getItem(getTenantKey(authUserId, 'profile'));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async saveFarmerProfile(profile: FarmerProfile): Promise<FarmerProfile> {
    const updated: FarmerProfile = { ...profile, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('farmers')
          .upsert(
            {
              id: updated.id.startsWith('farmer_') ? undefined : updated.id,
              auth_user_id: updated.auth_user_id,
              full_name: updated.full_name,
              phone: updated.phone,
              preferred_language: updated.preferred_language,
              updated_at: updated.updated_at,
            },
            { onConflict: 'auth_user_id' }
          )
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to save farmer profile: ${error.message}`, error);
          }
          console.warn('[FarmRepository] Supabase upsert error:', error.message);
        } else if (data) {
          // Sync local cache
          localStorage.setItem(getTenantKey(profile.auth_user_id, 'profile'), JSON.stringify(data));
          return data as FarmerProfile;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while saving profile', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    localStorage.setItem(getTenantKey(profile.auth_user_id, 'profile'), JSON.stringify(updated));
    return updated;
  },

  // ---------------------------------------------------------------------------
  // Farms
  // ---------------------------------------------------------------------------
  async getFarms(authUserId: string, farmerId: string): Promise<Farm[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('farms')
          .select('*')
          .eq('farmer_id', farmerId)
          .order('created_at', { ascending: true });

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to fetch farms: ${error.message}`, error);
          }
        } else if (data) {
          return data as Farm[];
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while retrieving farms', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    try {
      const raw = localStorage.getItem(getTenantKey(authUserId, 'farms'));
      if (!raw) return [];
      const list: Farm[] = JSON.parse(raw);
      return list.filter(f => f.farmer_id === farmerId);
    } catch {
      return [];
    }
  },

  async createFarm(authUserId: string, farm: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Promise<Farm> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('farms')
          .insert({
            farmer_id: farm.farmer_id,
            farm_name: farm.farm_name,
            village: farm.village,
            district: farm.district,
            state: farm.state,
            latitude: farm.latitude,
            longitude: farm.longitude,
            location_source: farm.location_source,
            location_accuracy: farm.location_accuracy,
          })
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to create farm: ${error.message}`, error);
          }
        } else if (data) {
          return data as Farm;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while creating farm', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    const newFarm: Farm = {
      ...farm,
      id: `farm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const farms = await this.getFarms(authUserId, farm.farmer_id);
    farms.push(newFarm);
    localStorage.setItem(getTenantKey(authUserId, 'farms'), JSON.stringify(farms));
    return newFarm;
  },

  async updateFarm(authUserId: string, farm: Farm): Promise<Farm> {
    const updated = { ...farm, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('farms')
          .update({
            farm_name: updated.farm_name,
            village: updated.village,
            district: updated.district,
            state: updated.state,
            latitude: updated.latitude,
            longitude: updated.longitude,
            location_source: updated.location_source,
            location_accuracy: updated.location_accuracy,
            updated_at: updated.updated_at,
          })
          .eq('id', updated.id)
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to update farm: ${error.message}`, error);
          }
        } else if (data) {
          return data as Farm;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while updating farm', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    const farms = await this.getFarms(authUserId, farm.farmer_id);
    const index = farms.findIndex(f => f.id === farm.id);
    if (index >= 0) {
      farms[index] = updated;
    } else {
      farms.push(updated);
    }
    localStorage.setItem(getTenantKey(authUserId, 'farms'), JSON.stringify(farms));
    return updated;
  },

  // ---------------------------------------------------------------------------
  // Fields (Parcels)
  // ---------------------------------------------------------------------------
  async getFields(authUserId: string, farmId: string): Promise<Field[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('fields')
          .select('*')
          .eq('farm_id', farmId)
          .order('created_at', { ascending: true });

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to fetch fields: ${error.message}`, error);
          }
        } else if (data) {
          return data as Field[];
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while retrieving fields', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    try {
      const raw = localStorage.getItem(getTenantKey(authUserId, 'fields'));
      if (!raw) return [];
      const list: Field[] = JSON.parse(raw);
      return list.filter(f => f.farm_id === farmId);
    } catch {
      return [];
    }
  },

  async createField(authUserId: string, field: Omit<Field, 'id' | 'created_at' | 'updated_at'>): Promise<Field> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('fields')
          .insert({
            farm_id: field.farm_id,
            field_name: field.field_name,
            area_acres: field.area_acres,
            area_unit: field.area_unit,
            latitude: field.latitude,
            longitude: field.longitude,
            location_source: field.location_source,
          })
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to create field: ${error.message}`, error);
          }
        } else if (data) {
          return data as Field;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while creating field', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    const newField: Field = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const raw = localStorage.getItem(getTenantKey(authUserId, 'fields'));
    const fields: Field[] = raw ? JSON.parse(raw) : [];
    fields.push(newField);
    localStorage.setItem(getTenantKey(authUserId, 'fields'), JSON.stringify(fields));
    return newField;
  },

  async updateField(authUserId: string, field: Field): Promise<Field> {
    const updated = { ...field, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('fields')
          .update({
            field_name: updated.field_name,
            area_acres: updated.area_acres,
            area_unit: updated.area_unit,
            latitude: updated.latitude,
            longitude: updated.longitude,
            location_source: updated.location_source,
            updated_at: updated.updated_at,
          })
          .eq('id', updated.id)
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to update field: ${error.message}`, error);
          }
        } else if (data) {
          return data as Field;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while updating field', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    const raw = localStorage.getItem(getTenantKey(authUserId, 'fields'));
    const fields: Field[] = raw ? JSON.parse(raw) : [];
    const index = fields.findIndex(f => f.id === field.id);
    if (index >= 0) {
      fields[index] = updated;
    } else {
      fields.push(updated);
    }
    localStorage.setItem(getTenantKey(authUserId, 'fields'), JSON.stringify(fields));
    return updated;
  },

  // ---------------------------------------------------------------------------
  // Crop Cycles
  // ---------------------------------------------------------------------------
  async getCropCycles(authUserId: string, fieldId: string): Promise<CropCycle[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('crop_cycles')
          .select('*')
          .eq('field_id', fieldId)
          .order('created_at', { ascending: false });

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to fetch crop cycles: ${error.message}`, error);
          }
        } else if (data) {
          return data as CropCycle[];
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while retrieving crop cycles', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    try {
      const raw = localStorage.getItem(getTenantKey(authUserId, 'crop_cycles'));
      if (!raw) return [];
      const list: CropCycle[] = JSON.parse(raw);
      return list.filter(c => c.field_id === fieldId);
    } catch {
      return [];
    }
  },

  async getActiveCropCycle(authUserId: string, fieldId: string): Promise<CropCycle | null> {
    const cycles = await this.getCropCycles(authUserId, fieldId);
    return cycles.find(c => c.status === 'ACTIVE') || null;
  },

  async createCropCycle(authUserId: string, cycle: Omit<CropCycle, 'id' | 'created_at' | 'updated_at'>): Promise<CropCycle> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('crop_cycles')
          .insert({
            field_id: cycle.field_id,
            crop_name: cycle.crop_name,
            crop_variety: cycle.crop_variety,
            sowing_date: cycle.sowing_date,
            sowing_date_precision: cycle.sowing_date_precision,
            crop_stage: cycle.crop_stage,
            quantity_quintals: cycle.quantity_quintals,
            quantity_unit: cycle.quantity_unit,
            quantity_status: cycle.quantity_status,
            status: cycle.status,
          })
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to create crop cycle: ${error.message}`, error);
          }
        } else if (data) {
          return data as CropCycle;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while creating crop cycle', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    const newCycle: CropCycle = {
      ...cycle,
      id: `crop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const raw = localStorage.getItem(getTenantKey(authUserId, 'crop_cycles'));
    const cycles: CropCycle[] = raw ? JSON.parse(raw) : [];
    cycles.push(newCycle);
    localStorage.setItem(getTenantKey(authUserId, 'crop_cycles'), JSON.stringify(cycles));
    return newCycle;
  },

  async updateCropCycle(authUserId: string, cycle: CropCycle): Promise<CropCycle> {
    const updated = { ...cycle, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('crop_cycles')
          .update({
            crop_name: updated.crop_name,
            crop_variety: updated.crop_variety,
            sowing_date: updated.sowing_date,
            sowing_date_precision: updated.sowing_date_precision,
            crop_stage: updated.crop_stage,
            quantity_quintals: updated.quantity_quintals,
            quantity_unit: updated.quantity_unit,
            quantity_status: updated.quantity_status,
            status: updated.status,
            updated_at: updated.updated_at,
          })
          .eq('id', updated.id)
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to update crop cycle: ${error.message}`, error);
          }
        } else if (data) {
          return data as CropCycle;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while updating crop cycle', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    const raw = localStorage.getItem(getTenantKey(authUserId, 'crop_cycles'));
    const cycles: CropCycle[] = raw ? JSON.parse(raw) : [];
    const index = cycles.findIndex(c => c.id === cycle.id);
    if (index >= 0) {
      cycles[index] = updated;
    } else {
      cycles.push(updated);
    }
    localStorage.setItem(getTenantKey(authUserId, 'crop_cycles'), JSON.stringify(cycles));
    return updated;
  },

  // ---------------------------------------------------------------------------
  // Soil Profiles
  // ---------------------------------------------------------------------------
  async getSoilProfile(authUserId: string, fieldId: string): Promise<SoilProfile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('soil_profiles')
          .select('*')
          .eq('field_id', fieldId)
          .maybeSingle();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to fetch soil profile: ${error.message}`, error);
          }
        } else if (data) {
          return data as SoilProfile;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while retrieving soil profile', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    try {
      const raw = localStorage.getItem(getTenantKey(authUserId, 'soil_profiles'));
      if (!raw) return null;
      const list: SoilProfile[] = JSON.parse(raw);
      return list.find(s => s.field_id === fieldId) || null;
    } catch {
      return null;
    }
  },

  async saveSoilProfile(authUserId: string, profile: Omit<SoilProfile, 'id' | 'created_at' | 'updated_at'>): Promise<SoilProfile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('soil_profiles')
          .upsert(
            {
              field_id: profile.field_id,
              has_test: profile.has_test,
              ph: profile.ph,
              moisture_percentage: profile.moisture_percentage,
              nitrogen_kg_ha: profile.nitrogen_kg_ha,
              phosphorus_kg_ha: profile.phosphorus_kg_ha,
              potassium_kg_ha: profile.potassium_kg_ha,
              organic_carbon: profile.organic_carbon,
              source: profile.source,
              tested_at: profile.tested_at,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'field_id' }
          )
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to save soil profile: ${error.message}`, error);
          }
        } else if (data) {
          return data as SoilProfile;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while saving soil profile', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    const raw = localStorage.getItem(getTenantKey(authUserId, 'soil_profiles'));
    const list: SoilProfile[] = raw ? JSON.parse(raw) : [];
    const existingIndex = list.findIndex(s => s.field_id === profile.field_id);
    
    const saved: SoilProfile = {
      ...profile,
      id: existingIndex >= 0 ? list[existingIndex].id : `soil_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: existingIndex >= 0 ? list[existingIndex].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = saved;
    } else {
      list.push(saved);
    }
    localStorage.setItem(getTenantKey(authUserId, 'soil_profiles'), JSON.stringify(list));
    return saved;
  },

  // ---------------------------------------------------------------------------
  // Farmer Preferences
  // ---------------------------------------------------------------------------
  async getPreferences(authUserId: string, farmerId: string): Promise<FarmerPreferences | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('farmer_preferences')
          .select('*')
          .eq('farmer_id', farmerId)
          .maybeSingle();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to fetch preferences: ${error.message}`, error);
          }
        } else if (data) {
          return data as FarmerPreferences;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while retrieving preferences', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    try {
      const raw = localStorage.getItem(getTenantKey(authUserId, 'preferences'));
      if (!raw) return null;
      const pref: FarmerPreferences = JSON.parse(raw);
      return pref.farmer_id === farmerId ? pref : null;
    } catch {
      return null;
    }
  },

  async savePreferences(authUserId: string, pref: Omit<FarmerPreferences, 'id' | 'created_at' | 'updated_at'>): Promise<FarmerPreferences> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('farmer_preferences')
          .upsert(
            {
              farmer_id: pref.farmer_id,
              risk_posture: pref.risk_posture,
              immediate_cash_weight: pref.immediate_cash_weight,
              weather_risk_aversion: pref.weather_risk_aversion,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'farmer_id' }
          )
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to save preferences: ${error.message}`, error);
          }
        } else if (data) {
          return data as FarmerPreferences;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while saving preferences', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    const existing = await this.getPreferences(authUserId, pref.farmer_id);
    const saved: FarmerPreferences = {
      ...pref,
      id: existing?.id || `pref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(getTenantKey(authUserId, 'preferences'), JSON.stringify(saved));
    return saved;
  },

  // ---------------------------------------------------------------------------
  // Decisions (Memory)
  // ---------------------------------------------------------------------------
  async getDecisions(authUserId: string, fieldId: string): Promise<UserDecisionRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('decisions')
          .select('*')
          .eq('field_id', fieldId)
          .order('created_at', { ascending: false });

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to fetch decisions: ${error.message}`, error);
          }
        } else if (data) {
          return data as UserDecisionRecord[];
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while retrieving decisions', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    try {
      const raw = localStorage.getItem(getTenantKey(authUserId, 'decisions'));
      if (!raw) return [];
      const list: UserDecisionRecord[] = JSON.parse(raw);
      return list.filter(d => d.field_id === fieldId);
    } catch {
      return [];
    }
  },

  async saveDecision(authUserId: string, dec: Omit<UserDecisionRecord, 'id' | 'created_at'>): Promise<UserDecisionRecord> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('decisions')
          .insert({
            field_id: dec.field_id,
            crop_cycle_id: dec.crop_cycle_id,
            action: dec.action,
            primary_recommendation: dec.primary_recommendation,
            expected_realization_inr: dec.expected_realization_inr,
            p10_inr: dec.p10_inr,
            p90_inr: dec.p90_inr,
            confidence: dec.confidence,
            farmer_action: dec.farmer_action,
            rejection_reason: dec.rejection_reason,
            farmer_notes: dec.farmer_notes,
            action_taken_at: dec.action_taken_at,
          })
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to save decision: ${error.message}`, error);
          }
        } else if (data) {
          return data as UserDecisionRecord;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while saving decision', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    const raw = localStorage.getItem(getTenantKey(authUserId, 'decisions'));
    const list: UserDecisionRecord[] = raw ? JSON.parse(raw) : [];
    const newDec: UserDecisionRecord = {
      ...dec,
      id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    list.push(newDec);
    localStorage.setItem(getTenantKey(authUserId, 'decisions'), JSON.stringify(list));
    return newDec;
  },

  async updateDecisionAction(
    authUserId: string,
    decisionId: string,
    action: 'ACCEPTED' | 'REJECTED',
    reason?: string,
    notes?: string
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('decisions')
          .update({
            farmer_action: action,
            rejection_reason: reason,
            farmer_notes: notes,
            action_taken_at: new Date().toISOString(),
          })
          .eq('id', decisionId);

        if (error && getAppMode() === 'production') {
          throw new DatabaseConnectionError(`Failed to update decision: ${error.message}`, error);
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while updating decision', err);
        }
      }
    }

    const raw = localStorage.getItem(getTenantKey(authUserId, 'decisions'));
    if (!raw) return;
    const list: UserDecisionRecord[] = JSON.parse(raw);
    const item = list.find(d => d.id === decisionId);
    if (item) {
      item.farmer_action = action;
      item.rejection_reason = reason;
      item.farmer_notes = notes;
      item.action_taken_at = new Date().toISOString();
      localStorage.setItem(getTenantKey(authUserId, 'decisions'), JSON.stringify(list));
    }
  },

  // ---------------------------------------------------------------------------
  // Harvest Outcomes
  // ---------------------------------------------------------------------------
  async getHarvestOutcomes(authUserId: string, fieldId: string): Promise<UserHarvestOutcome[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('harvest_outcomes')
          .select('*')
          .eq('field_id', fieldId)
          .order('sale_date', { ascending: false });

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to fetch harvest outcomes: ${error.message}`, error);
          }
        } else if (data) {
          return data as UserHarvestOutcome[];
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while retrieving harvest outcomes', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    try {
      const raw = localStorage.getItem(getTenantKey(authUserId, 'outcomes'));
      if (!raw) return [];
      const list: UserHarvestOutcome[] = JSON.parse(raw);
      return list.filter(o => o.field_id === fieldId);
    } catch {
      return [];
    }
  },

  async saveHarvestOutcome(authUserId: string, outcome: Omit<UserHarvestOutcome, 'id' | 'reported_at'>): Promise<UserHarvestOutcome> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('harvest_outcomes')
          .insert({
            decision_id: outcome.decision_id,
            field_id: outcome.field_id,
            mandi_name: outcome.mandi_name,
            sold_quintals: outcome.sold_quintals,
            price_per_quintal: outcome.price_per_quintal,
            transport_paid_inr: outcome.transport_paid_inr,
            mandi_fees_paid_inr: outcome.mandi_fees_paid_inr,
            actual_net_realization_inr: outcome.actual_net_realization_inr,
            sale_date: outcome.sale_date,
            receipt_verified: outcome.receipt_verified,
          })
          .select()
          .single();

        if (error) {
          if (getAppMode() === 'production') {
            throw new DatabaseConnectionError(`Failed to save harvest outcome: ${error.message}`, error);
          }
        } else if (data) {
          return data as UserHarvestOutcome;
        }
      } catch (err) {
        if (err instanceof DatabaseConnectionError) {
          throw err;
        }
        if (getAppMode() === 'production') {
          throw new DatabaseConnectionError('Database connection error while saving harvest outcome', err);
        }
      }
    } else if (getAppMode() === 'production') {
      throw new DatabaseConnectionError('DATABASE CONNECTION UNAVAILABLE: Live Supabase database required in production.');
    }

    const raw = localStorage.getItem(getTenantKey(authUserId, 'outcomes'));
    const list: UserHarvestOutcome[] = raw ? JSON.parse(raw) : [];
    const newOutcome: UserHarvestOutcome = {
      ...outcome,
      id: `outcome_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      reported_at: new Date().toISOString(),
    };
    list.push(newOutcome);
    localStorage.setItem(getTenantKey(authUserId, 'outcomes'), JSON.stringify(list));
    return newOutcome;
  },

  // ---------------------------------------------------------------------------
  // Aggregate Helpers
  // ---------------------------------------------------------------------------
  async getCropCyclesByField(authUserId: string, fieldId: string): Promise<CropCycle[]> {
    return this.getCropCycles(authUserId, fieldId);
  },

  async getSoilProfileByField(authUserId: string, fieldId: string): Promise<SoilProfile | null> {
    return this.getSoilProfile(authUserId, fieldId);
  },

  async getCurrentFarmState(authUserId: string): Promise<CurrentFarmState | null> {
    const farmer = await this.getFarmerProfile(authUserId);
    if (!farmer) return null;

    const farms = await this.getFarms(authUserId, farmer.id);
    if (!farms.length) return null;
    const activeFarm = farms[0];

    const fields = await this.getFields(authUserId, activeFarm.id);
    if (!fields.length) return null;
    const activeField = fields[0];

    const cropCycles = await this.getCropCycles(authUserId, activeField.id);
    const activeCropCycle = cropCycles.find(c => c.status === 'ACTIVE') || cropCycles[0] || null;

    const soilProfile = await this.getSoilProfile(authUserId, activeField.id);
    const preferences = await this.getPreferences(authUserId, farmer.id);
    const decisions = await this.getDecisions(authUserId, activeField.id);
    const outcomes = await this.getHarvestOutcomes(authUserId, activeField.id);

    return {
      farmer,
      farms,
      activeFarm,
      fields,
      activeField,
      activeCropCycle,
      soilProfile,
      preferences,
      decisions,
      outcomes,
      isDemoMode: false,
      loading: false,
      initialized: true,
    };
  }
};
