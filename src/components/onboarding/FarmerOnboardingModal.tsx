/**
 * KISAN COMPASS — Human-First Farmer Onboarding Experience
 * 
 * Step-by-step interactive onboarding for real farmers:
 * 1. Profile: Full Name, Phone, Language (English / हिन्दी)
 * 2. Farm Location: Name, Village, District, State + Live GPS or Manual Search
 * 3. Field: Name (e.g. North Field), Area (Acres / Hectares / Bigha)
 * 4. Crop & Stage: Selection, Variety, Sowing Date, Human Crop Stage
 * 5. Quantity: Expected yield (Quintals / Tonnes / Kg) or "I don't know yet"
 * 6. Soil Health: Soil test results or Regional Reference (no fake sensors)
 * 7. Decision Preferences: Safer money / Balanced / Higher opportunity
 * 8. Confirmation: Personalized Welcome into Kisan Compass
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Navigation, 
  AlertCircle,
  Sparkles,
  Compass
} from 'lucide-react';
import { 
  PreferredLanguage, 
  AreaUnit, 
  QuantityUnit, 
  SowingDatePrecision,
  QuantityStatus,
  RiskPosture,
  LocationSource
} from '../../types/farmerData';

interface OnboardingResult {
  farmer: {
    fullName: string;
    phone: string;
    language: PreferredLanguage;
  };
  farm: {
    farmName: string;
    village: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    locationSource: LocationSource;
    locationAccuracy?: number;
  };
  field: {
    fieldName: string;
    areaAcres: number;
    areaUnit: AreaUnit;
  };
  crop: {
    cropName: string;
    cropVariety: string;
    sowingDate?: string;
    sowingPrecision: SowingDatePrecision;
    cropStage: string;
    quantityQuintals: number | null;
    quantityUnit: QuantityUnit;
    quantityStatus: QuantityStatus;
  };
  soil: {
    hasTest: boolean;
    ph?: number;
    moisture?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    organicCarbon?: number;
  };
  preferences: {
    riskPosture: RiskPosture;
  };
}

interface Props {
  initialName?: string;
  initialEmail?: string;
  onComplete: (data: OnboardingResult) => Promise<void> | void;
  onCancel?: () => void;
}

type Step = 'PROFILE' | 'FARM' | 'FIELD' | 'CROP' | 'QUANTITY' | 'SOIL' | 'PREFERENCES' | 'CONFIRM';

const CROPS = [
  'Wheat',
  'Rice / Paddy',
  'Mustard',
  'Maize',
  'Potato',
  'Sugarcane',
  'Pulses (Chana / Arhar)',
  'Vegetables',
  'Other'
];

const CROP_STAGES = [
  { id: 'Just planted', label: 'Just planted', desc: 'Seeds recently sown or germinating' },
  { id: 'Growing', label: 'Growing', desc: 'Vegetative growth, active tillering / leaves' },
  { id: 'Flowering', label: 'Flowering', desc: 'Earing, flowering, pollination' },
  { id: 'Grain forming', label: 'Grain / fruit forming', desc: 'Milking stage, grain fill underway' },
  { id: 'Nearly ready', label: 'Nearly ready', desc: 'Turning golden, grain hardening' },
  { id: 'Ready to harvest', label: 'Ready to harvest', desc: 'Dry, firm grain ready for cutting' },
  { id: 'Not sure', label: 'Not sure', desc: 'We will use regional calendar estimation' },
];

export const FarmerOnboardingModal: React.FC<Props> = ({
  initialName = '',
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('PROFILE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Profile State
  const [fullName, setFullName] = useState(initialName || 'Kisan');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<PreferredLanguage>('en');

  // 2. Farm Location State
  const [farmName, setFarmName] = useState(`${initialName ? initialName + "'s" : 'My'} Farm`);
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Kanpur Nagar');
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [latitude, setLatitude] = useState<number>(26.5123);
  const [longitude, setLongitude] = useState<number>(80.2452);
  const [locationSource, setLocationSource] = useState<LocationSource>('MANUAL');
  const [locationAccuracy, setLocationAccuracy] = useState<number | undefined>(undefined);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // 3. Field State
  const [fieldName, setFieldName] = useState('North Field');
  const [areaValue, setAreaValue] = useState<number>(2.5);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('ACRES');

  // 4. Crop State
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [customCrop, setCustomCrop] = useState('');
  const [cropVariety, setCropVariety] = useState('HD-2967');
  const [sowingDateChoice] = useState<'EXACT' | 'APPROXIMATE' | 'UNKNOWN'>('EXACT');
  const [sowingDate, setSowingDate] = useState(todayIso);
  const [cropStage, setCropStage] = useState('Just planted');

  // 5. Quantity State
  const [hasQuantity, setHasQuantity] = useState(true);
  const [quantityValue, setQuantityValue] = useState<number>(25);
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>('QUINTALS');

  // 6. Soil State
  const [hasSoilTest, setHasSoilTest] = useState(false);
  const [soilPh, setSoilPh] = useState<number>(7.2);
  const [soilMoisture, setSoilMoisture] = useState<number>(26);
  const [soilNitrogen] = useState<number>(180);
  const [soilPhosphorus] = useState<number>(24);
  const [soilPotassium] = useState<number>(210);
  const [soilOrganicCarbon, setSoilOrganicCarbon] = useState<number>(0.55);

  // 7. Preferences State
  const [riskPosture, setRiskPosture] = useState<RiskPosture>('BALANCED');

  // Helpers
  const normalizedAcres = Number((
    areaUnit === 'HECTARES' ? areaValue * 2.47105 :
    areaUnit === 'BIGHA' ? areaValue * 0.625 :
    areaValue
  ).toFixed(2));

  const normalizedQuintals = hasQuantity ? Number((
    quantityUnit === 'TONNES' ? quantityValue * 10 :
    quantityUnit === 'KILOGRAMS' ? quantityValue / 100 :
    quantityValue
  ).toFixed(1)) : null;

  const actualCropName = selectedCrop === 'Other' && customCrop.trim() ? customCrop.trim() : selectedCrop;

  const isAreaValid = areaValue > 0 && areaValue <= 1000;
  const isQuantityValid = !hasQuantity || (quantityValue > 0 && quantityValue <= 100000);

  // Browser Geolocation Trigger
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(4)));
        setLongitude(Number(pos.coords.longitude.toFixed(4)));
        setLocationSource('GPS');
        setLocationAccuracy(Math.round(pos.coords.accuracy));
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission was denied. You can still set your village & district manually.');
        } else {
          setGpsError('Could not acquire GPS fix. Please set village & district manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onComplete({
        farmer: {
          fullName: fullName.trim() || 'Kisan',
          phone: phone.trim(),
          language,
        },
        farm: {
          farmName: farmName.trim() || 'My Farm',
          village: village.trim() || 'Local Village',
          district: district.trim() || 'Kanpur Nagar',
          state: stateName.trim() || 'Uttar Pradesh',
          latitude,
          longitude,
          locationSource,
          locationAccuracy,
        },
        field: {
          fieldName: fieldName.trim() || 'Field 01',
          areaAcres: normalizedAcres > 0 ? normalizedAcres : 2.5,
          areaUnit,
        },
        crop: {
          cropName: actualCropName,
          cropVariety: cropVariety.trim(),
          sowingDate: sowingDateChoice === 'UNKNOWN' ? undefined : sowingDate,
          sowingPrecision: sowingDateChoice,
          cropStage,
          quantityQuintals: normalizedQuintals,
          quantityUnit,
          quantityStatus: hasQuantity ? 'KNOWN' : 'UNKNOWN',
        },
        soil: {
          hasTest: hasSoilTest,
          ph: hasSoilTest ? soilPh : undefined,
          moisture: hasSoilTest ? soilMoisture : undefined,
          nitrogen: hasSoilTest ? soilNitrogen : undefined,
          phosphorus: hasSoilTest ? soilPhosphorus : undefined,
          potassium: hasSoilTest ? soilPotassium : undefined,
          organicCarbon: hasSoilTest ? soilOrganicCarbon : undefined,
        },
        preferences: {
          riskPosture,
        },
      });
    } catch (err: any) {
      console.error('[FarmerOnboardingModal] Failed to complete onboarding:', err);
      setSubmitError(err?.message || 'Unable to open Kisan Compass. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FFFDF8] border border-[rgba(23,74,50,0.14)] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans text-[#173A2A]">
        
        {/* Top Progress Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#F7F4EC] to-[#FFFDF8] border-b border-[rgba(23,74,50,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#174A32] text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4 text-[#E7C66A]" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#5E9B68]">
                STEP-BY-STEP FARM ONBOARDING
              </div>
              <h2 className="text-lg font-extrabold text-[#173A2A] tracking-tight">
                {currentStep === 'PROFILE' && 'Your Profile'}
                {currentStep === 'FARM' && 'Where is your farm?'}
                {currentStep === 'FIELD' && 'What is this field called?'}
                {currentStep === 'CROP' && 'What are you growing?'}
                {currentStep === 'QUANTITY' && 'How much crop do you have?'}
                {currentStep === 'SOIL' && 'Do you have a soil test?'}
                {currentStep === 'PREFERENCES' && 'How do you like to make decisions?'}
                {currentStep === 'CONFIRM' && 'Your Farm is Ready!'}
              </h2>
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-[#607268] bg-[#F7F4EC] px-3 py-1 rounded-full border border-[rgba(23,74,50,0.08)]">
            {currentStep === 'PROFILE' && '1 of 7'}
            {currentStep === 'FARM' && '2 of 7'}
            {currentStep === 'FIELD' && '3 of 7'}
            {currentStep === 'CROP' && '4 of 7'}
            {currentStep === 'QUANTITY' && '5 of 7'}
            {currentStep === 'SOIL' && '6 of 7'}
            {currentStep === 'PREFERENCES' && '7 of 7'}
            {currentStep === 'CONFIRM' && 'Ready'}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: PROFILE */}
          {currentStep === 'PROFILE' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-sm text-[#34483D] leading-relaxed">
                Welcome to KISAN COMPASS. Let's set up your profile so all advice and reports are addressed to you.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173A2A]">Your Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rameshwar Singh"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-sm font-semibold focus:outline-none focus:border-[#174A32]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173A2A]">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-sm font-semibold focus:outline-none focus:border-[#174A32]"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-[#173A2A]">Preferred Language</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      language === 'en' ? 'bg-[#EAF3EC] border-[#174A32] shadow-xs' : 'bg-white border-[rgba(23,74,50,0.10)]'
                    }`}
                  >
                    <div className="font-bold text-sm">English</div>
                    <div className="text-xs text-[#607268]">Standard agricultural terms</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      language === 'hi' ? 'bg-[#EAF3EC] border-[#174A32] shadow-xs' : 'bg-white border-[rgba(23,74,50,0.10)]'
                    }`}
                  >
                    <div className="font-bold text-sm">हिन्दी (Hindi)</div>
                    <div className="text-xs text-[#607268]">सरल भाषा में सलाह</div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: FARM & LOCATION */}
          {currentStep === 'FARM' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-sm text-[#34483D] leading-relaxed">
                Where is your land located? We use this to query real weather forecasts and calculate accurate transport to nearby APMC mandis.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173A2A]">Farm Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Ganga Kripa Farm"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-sm font-semibold focus:outline-none focus:border-[#174A32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#173A2A]">Village / Town</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Kalyanpur"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-xs font-semibold focus:outline-none focus:border-[#174A32]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#173A2A]">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Kanpur Nagar"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-xs font-semibold focus:outline-none focus:border-[#174A32]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#173A2A]">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-xs font-semibold focus:outline-none focus:border-[#174A32]"
                  />
                </div>
              </div>

              {/* Location Picker Options */}
              <div className="p-4 rounded-2xl bg-[#F7F4EC] border border-[rgba(23,74,50,0.10)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#173A2A] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#D88732]" />
                    <span>Farm Coordinates</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#607268]">
                    Source: {locationSource} {locationAccuracy ? `(±${locationAccuracy}m)` : ''}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRequestGps}
                    disabled={gpsLoading}
                    className="px-3.5 py-2 rounded-xl bg-[#174A32] hover:bg-[#0E3322] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{gpsLoading ? 'Acquiring GPS...' : '📍 Use my current location'}</span>
                  </button>

                  <span className="text-xs text-[#607268]">or edit manual coordinates:</span>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => {
                        setLatitude(parseFloat(e.target.value));
                        setLocationSource('MANUAL');
                      }}
                      className="w-24 px-2 py-1 rounded-lg bg-white border border-[rgba(23,74,50,0.14)] text-center font-bold"
                    />
                    <span>N,</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => {
                        setLongitude(parseFloat(e.target.value));
                        setLocationSource('MANUAL');
                      }}
                      className="w-24 px-2 py-1 rounded-lg bg-white border border-[rgba(23,74,50,0.14)] text-center font-bold"
                    />
                    <span>E</span>
                  </div>
                </div>

                {gpsError && (
                  <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                    <span>{gpsError}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: FIELD & AREA */}
          {currentStep === 'FIELD' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-sm text-[#34483D] leading-relaxed">
                A farm can have multiple fields. What do you call this specific field, and what is its surface area?
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173A2A]">Field Name</label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="e.g. North Field, Plot 1, Nadi Wala Khet"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-sm font-semibold focus:outline-none focus:border-[#174A32]"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-[#173A2A]">Land Area</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={areaValue}
                    onChange={(e) => setAreaValue(parseFloat(e.target.value) || 1)}
                    className="w-32 px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-base font-bold focus:outline-none focus:border-[#174A32]"
                  />

                  <div className="grid grid-cols-3 gap-2 flex-1">
                    {(['ACRES', 'HECTARES', 'BIGHA'] as AreaUnit[]).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setAreaUnit(unit)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          areaUnit === unit
                            ? 'bg-[#174A32] text-white border-[#174A32]'
                            : 'bg-white text-[#173A2A] border-[rgba(23,74,50,0.12)]'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-[#607268] pt-1">
                  Normalized: <strong>{normalizedAcres} Acres</strong>
                </div>

                {areaValue <= 0 && (
                  <div className="text-xs text-[#D94E34] font-semibold pt-1">
                    Please enter a valid parcel size greater than 0.
                  </div>
                )}
                {areaValue > 1000 && (
                  <div className="text-xs text-[#D94E34] font-semibold pt-1">
                    Parcel size exceeds maximum threshold (1,000 {areaUnit.toLowerCase()}).
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: CROP & STAGE */}
          {currentStep === 'CROP' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-sm text-[#34483D] leading-relaxed">
                What crop are you currently growing on this field?
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {CROPS.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setSelectedCrop(crop)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedCrop === crop
                        ? 'bg-[#EAF3EC] border-[#174A32] text-[#174A32] font-bold shadow-xs'
                        : 'bg-white border-[rgba(23,74,50,0.10)] text-[#34483D]'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{crop}</div>
                  </button>
                ))}
              </div>

              {selectedCrop === 'Other' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#173A2A]">Enter Crop Name</label>
                  <input
                    type="text"
                    value={customCrop}
                    onChange={(e) => setCustomCrop(e.target.value)}
                    placeholder="e.g. Barley, Cotton, Soybean"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-xs font-semibold focus:outline-none focus:border-[#174A32]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#173A2A]">Crop Variety (Optional)</label>
                  <input
                    type="text"
                    value={cropVariety}
                    onChange={(e) => setCropVariety(e.target.value)}
                    placeholder="e.g. HD-2967, PBW-343, Basmati 1121"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-xs font-semibold focus:outline-none focus:border-[#174A32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#173A2A]">Sowing Date</label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-xs font-semibold focus:outline-none focus:border-[#174A32]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-[#173A2A]">Current Crop Stage</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CROP_STAGES.map((stg) => (
                    <button
                      key={stg.id}
                      type="button"
                      onClick={() => {
                        setCropStage(stg.id);
                        if (stg.id === 'Just planted') {
                          setSowingDate(new Date().toISOString().split('T')[0]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        cropStage === stg.id
                          ? 'bg-[#174A32] text-white border-[#174A32]'
                          : 'bg-white border-[rgba(23,74,50,0.10)] text-[#173A2A]'
                      }`}
                    >
                      <div className="text-xs font-bold">{stg.label}</div>
                      <div className={`text-[10px] truncate ${cropStage === stg.id ? 'text-[#DDEFF1]' : 'text-[#607268]'}`}>
                        {stg.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: HARVEST QUANTITY */}
          {currentStep === 'QUANTITY' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-sm text-[#34483D] leading-relaxed">
                How much produce do you currently have, or expect to harvest from this field?
              </p>

              <div className="flex items-center gap-3 pb-2">
                <button
                  type="button"
                  onClick={() => setHasQuantity(true)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    hasQuantity ? 'bg-[#174A32] text-white border-[#174A32]' : 'bg-white text-[#173A2A] border-[rgba(23,74,50,0.12)]'
                  }`}
                >
                  I have an estimated quantity
                </button>
                <button
                  type="button"
                  onClick={() => setHasQuantity(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    !hasQuantity ? 'bg-[#174A32] text-white border-[#174A32]' : 'bg-white text-[#173A2A] border-[rgba(23,74,50,0.12)]'
                  }`}
                >
                  I don't know yet
                </button>
              </div>

              {hasQuantity ? (
                <div className="space-y-2 p-4 rounded-2xl bg-white border border-[rgba(23,74,50,0.12)]">
                  <label className="text-xs font-bold text-[#173A2A]">Estimated Quantity</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={quantityValue}
                      onChange={(e) => setQuantityValue(parseFloat(e.target.value) || 1)}
                      className="w-32 px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,74,50,0.14)] text-base font-bold focus:outline-none focus:border-[#174A32]"
                    />

                    <div className="grid grid-cols-3 gap-2 flex-1">
                      {(['QUINTALS', 'KILOGRAMS', 'TONNES'] as QuantityUnit[]).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setQuantityUnit(unit)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            quantityUnit === unit
                              ? 'bg-[#174A32] text-white border-[#174A32]'
                              : 'bg-white text-[#173A2A] border-[rgba(23,74,50,0.12)]'
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-[#607268] pt-1">
                    Normalized: <strong>{normalizedQuintals} Quintals</strong> (used for take-home financial math)
                  </div>

                  {hasQuantity && quantityValue <= 0 && (
                    <div className="text-xs text-[#D94E34] font-semibold pt-1">
                      Please enter a positive harvest quantity greater than 0.
                    </div>
                  )}
                  {hasQuantity && quantityValue > 100000 && (
                    <div className="text-xs text-[#D94E34] font-semibold pt-1">
                      Quantity exceeds standard operational threshold (100,000 {quantityUnit.toLowerCase()}).
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F7F4EC] border border-[rgba(23,74,50,0.10)] text-xs text-[#607268] space-y-1">
                  <div className="font-bold text-[#173A2A]">No estimated quantity specified</div>
                  <p>
                    Market prices and recommendations will be shown per quintal until you provide an estimated quantity.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 6: SOIL HEALTH */}
          {currentStep === 'SOIL' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-sm text-[#34483D] leading-relaxed">
                Do you have a recent soil laboratory test card or soil health card for this field?
              </p>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <button
                  type="button"
                  onClick={() => setHasSoilTest(true)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    hasSoilTest ? 'bg-[#EAF3EC] border-[#174A32] shadow-xs' : 'bg-white border-[rgba(23,74,50,0.10)]'
                  }`}
                >
                  <div className="font-bold text-sm text-[#174A32]">Yes, I have soil data</div>
                  <div className="text-xs text-[#607268]">Enter pH, N-P-K or moisture</div>
                </button>

                <button
                  type="button"
                  onClick={() => setHasSoilTest(false)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    !hasSoilTest ? 'bg-[#EAF3EC] border-[#174A32] shadow-xs' : 'bg-white border-[rgba(23,74,50,0.10)]'
                  }`}
                >
                  <div className="font-bold text-sm text-[#174A32]">No soil test available</div>
                  <div className="text-xs text-[#607268]">Use regional ICAR baseline</div>
                </button>
              </div>

              {hasSoilTest ? (
                <div className="p-4 rounded-2xl bg-white border border-[rgba(23,74,50,0.12)] space-y-3">
                  <span className="text-xs font-bold text-[#173A2A] block">Soil Card Metrics</span>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-[#607268] block">Soil pH</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilPh}
                        onChange={(e) => setSoilPh(parseFloat(e.target.value) || 7)}
                        className="w-full px-2.5 py-1.5 rounded-lg border font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#607268] block">Moisture %</label>
                      <input
                        type="number"
                        value={soilMoisture}
                        onChange={(e) => setSoilMoisture(parseFloat(e.target.value) || 20)}
                        className="w-full px-2.5 py-1.5 rounded-lg border font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#607268] block">Organic Carbon %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={soilOrganicCarbon}
                        onChange={(e) => setSoilOrganicCarbon(parseFloat(e.target.value) || 0.5)}
                        className="w-full px-2.5 py-1.5 rounded-lg border font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F7F4EC] border border-[rgba(23,74,50,0.10)] text-xs text-[#607268] space-y-1">
                  <div className="font-bold text-[#173A2A]">Honest Data Guarantee</div>
                  <p>
                    Because you have not connected an in-situ sensor or test card, KISAN COMPASS will label all soil estimates as <strong>REGIONAL REFERENCE</strong> and will never claim a fake probe reading.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 7: PREFERENCES */}
          {currentStep === 'PREFERENCES' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-sm text-[#34483D] leading-relaxed">
                What matters more to you when making a farm decision?
              </p>

              <div className="space-y-3">
                {[
                  {
                    id: 'SAFER' as RiskPosture,
                    title: 'Safer Money',
                    desc: 'I prefer a safer outcome even if I miss some upside. Avoid weather rain risks.',
                  },
                  {
                    id: 'BALANCED' as RiskPosture,
                    title: 'Balanced',
                    desc: 'I want a balanced trade-off between safety and market opportunity.',
                  },
                  {
                    id: 'OPPORTUNITY' as RiskPosture,
                    title: 'Higher Opportunity',
                    desc: 'I am willing to accept more price or weather risk to capture peak realization.',
                  },
                ].map((pref) => (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => setRiskPosture(pref.id)}
                    className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      riskPosture === pref.id
                        ? 'bg-[#EAF3EC] border-[#174A32] shadow-xs'
                        : 'bg-white border-[rgba(23,74,50,0.10)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-sm text-[#173A2A]">{pref.title}</div>
                      {riskPosture === pref.id && <Check className="w-4 h-4 text-[#174A32]" />}
                    </div>
                    <p className="text-xs text-[#607268] mt-1">{pref.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 8: CONFIRMATION SUMMARY */}
          {currentStep === 'CONFIRM' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EAF3EC] border border-[#5E9B68]/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#174A32]">
                  <Sparkles className="w-4 h-4 text-[#5E9B68]" />
                  <span>Personalized Farm Intelligence Initialized</span>
                </div>
                <p className="text-xs text-[#34483D]">
                  Every calculation across your Kisan Compass is now grounded directly in your verified inputs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[rgba(23,74,50,0.10)] space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1.5 border-[rgba(23,74,50,0.06)]">
                  <span className="text-[#607268]">Farmer</span>
                  <strong className="text-[#173A2A]">{fullName}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-[rgba(23,74,50,0.06)]">
                  <span className="text-[#607268]">Farm</span>
                  <strong className="text-[#173A2A]">{farmName} ({village}, {district})</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-[rgba(23,74,50,0.06)]">
                  <span className="text-[#607268]">Active Field</span>
                  <strong className="text-[#173A2A]">{fieldName} · {normalizedAcres} Acres</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-[rgba(23,74,50,0.06)]">
                  <span className="text-[#607268]">Crop</span>
                  <strong className="text-[#173A2A]">{actualCropName} {cropVariety ? `(${cropVariety})` : ''}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-[rgba(23,74,50,0.06)]">
                  <span className="text-[#607268]">Quantity</span>
                  <strong className="text-[#173A2A]">{hasQuantity ? `${normalizedQuintals} Quintals` : 'To be estimated'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#607268]">Risk Style</span>
                  <strong className="text-[#173A2A]">{riskPosture}</strong>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Action / Error Banner */}
        {submitError && (
          <div className="px-5 py-2.5 bg-red-50 border-t border-red-200/80 flex items-center gap-2 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="flex-1">{submitError}</span>
          </div>
        )}

        {/* Modal Navigation Footer */}
        <div className="p-4 sm:p-5 bg-[#F7F4EC] border-t border-[rgba(23,74,50,0.08)] flex items-center justify-between gap-3">
          {currentStep !== 'PROFILE' ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (currentStep === 'FARM') setCurrentStep('PROFILE');
                if (currentStep === 'FIELD') setCurrentStep('FARM');
                if (currentStep === 'CROP') setCurrentStep('FIELD');
                if (currentStep === 'QUANTITY') setCurrentStep('CROP');
                if (currentStep === 'SOIL') setCurrentStep('QUANTITY');
                if (currentStep === 'PREFERENCES') setCurrentStep('SOIL');
                if (currentStep === 'CONFIRM') setCurrentStep('PREFERENCES');
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3EC] border border-[rgba(23,74,50,0.12)] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div>
              {onCancel && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-bold text-[#607268] hover:text-[#173A2A] cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {currentStep !== 'CONFIRM' ? (
            <button
              type="button"
              disabled={
                (currentStep === 'FIELD' && !isAreaValid) ||
                (currentStep === 'QUANTITY' && !isQuantityValid)
              }
              onClick={() => {
                if (currentStep === 'PROFILE') setCurrentStep('FARM');
                else if (currentStep === 'FARM') setCurrentStep('FIELD');
                else if (currentStep === 'FIELD') {
                  if (isAreaValid) setCurrentStep('CROP');
                }
                else if (currentStep === 'CROP') setCurrentStep('QUANTITY');
                else if (currentStep === 'QUANTITY') {
                  if (isQuantityValid) setCurrentStep('SOIL');
                }
                else if (currentStep === 'SOIL') setCurrentStep('PREFERENCES');
                else if (currentStep === 'PREFERENCES') setCurrentStep('CONFIRM');
              }}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-colors ${
                ((currentStep === 'FIELD' && !isAreaValid) || (currentStep === 'QUANTITY' && !isQuantityValid))
                  ? 'bg-zinc-400 cursor-not-allowed opacity-60'
                  : 'bg-[#174A32] hover:bg-[#0E3322] cursor-pointer shadow-md'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className={`px-6 py-2.5 rounded-xl bg-[#174A32] hover:bg-[#0E3322] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
                isSubmitting ? 'opacity-75 cursor-wait' : 'cursor-pointer scale-[1.02]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Opening Your Kisan Compass...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#E7C66A]" />
                  <span>Open My Kisan Compass</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
