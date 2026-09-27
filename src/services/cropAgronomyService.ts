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

/**
 * Safely calculates calendar days between a sowing date and reference date.
 * Normalizes both to midnight local time to avoid timezone offset edge cases.
 */
export function safeCalculateDaysBetween(
  sowingDateStr?: string | null,
  referenceDate: Date = new Date()
): { days: number; isValid: boolean } {
  if (!sowingDateStr || typeof sowingDateStr !== 'string') {
    return { days: 0, isValid: false };
  }

  const trimmed = sowingDateStr.trim();
  if (!trimmed) {
    return { days: 0, isValid: false };
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
    return { days: 0, isValid: false };
  }

  const sownMidnight = new Date(sown.getFullYear(), sown.getMonth(), sown.getDate());
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  const diffMs = refMidnight.getTime() - sownMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Sowing date in future: age is 0
    return { days: 0, isValid: true };
  }

  return { days: diffDays, isValid: true };
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
  const { days: cropAgeDays, isValid: isSowingDateValid } = safeCalculateDaysBetween(sowingDate, referenceDate);

  let maturityPercent = 0;
  let cropStage: CropStage = 'Just planted';

  const stageNorm = (stageInput || '').toLowerCase().trim();

  if (!isSowingDateValid) {
    // Missing or invalid sowing date: inspect farmer stage input
    if (stageNorm.includes('plant') || stageNorm.includes('sown') || stageNorm.includes('germ') || stageNorm.includes('emerg')) {
      maturityPercent = 0;
      cropStage = 'Just planted';
    } else if (stageNorm.includes('grow') || stageNorm.includes('veg')) {
      maturityPercent = 25;
      cropStage = 'Vegetative';
    } else if (stageNorm.includes('tiller') || stageNorm.includes('branch')) {
      maturityPercent = 45;
      cropStage = 'Tillering';
    } else if (stageNorm.includes('flower') || stageNorm.includes('ear') || stageNorm.includes('pollin')) {
      maturityPercent = 65;
      cropStage = 'Flowering';
    } else if (stageNorm.includes('fill') || stageNorm.includes('pod') || stageNorm.includes('bulk') || stageNorm.includes('grain forming')) {
      maturityPercent = 80;
      cropStage = 'Grain Fill';
    } else if (stageNorm.includes('nearly ready') || stageNorm.includes('late') || stageNorm.includes('matur') || stageNorm.includes('turn')) {
      maturityPercent = 90;
      cropStage = 'Late maturity';
    } else if (stageNorm.includes('harvest') || stageNorm.includes('ready') || stageNorm.includes('ripe')) {
      maturityPercent = 98;
      cropStage = 'Harvest Ready';
    } else {
      // No valid date and unknown/unspecified stage: safe truthful baseline
      maturityPercent = 0;
      cropStage = 'Planting date required';
    }
  } else if (cropAgeDays === 0) {
    // Sowing date is today or future: age = 0, maturity = 0%, never harvest ready!
    maturityPercent = 0;
    cropStage = 'Just planted';
  } else {
    // Valid sowing date with age > 0: calculate baseline maturity deterministically
    const baseMaturity = Math.min(100, Math.max(0, Math.round((cropAgeDays / profile.totalDurationDays) * 100)));

    if (stageNorm.includes('plant') || stageNorm.includes('sown') || stageNorm.includes('germ') || stageNorm.includes('emerg')) {
      // Farmer explicitly states just planted
      maturityPercent = Math.min(baseMaturity, 5);
      cropStage = 'Just planted';
    } else if (stageNorm.includes('grow') || stageNorm.includes('veg')) {
      maturityPercent = Math.min(35, Math.max(15, baseMaturity));
    } else if (stageNorm.includes('tiller') || stageNorm.includes('branch')) {
      maturityPercent = Math.min(50, Math.max(35, baseMaturity));
    } else if (stageNorm.includes('flower') || stageNorm.includes('ear') || stageNorm.includes('pollin')) {
      maturityPercent = Math.min(70, Math.max(50, baseMaturity));
    } else if (stageNorm.includes('fill') || stageNorm.includes('pod') || stageNorm.includes('bulk') || stageNorm.includes('grain forming')) {
      maturityPercent = Math.min(85, Math.max(70, baseMaturity));
    } else if (stageNorm.includes('nearly ready') || stageNorm.includes('late') || stageNorm.includes('matur') || stageNorm.includes('turn')) {
      maturityPercent = Math.min(94, Math.max(85, baseMaturity));
    } else if (stageNorm.includes('harvest') || stageNorm.includes('ready') || stageNorm.includes('ripe')) {
      maturityPercent = Math.max(95, baseMaturity);
    } else {
      // 'Not sure' or no stage input: use pure age-derived calendar maturity
      maturityPercent = baseMaturity;
    }

    // Assign canonical stage label from calculated maturity
    if (maturityPercent >= 95) cropStage = 'Harvest Ready';
    else if (maturityPercent >= 88) cropStage = 'Late maturity';
    else if (maturityPercent >= 70) cropStage = 'Grain Fill';
    else if (maturityPercent >= 50) cropStage = 'Flowering';
    else if (maturityPercent >= 30) cropStage = 'Tillering';
    else if (maturityPercent >= 10) cropStage = 'Vegetative';
    else cropStage = 'Just planted';
  }

  // Ensure maturity is strictly bounded in [0, 100]
  maturityPercent = Math.min(100, Math.max(0, maturityPercent));

  const gddTarget = profile.targetGdd;
  const gddAccumulated = Math.round((maturityPercent / 100) * gddTarget);

  // Moisture drops physiologically as crop approaches harvest maturity
  let moisturePercent = profile.defaultMoisturePercent;
  if (cropStage === 'Harvest Ready') {
    moisturePercent = +(profile.defaultMoisturePercent * 0.95).toFixed(1);
  } else if (cropStage === 'Late maturity') {
    moisturePercent = profile.defaultMoisturePercent;
  } else if (cropStage === 'Grain Fill') {
    moisturePercent = +(profile.defaultMoisturePercent * 1.35).toFixed(1);
  } else if (cropStage === 'Flowering') {
    moisturePercent = +(profile.defaultMoisturePercent * 1.5).toFixed(1);
  } else if (cropStage === 'Tillering') {
    moisturePercent = +(profile.defaultMoisturePercent * 1.65).toFixed(1);
  } else if (cropStage === 'Vegetative') {
    moisturePercent = +(profile.defaultMoisturePercent * 1.75).toFixed(1);
  } else {
    // Just planted / Planting date required (high vegetative/seed moisture)
    moisturePercent = +(profile.defaultMoisturePercent * 1.8).toFixed(1);
  }

  // Harvest readiness requires at least 90% physiological maturity
  const isReadyForHarvest = maturityPercent >= 90;

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
    const remainingDays = Math.max(7, profile.totalDurationDays - cropAgeDays);
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
    cropAgeDays,
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
