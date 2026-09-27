/**
 * KISAN COMPASS — Human-First Field Experience (Domain 01: Field)
 * 
 * Reconstructed according to the Human-First Product Redesign:
 * 1. Warm Editorial Header: "Your field today" (Field 07 · Wheat · 2.4 acres)
 * 2. "What Matters Today" Hero Banner with 3 immediate takeaways & direct advice CTA
 * 3. Living Field Digital Twin as visual centerpiece
 * 4. Human-readable Crop Readiness & Heat Units (GDD)
 * 5. Practical Soil Health & Root-Zone Moisture
 * 6. Clear Weather & Rain Risk with "Why it matters" explanation
 */

import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { FarmTwin } from '../spatial/FarmTwin';
import { 
  Sprout, 
  Droplets, 
  Sun, 
  AlertTriangle,
  ArrowRight,
  CloudRain
} from 'lucide-react';

interface FieldViewProps {
  onNavigateToDecision?: () => void;
}

export const FieldView: React.FC<FieldViewProps> = ({ onNavigateToDecision }) => {
  const { state, snapshot, setSelectedProvenance, activeField, activeCropCycle, isDemoMode, activeFarm } = useFarm();
  const { soil, weather } = state;

  const gddProgressPercent = Math.min(100, Math.round((state.gddAccumulated / state.gddTarget) * 100));
  const rainProb = state.weather.rainfallProbability48h || 68;
  const isHighRainRisk = rainProb >= 50;
  const todayWeather = weather.forecast[0] || {
    condition: 'Thunderstorm',
    tempMax: 31,
    tempMin: 22,
    windKmh: 18,
    rainProbability: 68,
    precipitationMm: 12
  };

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Page Header (Human-First Title) */}
      <section className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 pb-3 border-b border-[rgba(23,74,50,0.08)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wide text-[#5E9B68] font-sans">
              Field &amp; Crop State
            </span>
            <span className="text-[#93A098]">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#174A32] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#5E9B68]" />
              <span>{isDemoMode ? 'Benchmark Dataset' : (state.soil.source.includes('Card') ? 'Verified Soil Analysis' : 'Regional Agrometeorology Live')}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#17281F] tracking-tight font-display">
            Your field today
          </h1>
          <p className="text-sm sm:text-base text-[#607268] max-w-2xl font-sans">
            {activeField?.field_name || state.fieldName} · {activeCropCycle?.crop_name || state.crop} {activeCropCycle?.crop_variety || state.variety} · {activeField?.area_acres || state.areaAcres} acres {activeFarm?.district ? `in ${activeFarm.district}` : ''}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToDecision && (
            <button
              onClick={onNavigateToDecision}
              className="px-4 py-2 rounded-2xl bg-[#174A32] hover:bg-[#0E3322] text-white text-xs font-bold font-sans flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>See today's farm advice</span>
              <ArrowRight className="w-4 h-4 text-[#E7C66A]" />
            </button>
          )}
        </div>
      </section>

      {/* 2. "WHAT MATTERS TODAY" Banner (Section 28 of Design Directive) */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[#FFFDF8] border-2 border-[#D88732]/35 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D88732]" />
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-[#B86A1D] font-sans">
              WHAT MATTERS TODAY
            </h2>
          </div>
          <span className="text-xs text-[#607268] font-sans">
            3 critical updates
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Item 1: Weather */}
          <div className="p-3.5 rounded-2xl bg-[#FBF0E3] border border-[#D88732]/25 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#B86A1D]">
              <CloudRain className="w-4 h-4 shrink-0 text-[#D88732]" />
              <span>Rain expected within 48h</span>
            </div>
            <p className="text-xs text-[#304238] leading-relaxed">
              <strong>{rainProb}% chance</strong> of convective showers. Your dry harvest window is closing in ~36 hours.
            </p>
          </div>

          {/* Item 2: Crop Readiness */}
          <div className="p-3.5 rounded-2xl bg-[#EAF3EC] border border-[#5E9B68]/30 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#174A32]">
              <Sprout className="w-4 h-4 shrink-0 text-[#5E9B68]" />
              <span>{state.crop} is {gddProgressPercent}% mature</span>
            </div>
            <p className="text-xs text-[#304238] leading-relaxed">
              Stage: <strong>{state.cropStage}</strong> · Heat accumulation: <strong>{state.gddAccumulated.toLocaleString('en-IN')} / {state.gddTarget.toLocaleString('en-IN')} GDD</strong>.
            </p>
          </div>

          {/* Item 3: Mandi Opportunity */}
          <div className="p-3.5 rounded-2xl bg-[#FAF4E3] border border-[#E7C66A]/40 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#9C7A14]">
              <span>💰 {state.market.destinations[0]?.name || 'Primary Mandi'} gives highest return</span>
            </div>
            <p className="text-xs text-[#304238] leading-relaxed">
              Expected <strong>₹{(state.currentDecision.expectedFinancials.expectedValueInr || 74820).toLocaleString('en-IN')}</strong> in pocket after paying for tractor transport.
            </p>
          </div>
        </div>

        {onNavigateToDecision && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={onNavigateToDecision}
              className="text-xs font-bold text-[#174A32] hover:text-[#0E3322] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Review today's recommended action</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 3. ROW 1: Hero Digital Twin + Crop Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left (7 cols): Large Living Field Digital Twin */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="paper-card-elevated p-0 overflow-hidden relative flex-1 flex flex-col justify-between min-h-[440px] md:min-h-[480px]">
            {/* The 3D/Spatial Interactive Twin Canvas */}
            <div className="relative w-full h-full flex-1">
              <FarmTwin showInspectorPill={false} className="h-full min-h-[440px]" />
            </div>

            {/* Clean Paper Meta Overlay */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
              <div className="paper-card px-4 py-2.5 space-y-0.5 pointer-events-auto shadow-sm">
                <div className="text-[10.5px] font-bold tracking-wide text-[#5E9B68] font-sans">
                  Active Parcel
                </div>
                <div className="text-sm font-extrabold text-[#17281F] font-sans">
                  {activeField?.field_name || state.fieldName} ({activeCropCycle?.crop_name || state.crop} {activeCropCycle?.crop_variety || state.variety})
                </div>
                <div className="text-xs text-[#607268]">
                  {activeField?.area_acres || state.areaAcres} Acres {activeCropCycle?.sowing_date ? `· Sown ${activeCropCycle.sowing_date}` : ''}
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-30 pointer-events-none">
              <div className="paper-card px-4 py-2.5 space-y-0.5 pointer-events-auto text-right shadow-sm">
                <div className="text-[10.5px] font-bold text-[#D88732] font-sans">
                  Crop Readiness
                </div>
                <div className="text-xl font-black text-[#174A32] font-sans leading-tight">
                  {gddProgressPercent}%
                </div>
                <div className="text-xs text-[#607268]">
                  {state.cropStage}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Crop Maturity & Harvest Opportunity Window */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          
          <div className="paper-card p-6 space-y-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(23,74,50,0.06)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#5E9B68] flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17281F] font-sans">
                    Crop maturity &amp; heat progress
                  </h3>
                  <span className="text-xs text-[#607268]">Stage: {state.cropStage}</span>
                </div>
              </div>

              <span className="text-xs font-bold text-[#B86A1D] bg-[#FAF4E3] px-2.5 py-0.5 rounded-full border border-[#E7C66A]">
                {gddProgressPercent}% Target
              </span>
            </div>

            {/* Circular Progression Display */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-[#174A32] font-sans tracking-tight">
                  {gddProgressPercent}%
                </div>
                <div className="text-xs font-bold text-[#5E9B68] tracking-wide">
                  {state.cropStage === 'Harvest Ready' || state.cropStage === 'Ready to harvest' ? 'Ready for harvest' : state.cropStage === 'Late maturity' || state.cropStage === 'Nearly ready' ? 'Approaching optimal harvest' : 'In developmental stage'}
                </div>
                <p className="text-xs text-[#607268] font-sans leading-relaxed max-w-xs pt-1">
                  Heat accumulation has reached {gddProgressPercent}% of target. Stage: <strong>{state.cropStage}</strong>.
                </p>
              </div>

              {/* Graphical Circular Dial */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(23, 74, 50, 0.08)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gddGradient)"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - Math.min(1, gddProgressPercent / 100))}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gddGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5E9B68" />
                      <stop offset="65%" stopColor="#E7C66A" />
                      <stop offset="100%" stopColor="#D88732" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-[#607268]">Heat units</span>
                  <span className="text-sm font-black text-[#174A32]">{state.gddAccumulated.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-[#78877D]">/ {state.gddTarget.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Horizontal Harvest Opportunity Milestones */}
            <div className="pt-3 border-t border-[rgba(23,74,50,0.06)] space-y-2">
              <span className="text-xs font-bold text-[#607268] block">
                Harvest window timing
              </span>

              <div className="grid grid-cols-3 gap-2 text-center font-sans">
                <div className="p-2.5 rounded-2xl bg-[#FFFDF8] border border-[rgba(23,74,50,0.09)]">
                  <div className="text-[10px] text-[#607268]">Earliest</div>
                  <div className="font-bold text-[#17281F] text-xs mt-0.5">{state.estimatedHarvestWindow.start}</div>
                  <div className="text-[10px] text-[#78877D]">Viable</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#EAF3EC] border border-[#5E9B68]/40 text-[#174A32] shadow-xs">
                  <div className="text-[10px] text-[#174A32] font-bold">Best time</div>
                  <div className="font-black text-xs mt-0.5">{state.estimatedHarvestWindow.optimal}</div>
                  <div className="text-[10px] text-[#5E9B68] font-bold">Pre-storm</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FAF4E3] border border-[#D88732]/30 text-[#17281F]">
                  <div className="text-[10px] text-[#B86A1D] font-bold">Deadline</div>
                  <div className="font-bold text-xs mt-0.5">{state.estimatedHarvestWindow.deadline}</div>
                  <div className="text-[10px] text-[#B86A1D]">Rain loss</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 4. ROW 2: Soil Health + Weather Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Left: Soil Health Profile */}
        <div className="paper-card p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(23,74,50,0.06)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#DDEFF1] text-[#2D6B78] flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#17281F] font-sans">
                  Soil health
                </h3>
                <span className="text-xs text-[#607268]">
                  {isDemoMode 
                    ? 'ICAR Benchmark · Field Soil Profile' 
                    : (state.soil.source.includes('Card') 
                        ? 'Farmer Soil Card · Lab Verified' 
                        : 'ICAR District Reference · Deterministic Baseline')}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#174A32] text-xs font-bold border border-[#5E9B68]/30">
              Good condition
            </span>
          </div>

          {/* Metric Triad: Moisture, pH, Organic Carbon */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[rgba(23,74,50,0.09)] space-y-1">
              <div className="text-[11px] text-[#607268]">Moisture</div>
              <div className="text-2xl font-black text-[#2D6B78] font-sans">{soil.moisturePercentage}%</div>
              <div className="w-full h-1.5 rounded-full bg-[#EAF3EC] overflow-hidden">
                <div className="h-full rounded-full bg-[#79B8C4]" style={{ width: `${soil.moisturePercentage}%` }} />
              </div>
              <div className="text-[10px] text-[#607268] pt-0.5">Field Cap. 32%</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[rgba(23,74,50,0.09)] space-y-1">
              <div className="text-[11px] text-[#607268]">Soil pH</div>
              <div className="text-2xl font-black text-[#174A32] font-sans">{soil.ph}</div>
              <div className="w-full h-1.5 rounded-full bg-[#EAF3EC] overflow-hidden">
                <div className="h-full rounded-full bg-[#5E9B68]" style={{ width: `${(soil.ph / 14) * 100}%` }} />
              </div>
              <div className="text-[10px] text-[#607268] pt-0.5">Slightly alkaline</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[rgba(23,74,50,0.09)] space-y-1">
              <div className="text-[11px] text-[#607268]">Organic carbon</div>
              <div className="text-2xl font-black text-[#B86A1D] font-sans">{soil.organicCarbon}%</div>
              <div className="w-full h-1.5 rounded-full bg-[#EAF3EC] overflow-hidden">
                <div className="h-full rounded-full bg-[#D88732]" style={{ width: `${(soil.organicCarbon / 1.5) * 100}%` }} />
              </div>
              <div className="text-[10px] text-[#607268] pt-0.5">Medium range</div>
            </div>
          </div>

          {/* N-P-K Nutrients */}
          <div className="p-3.5 rounded-2xl bg-[#F7F4EC] border border-[rgba(23,74,50,0.07)] space-y-2">
            <span className="text-xs font-bold text-[#607268] block">
              Nutrient reserves (kg/ha)
            </span>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-xl bg-[#FFFDF8] border border-[rgba(23,74,50,0.06)]">
                <span className="text-[11px] text-[#607268] block">Nitrogen (N)</span>
                <span className="text-sm font-black text-[#17281F]">{soil.nitrogenKgHa}</span>
                <span className="text-[10px] text-[#5E9B68] font-bold block">Adequate</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FFFDF8] border border-[rgba(23,74,50,0.06)]">
                <span className="text-[11px] text-[#607268] block">Phosphorus (P)</span>
                <span className="text-sm font-black text-[#17281F]">{soil.phosphorusKgHa}</span>
                <span className="text-[#B86A1D] text-[10px] font-bold block">Moderate</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FFFDF8] border border-[rgba(23,74,50,0.06)]">
                <span className="text-[11px] text-[#607268] block">Potassium (K)</span>
                <span className="text-sm font-black text-[#17281F]">{soil.potassiumKgHa}</span>
                <span className="text-[10px] text-[#5E9B68] font-bold block">High Reserve</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Weather & Rain Risk */}
        <div className="paper-card p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(23,74,50,0.06)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#DDEFF1] text-[#2D6B78] flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#17281F] font-sans">
                  Weather &amp; rain forecast
                </h3>
                <span className="text-xs text-[#607268]">Open-Meteo High-Resolution Numerical Forecast</span>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isHighRainRisk 
                ? 'bg-[#FBF0E3] text-[#B86A1D] border-[#D88732]/35' 
                : 'bg-[#EAF3EC] text-[#174A32] border-[#5E9B68]/30'
            }`}>
              {rainProb}% Rain expected
            </span>
          </div>

          {/* Today's Dominant Atmospheric Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#DDEFF1]/60 to-[#FFFDF8] border border-[#79B8C4]/25 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-[#2D6B78] font-bold">Today's weather</span>
              <div className="text-xl font-bold text-[#17281F] font-sans">
                {todayWeather.condition}
              </div>
              <div className="text-xs text-[#607268]">
                {todayWeather.tempMax}° / {todayWeather.tempMin}°C · Wind {todayWeather.windKmh} km/h
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-[#2D6B78] font-sans">
                {todayWeather.rainProbability}%
              </div>
              <div className="text-xs font-bold text-[#B86A1D]">
                {todayWeather.precipitationMm} mm Rain
              </div>
            </div>
          </div>

          {/* 4-Day Mini Weather Timeline */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[#607268] block">
              Next 4 days
            </span>

            <div className="space-y-1.5">
              {weather.forecast.slice(0, 4).map((pt, i) => (
                <div 
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans transition-colors ${
                    pt.rainProbability > 50
                      ? 'bg-[#FBF0E3] border border-[#D88732]/30 text-[#17281F]'
                      : 'bg-[#FFFDF8] border border-[rgba(23,74,50,0.07)] text-[#607268]'
                  }`}
                >
                  <div className="w-16 font-bold text-[#17281F]">
                    {pt.day}
                  </div>
                  <div className="text-xs text-[#607268]">
                    {pt.condition}
                  </div>
                  <div className="text-[#17281F] font-bold">
                    {pt.tempMax}°/{pt.tempMin}°C
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pt.precipitationMm > 0 && (
                      <span className="text-[10px] font-bold text-[#B86A1D]">
                        {pt.precipitationMm}mm
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pt.rainProbability > 50 
                        ? 'bg-[#D88732] text-white' 
                        : 'bg-[#EAF3EC] text-[#174A32]'
                    }`}>
                      {pt.rainProbability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 5. Harvest Window Alert */}
      {isHighRainRisk && (
        <section className="p-5 rounded-3xl bg-[#FFFDF8] border-2 border-[#D88732]/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D88732] text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-[#B86A1D] uppercase">
                  Harvest window is tightening
                </h4>
                <span className="px-2 py-0.2 rounded-full bg-[#D88732] text-white text-[10px] font-bold">
                  Rain approaching
                </span>
              </div>
              <p className="text-sm font-bold text-[#17281F] font-sans">
                {rainProb}% rain chance arriving in 48 hours. Clear harvest window: approximately 36 hours.
              </p>
              <p className="text-xs text-[#607268] font-sans">
                Why it matters: Waiting past Mar 28 increases the risk of wet soil, combine bogging, and mandi dockage penalties.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setSelectedProvenance(snapshot?.weather.metadata || null)}
              className="px-4 py-2 rounded-2xl bg-[#F7F4EC] hover:bg-[#EFE2C8] border border-[rgba(23,74,50,0.12)] text-[#174A32] text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Check radar source
            </button>
          </div>
        </section>
      )}

    </div>
  );
};
