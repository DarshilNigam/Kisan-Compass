/**
 * Deterministic Crop Agronomy & Biological Maturity Engine
 * Calculates physiological maturity, GDD heat accumulation, and harvest windows
 * grounded in actual farmer sowing date, crop species, and recorded stage.
 * 
 * Invariants:
 * - Sowing date = today MUST yield age = 0, maturity = 0%, isReadyForHarvest = false.
 * - Sowing date in future MUST yield age = 0, maturity = 0%, isReadyForHarvest = false.
 * - Missing/invalid sowing date MUST NEVER default to harvest-ready or 94.6%.
 * - Maturity is monotonic: 0 <= maturityPercent <= 100.
 */

import { CropStage } from '../types/farm';

export interface CropAgronomyProfile {
  cropName: string;
  totalDurationDays: number;
  targetGdd: number;
  baseTempCelsius: number;
  defaultMoisturePercent: number;
}

export const CROP_AGRONOMY_DATABASE: Record<string, CropAgronomyProfile> = {
  'wheat': { cropName: 'Wheat', totalDurationDays: 130, targetGdd: 1950, baseTempCelsius: 5.0, defaultMoisturePercent: 13.2 },
  'rice': { cropName: 'Rice / Paddy', totalDurationDays: 125, targetGdd: 2100, baseTempCelsius: 10.0, defaultMoisturePercent: 14.5 },
  'paddy': { cropName: 'Rice / Paddy', totalDurationDays: 125, targetGdd: 2100, baseTempCelsius: 10.0, defaultMoisturePercent: 14.5 },
  'sugarcane': { cropName: 'Sugarcane', totalDurationDays: 330, targetGdd: 3800, baseTempCelsius: 12.0, defaultMoisturePercent: 18.0 },
  'potato': { cropName: 'Potato', totalDurationDays: 100, targetGdd: 1400, baseTempCelsius: 7.0, defaultMoisturePercent: 16.5 },
  'mustard': { cropName: 'Mustard / Rapeseed', totalDurationDays: 115, targetGdd: 1600, baseTempCelsius: 5.0, defaultMoisturePercent: 9.0 },
  'rapeseed': { cropName: 'Mustard / Rapeseed', totalDurationDays: 115, targetGdd: 1600, baseTempCelsius: 5.0, defaultMoisturePercent: 9.0 },
  'maize': { cropName: 'Maize / Corn', totalDurationDays: 105, targetGdd: 1700, baseTempCelsius: 10.0, defaultMoisturePercent: 15.0 },
  'corn': { cropName: 'Maize / Corn', totalDurationDays: 105, targetGdd: 1700, baseTempCelsius: 10.0, defaultMoisturePercent: 15.0 },
  'cotton': { cropName: 'Cotton', totalDurationDays: 170, targetGdd: 2600, baseTempCelsius: 15.0, defaultMoisturePercent: 11.5 },
  'soybean': { cropName: 'Soybean', totalDurationDays: 105, targetGdd: 1650, baseTempCelsius: 10.0, defaultMoisturePercent: 12.5 },
  'gram': { cropName: 'Gram / Chana', totalDurationDays: 120, targetGdd: 1750, baseTempCelsius: 8.0, defaultMoisturePercent: 11.0 },
  'chana': { cropName: 'Gram / Chana', totalDurationDays: 120, targetGdd: 1750, baseTempCelsius: 8.0, defaultMoisturePercent: 11.0 },
};

export interface CropMaturityResult {
  cropName: string;
  cropAgeDays: number;
  cropStage: CropStage;
  maturityPercent: number;
  gddAccumulated: number;
  gddTarget: number;
  baseTempCelsius: number;
  moisturePercent: number;
  isReadyForHarvest: boolean;
  harvestWindow: {
    start: string;
    optimal: string;
    deadline: string;
  };
}

export interface StageMaturitySpec {
  min: number;
  max: number;
  typical: number;
  canonicalStage: CropStage;
}

export type StageCategory = 
  | 'JUST_PLANTED'
  | 'GROWING'
  | 'TILLERING'
  | 'FLOWERING'
  | 'GRAIN_FORMING'
  | 'NEARLY_READY'
  | 'READY_TO_HARVEST'
  | 'UNSPECIFIED';

export type CropStageProgression = Record<
  'JUST_PLANTED' | 'GROWING' | 'TILLERING' | 'FLOWERING' | 'GRAIN_FORMING' | 'NEARLY_READY' | 'READY_TO_HARVEST',
  StageMaturitySpec
>;

export const CROP_STAGE_PROGRESSION_DATABASE: Record<string, CropStageProgression> = {
  'sugarcane': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 18, max: 35, typical: 26, canonicalStage: 'Growing' },
    TILLERING: { min: 36, max: 58, typical: 48, canonicalStage: 'Tillering' },
    FLOWERING: { min: 59, max: 75, typical: 68, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 76, max: 87, typical: 82, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 88, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'potato': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 12, max: 32, typical: 22, canonicalStage: 'Growing' },
    TILLERING: { min: 33, max: 52, typical: 42, canonicalStage: 'Tillering' },
    FLOWERING: { min: 53, max: 74, typical: 64, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 75, max: 86, typical: 80, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 87, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'wheat': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 14, max: 32, typical: 23, canonicalStage: 'Growing' },
    TILLERING: { min: 33, max: 54, typical: 45, canonicalStage: 'Tillering' },
    FLOWERING: { min: 55, max: 72, typical: 64, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 73, max: 86, typical: 80, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 87, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'rice': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 15, max: 34, typical: 24, canonicalStage: 'Growing' },
    TILLERING: { min: 35, max: 56, typical: 46, canonicalStage: 'Tillering' },
    FLOWERING: { min: 57, max: 74, typical: 65, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 75, max: 86, typical: 80, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 87, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'paddy': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 15, max: 34, typical: 24, canonicalStage: 'Growing' },
    TILLERING: { min: 35, max: 56, typical: 46, canonicalStage: 'Tillering' },
    FLOWERING: { min: 57, max: 74, typical: 65, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 75, max: 86, typical: 80, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 87, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'mustard': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 14, max: 32, typical: 22, canonicalStage: 'Growing' },
    TILLERING: { min: 33, max: 54, typical: 44, canonicalStage: 'Tillering' },
    FLOWERING: { min: 55, max: 72, typical: 64, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 73, max: 86, typical: 79, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 87, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'rapeseed': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 14, max: 32, typical: 22, canonicalStage: 'Growing' },
    TILLERING: { min: 33, max: 54, typical: 44, canonicalStage: 'Tillering' },
    FLOWERING: { min: 55, max: 72, typical: 64, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 73, max: 86, typical: 79, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 87, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'maize': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 14, max: 32, typical: 22, canonicalStage: 'Growing' },
    TILLERING: { min: 33, max: 52, typical: 42, canonicalStage: 'Tillering' },
    FLOWERING: { min: 53, max: 70, typical: 62, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 71, max: 85, typical: 78, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 86, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'corn': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 14, max: 32, typical: 22, canonicalStage: 'Growing' },
    TILLERING: { min: 33, max: 52, typical: 42, canonicalStage: 'Tillering' },
    FLOWERING: { min: 53, max: 70, typical: 62, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 71, max: 85, typical: 78, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 86, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'cotton': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 15, max: 34, typical: 24, canonicalStage: 'Growing' },
    TILLERING: { min: 35, max: 55, typical: 45, canonicalStage: 'Tillering' },
    FLOWERING: { min: 56, max: 72, typical: 64, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 73, max: 86, typical: 80, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 87, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'soybean': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 14, max: 32, typical: 22, canonicalStage: 'Growing' },
    TILLERING: { min: 33, max: 52, typical: 42, canonicalStage: 'Tillering' },
    FLOWERING: { min: 53, max: 70, typical: 62, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 71, max: 85, typical: 78, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 86, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'gram': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 14, max: 32, typical: 22, canonicalStage: 'Growing' },
    TILLERING: { min: 33, max: 54, typical: 44, canonicalStage: 'Tillering' },
    FLOWERING: { min: 55, max: 72, typical: 64, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 73, max: 86, typical: 79, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 87, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
  'chana': {
    JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
    GROWING: { min: 14, max: 32, typical: 22, canonicalStage: 'Growing' },
    TILLERING: { min: 33, max: 54, typical: 44, canonicalStage: 'Tillering' },
    FLOWERING: { min: 55, max: 72, typical: 64, canonicalStage: 'Flowering' },
    GRAIN_FORMING: { min: 73, max: 86, typical: 79, canonicalStage: 'Grain Fill' },
    NEARLY_READY: { min: 87, max: 94, typical: 90, canonicalStage: 'Late maturity' },
    READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
  },
};

export const DEFAULT_STAGE_PROGRESSION: CropStageProgression = {
  JUST_PLANTED: { min: 0, max: 5, typical: 0, canonicalStage: 'Just planted' },
  GROWING: { min: 15, max: 34, typical: 24, canonicalStage: 'Growing' },
  TILLERING: { min: 34, max: 54, typical: 44, canonicalStage: 'Tillering' },
  FLOWERING: { min: 55, max: 72, typical: 64, canonicalStage: 'Flowering' },
  GRAIN_FORMING: { min: 73, max: 86, typical: 80, canonicalStage: 'Grain Fill' },
  NEARLY_READY: { min: 87, max: 94, typical: 90, canonicalStage: 'Late maturity' },
  READY_TO_HARVEST: { min: 95, max: 100, typical: 98, canonicalStage: 'Harvest Ready' },
};

export function getCropStageProgression(cropName: string = 'Wheat'): CropStageProgression {
  const normalized = cropName.toLowerCase().trim();
  const match = Object.entries(CROP_STAGE_PROGRESSION_DATABASE).find(([key]) => normalized.includes(key));
  return match ? match[1] : DEFAULT_STAGE_PROGRESSION;
}

export function normalizeStageCategory(stageInput?: string | null): StageCategory {
  if (!stageInput) return 'UNSPECIFIED';
  const s = stageInput.toLowerCase().trim();
  if (!s || s === 'not sure' || s === 'unknown' || s.includes('not sure')) return 'UNSPECIFIED';
  
  if (s.includes('plant') || s.includes('sown') || s.includes('germ') || s.includes('emerg')) {
    return 'JUST_PLANTED';
  }
  if (s.includes('nearly ready') || s.includes('late') || s.includes('turn') || s.includes('matur')) {
    return 'NEARLY_READY';
  }
  if (s.includes('harvest') || s.includes('ready') || s.includes('ripe')) {
    return 'READY_TO_HARVEST';
  }
  if (s.includes('fill') || s.includes('pod') || s.includes('bulk') || s.includes('grain forming') || s.includes('milk') || s.includes('dough') || s.includes('boll')) {
    return 'GRAIN_FORMING';
  }
  if (s.includes('flower') || s.includes('bloom') || s.includes('tassel') || s.includes('silk') || s.includes('heading') || s.includes('earing') || s.includes('pollin')) {
    return 'FLOWERING';
  }
  if (s.includes('tiller') || s.includes('branch') || s.includes('grand growth') || s.includes('elongat') || s.includes('joint')) {
    return 'TILLERING';
  }
  if (s.includes('grow') || s.includes('veg') || s.includes('seedling')) {
    return 'GROWING';
  }
  return 'UNSPECIFIED';
}

/**
 * Safely calculates calendar days between a sowing date and reference date.
 * Normalizes both to midnight local time to avoid timezone offset edge cases.
 */
export function safeCalculateDaysBetween(
  sowingDateStr?: string | null,
  referenceDate: Date = new Date()
): { days: number; isValid: boolean; isFuture: boolean } {
  if (!sowingDateStr || typeof sowingDateStr !== 'string') {
    return { days: 0, isValid: false, isFuture: false };
  }

  const trimmed = sowingDateStr.trim();
  if (!trimmed) {
    return { days: 0, isValid: false, isFuture: false };
  }

  // Parse YYYY-MM-DD or ISO string safely
  const parts = trimmed.split('T')[0].split('-');
  let sown: Date;
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    sown = new Date(year, month, day);
  } else {
    sown = new Date(trimmed);
  }

  if (isNaN(sown.getTime())) {
    return { days: 0, isValid: false, isFuture: false };
  }

  const sownMidnight = new Date(sown.getFullYear(), sown.getMonth(), sown.getDate());
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  const diffMs = refMidnight.getTime() - sownMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Sowing date in future: age is 0, isFuture is true
    return { days: 0, isValid: true, isFuture: true };
  }

  return { days: diffDays, isValid: true, isFuture: false };
}

export function getCropProfile(cropName: string = 'Wheat'): CropAgronomyProfile {
  const normalized = cropName.toLowerCase().trim();
  const match = Object.entries(CROP_AGRONOMY_DATABASE).find(([key]) => normalized.includes(key));
  if (match) return match[1];

  return {
    cropName,
    totalDurationDays: 125,
    targetGdd: 1900,
    baseTempCelsius: 8.0,
    defaultMoisturePercent: 13.5,
  };
}

export function calculateCropAgronomy(
  cropName: string = 'Wheat',
  sowingDate?: string | null,
  stageInput?: string | null,
  referenceDate: Date = new Date()
): CropMaturityResult {
  const profile = getCropProfile(cropName);
  const stageCategory = normalizeStageCategory(stageInput);
  const progression = getCropStageProgression(cropName);
  const { days: calendarDays, isValid: isSowingDateValid, isFuture } = safeCalculateDaysBetween(sowingDate, referenceDate);

  let maturityPercent = 0;
  let cropStage: CropStage = 'Just planted';
  let resolvedAgeDays = calendarDays;

  // 1. Dual-signal evaluation
  if (stageCategory === 'UNSPECIFIED') {
    // Farmer did not specify biological stage (or selected "Not sure")
    if (!isSowingDateValid) {
      maturityPercent = 0;
      cropStage = 'Planting date required';
      resolvedAgeDays = 0;
    } else if (calendarDays === 0 || isFuture) {
      maturityPercent = 0;
      cropStage = 'Just planted';
      resolvedAgeDays = 0;
    } else {
      // Pure calendar derivation
      const calendarMaturity = Math.min(100, Math.max(0, Math.round((calendarDays / profile.totalDurationDays) * 100)));
      maturityPercent = calendarMaturity;
      if (maturityPercent >= 95) cropStage = 'Harvest Ready';
      else if (maturityPercent >= 87) cropStage = 'Late maturity';
      else if (maturityPercent >= 72) cropStage = 'Grain Fill';
      else if (maturityPercent >= 55) cropStage = 'Flowering';
      else if (maturityPercent >= 35) cropStage = 'Tillering';
      else if (maturityPercent >= 10) cropStage = 'Growing';
      else cropStage = 'Just planted';
    }
  } else if (stageCategory === 'JUST_PLANTED') {
    // Farmer explicitly declared "Just planted"
    if (!isSowingDateValid || calendarDays === 0 || isFuture) {
      maturityPercent = 0;
      cropStage = 'Just planted';
      resolvedAgeDays = 0;
    } else {
      // Positive calendar age, but farmer confirms just planted / early emergence
      const calendarMaturity = Math.round((calendarDays / profile.totalDurationDays) * 100);
      maturityPercent = Math.min(5, calendarMaturity);
      cropStage = 'Just planted';
      resolvedAgeDays = Math.min(calendarDays, Math.round(profile.totalDurationDays * 0.05));
    }
  } else {
    // Farmer explicitly declared an active biological stage:
    // GROWING, TILLERING, FLOWERING, GRAIN_FORMING, NEARLY_READY, or READY_TO_HARVEST
    const spec = progression[stageCategory];
    cropStage = spec.canonicalStage;

    if (!isSowingDateValid || calendarDays === 0 || isFuture) {
      // Sowing date is missing, invalid, today (0-days unedited), or future:
      // Biological stage declared by the farmer MUST PREVAIL!
      maturityPercent = spec.typical;
      resolvedAgeDays = Math.round((spec.typical / 100) * profile.totalDurationDays);
    } else {
      // Both valid calendar age (>0) and declared stage are present:
      // Reconcile by bounding calendar maturity into biological stage range
      const calendarMaturity = Math.round((calendarDays / profile.totalDurationDays) * 100);
      if (stageCategory === 'READY_TO_HARVEST') {
        maturityPercent = Math.min(100, Math.max(spec.min, calendarMaturity));
      } else {
        maturityPercent = Math.min(spec.max, Math.max(spec.min, calendarMaturity));
      }
      resolvedAgeDays = calendarDays;
    }
  }

  // Ensure maturity is strictly bounded in [0, 100]
  maturityPercent = Math.min(100, Math.max(0, maturityPercent));

  const gddTarget = profile.targetGdd;
  const gddAccumulated = Math.round((maturityPercent / 100) * gddTarget);

  // Moisture drops physiologically as crop approaches harvest maturity
  let moisturePercent = profile.defaultMoisturePercent;
  if (cropStage === 'Harvest Ready' || cropStage === 'Ready to harvest') {
    moisturePercent = +(profile.defaultMoisturePercent * 0.95).toFixed(1);
  } else if (cropStage === 'Late maturity' || cropStage === 'Nearly ready') {
    moisturePercent = profile.defaultMoisturePercent;
  } else if (cropStage === 'Grain Fill' || cropStage === 'Grain forming') {
    moisturePercent = +(profile.defaultMoisturePercent * 1.35).toFixed(1);
  } else if (cropStage === 'Flowering') {
    moisturePercent = +(profile.defaultMoisturePercent * 1.5).toFixed(1);
  } else if (cropStage === 'Tillering') {
    moisturePercent = +(profile.defaultMoisturePercent * 1.65).toFixed(1);
  } else if (cropStage === 'Vegetative' || cropStage === 'Growing') {
    moisturePercent = +(profile.defaultMoisturePercent * 1.75).toFixed(1);
  } else {
    // Just planted / Planting date required (high vegetative/seed moisture)
    moisturePercent = +(profile.defaultMoisturePercent * 1.8).toFixed(1);
  }

  // Harvest readiness requires optimal commercial maturity (>= 95%) or explicit Harvest Ready declaration
  const isReadyForHarvest = maturityPercent >= 95 || cropStage === 'Harvest Ready' || cropStage === 'Ready to harvest';

  // Dynamic harvest window relative to reference date
  const formatWindowDate = (d: Date, hourStr: string) => {
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = String(d.getDate()).padStart(2, '0');
    return `${month} ${day}, ${hourStr}`;
  };

  const startD = new Date(referenceDate);
  const optD = new Date(referenceDate);
  const deadD = new Date(referenceDate);

  if (isReadyForHarvest) {
    // Immediate / near-term operational window
    startD.setDate(startD.getDate() + 1);
    optD.setDate(optD.getDate() + 1);
    deadD.setDate(deadD.getDate() + 3);
  } else {
    // Projected harvest window based on days remaining to reach physiological maturity
    const remainingDays = Math.max(7, profile.totalDurationDays - resolvedAgeDays);
    startD.setDate(startD.getDate() + remainingDays);
    optD.setDate(optD.getDate() + remainingDays + 2);
    deadD.setDate(deadD.getDate() + remainingDays + 7);
  }

  const harvestWindow = {
    start: formatWindowDate(startD, '06:00 IST'),
    optimal: formatWindowDate(optD, '08:30 IST'),
    deadline: formatWindowDate(deadD, '17:00 IST'),
  };

  return {
    cropName: profile.cropName,
    cropAgeDays: resolvedAgeDays,
    cropStage,
    maturityPercent,
    gddAccumulated,
    gddTarget,
    baseTempCelsius: profile.baseTempCelsius,
    moisturePercent,
    isReadyForHarvest,
    harvestWindow,
  };
}
