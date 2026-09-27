import React, { useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { StatusPill } from '../shell/StatusPill';
import { useFarm } from '../../context/FarmContext';
import { 
  MapPin, 
  Droplets, 
  CloudRain, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp
} from 'lucide-react';

interface FarmTwinProps {
  interactive?: boolean;
  className?: string;
  showInspectorPill?: boolean;
}

export type TwinLayer = 'surface' | 'weather' | 'soil' | 'maturity' | 'market';

export const FarmTwin: React.FC<FarmTwinProps> = ({ 
  className = '',
  showInspectorPill = true 
}) => {
  const { state, snapshot, setActiveTab, setSelectedProvenance, executionState } = useFarm();
  const [activeLayer, setActiveLayer] = useState<TwinLayer>('surface');

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Camera angles tailored to the active layer
  const getCameraBaseAngles = () => {
    switch (activeLayer) {
      case 'weather':
        return { baseRotX: 18, baseRotY: 0, scale: 0.96 };
      case 'soil':
        return { baseRotX: 34, baseRotY: -4, scale: 1.04 };
      case 'maturity':
        return { baseRotX: 10, baseRotY: 0, scale: 1.02 };
      case 'market':
        return { baseRotX: 20, baseRotY: 6, scale: 0.95 }; // Wider landscape for mandi vectors
      case 'surface':
      default:
        return { baseRotX: 24, baseRotY: 0, scale: 1.0 };
    }
  };

  const { baseRotX, baseRotY, scale } = getCameraBaseAngles();

  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [baseRotX + 4, baseRotX - 4]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [baseRotY - 6, baseRotY + 6]), springConfig);
  const layerParallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);
  const layerParallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const weatherRisk = snapshot?.weather.rainRiskLevel || 'HIGH';
  const rainProb = snapshot?.weather.precipitationProbability48h || state.weather.rainfallProbability48h;
  const overallConf = snapshot ? Math.round(snapshot.overallConfidence * 100) : Math.round(state.currentDecision.confidence * 100);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full aspect-[16/11] md:aspect-[16/10] rounded-3xl p-6 md:p-8 overflow-hidden select-none transition-all duration-500 ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* Dynamic Atmospheric Atmosphere */}
      <div 
        className={`absolute inset-0 transition-colors duration-700 ${
          weatherRisk === 'HIGH' || weatherRisk === 'CRITICAL'
            ? 'bg-gradient-to-b from-[#EDF3EF] via-[#E4ECE7] to-[#D5E2D9]'
            : 'bg-gradient-to-b from-[#F5F8F5] via-[#EEF4EF] to-[#E2EBE4]'
        }`} 
      />
      
      {/* Background grid */}
      <div className="absolute inset-0 topo-grid opacity-35 pointer-events-none" />

      {/* Atmospheric Rain Streaks Overlay */}
      {(weatherRisk === 'HIGH' || weatherRisk === 'CRITICAL' || activeLayer === 'weather') && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-35">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="20%" y1="0" x2="16%" y2="100%" stroke="#0284C7" strokeWidth="1.2" strokeDasharray="6 14" className="animate-pulse" />
            <line x1="45%" y1="0" x2="41%" y2="100%" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="8 18" className="animate-pulse" />
            <line x1="70%" y1="0" x2="66%" y2="100%" stroke="#0284C7" strokeWidth="1.2" strokeDasharray="5 12" className="animate-pulse" />
            <line x1="88%" y1="0" x2="84%" y2="100%" stroke="#0284C7" strokeWidth="1.4" strokeDasharray="7 16" className="animate-pulse" />
          </svg>
        </div>
      )}

      {/* Header controls & Layer Switcher */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div 
            onClick={() => setSelectedProvenance(snapshot?.weather.metadata || null)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-primary border border-emerald-900/10 cursor-pointer hover:border-emerald-700/30 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${
              state.systemStatus.weatherApiOnline ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500 animate-ping'
            }`} />
            <span className="tech-label font-bold text-emerald-950">SPATIAL TWIN</span>
          </div>

          {showInspectorPill && (
            <StatusPill status={snapshot?.weather.metadata.status || state.weather.telemetry} size="xs" pulse />
          )}
        </div>

        {/* 5-Layer Camera & Spatial State Switcher */}
        <div className="flex items-center p-0.5 rounded-xl glass-secondary border border-zinc-200/80 text-xs font-medium flex-wrap">
          <button
            onClick={() => setActiveLayer('surface')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeLayer === 'surface'
                ? 'bg-white text-emerald-900 shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Field
          </button>
          <button
            onClick={() => setActiveLayer('weather')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeLayer === 'weather'
                ? 'bg-white text-sky-900 shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <CloudRain className="w-3 h-3" />
            <span>Weather</span>
          </button>
          <button
            onClick={() => setActiveLayer('market')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeLayer === 'market'
                ? 'bg-white text-emerald-900 shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-emerald-700" />
            <span>Markets</span>
          </button>
          <button
            onClick={() => setActiveLayer('soil')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeLayer === 'soil'
                ? 'bg-white text-amber-900 shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>Soil</span>
          </button>
          <button
            onClick={() => setActiveLayer('maturity')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeLayer === 'maturity'
                ? 'bg-white text-emerald-900 shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Maturity</span>
          </button>
        </div>
      </div>

      {/* Main 3D Perspective Isometric Canvas */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full flex items-center justify-center -mt-2 transition-transform duration-700"
      >
        {/* Ground shadow plane */}
        <div 
          className="absolute w-[84%] h-[76%] rounded-[3.5rem] bg-emerald-950/10 blur-2xl transform translate-y-12 translate-z-0"
        />

        {/* Dynamic Farm State Orbit Ring */}
        <div className="absolute w-[94%] h-[94%] max-w-[680px] pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 600 400" className="w-full h-full">
            <g transform="translate(300, 210) scale(1, 0.65)" fill="none" strokeWidth="2.5">
              <path
                d="M -230,0 A 230,230 0 0,1 -80,-215"
                stroke={state.systemStatus.weatherApiOnline ? '#0284C7' : '#F59E0B'}
                strokeDasharray={state.systemStatus.weatherApiOnline ? 'none' : '4 4'}
                className="opacity-75"
              />
              <path
                d="M -60,-222 A 230,230 0 0,1 120,-195"
                stroke={state.systemStatus.marketFeedOnline ? '#10B981' : '#F59E0B'}
                className="opacity-75"
              />
              <path
                d="M 140,-182 A 230,230 0 0,1 230,0"
                stroke="#D97706"
                className="opacity-75"
              />
              <path
                d="M 230,0 A 230,230 0 0,1 60,222"
                stroke="#059669"
                className="opacity-75"
              />
              <path
                d="M 40,226 A 230,230 0 0,1 -230,0"
                stroke="#34D399"
                className="opacity-75"
              />
            </g>
          </svg>
        </div>

        {/* Primary Field Geometry Stack */}
        <svg
          viewBox="0 0 600 400"
          className="absolute w-[90%] h-[90%] max-w-[650px] transition-all duration-700"
          style={{ transform: 'translateZ(15px)' }}
        >
          <defs>
            <linearGradient id="soilBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9B69B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#A89274" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="fieldSurfaceGrad" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#8DA362" />
              <stop offset="45%" stopColor="#B3BE62" />
              <stop offset="85%" stopColor="#D4A747" />
              <stop offset="100%" stopColor="#C88E35" />
            </linearGradient>

            <linearGradient id="weatherAtmosphereGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="subsurfaceSoilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#92400E" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="maturityIndexGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#D97706" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0.9" />
            </linearGradient>

            <pattern id="cropFurrows3" width="16" height="16" patternTransform="rotate(28 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(255,255,255,0.24)" strokeWidth="2.5" />
              <line x1="8" y1="0" x2="8" y2="16" stroke="rgba(14,44,23,0.08)" strokeWidth="1.5" />
            </pattern>

            <pattern id="soilChemGrid3" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.4)" />
              <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <line x1="10" y1="0" x2="10" y2="20" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Under-bed Soil Elevation Shadow */}
          <path
            d="M 95 110 Q 280 60 495 100 Q 535 230 480 325 Q 310 365 115 315 Q 60 220 95 110 Z"
            fill="url(#soilBaseGrad)"
            transform="translate(4, 8)"
            opacity="0.7"
          />

          {/* Primary Field Boundary Polygon */}
          <path
            d="M 95 110 Q 280 60 495 100 Q 535 230 480 325 Q 310 365 115 315 Q 60 220 95 110 Z"
            fill={
              activeLayer === 'surface' || activeLayer === 'market'
                ? 'url(#fieldSurfaceGrad)'
                : activeLayer === 'weather'
                ? 'url(#weatherAtmosphereGrad)'
                : activeLayer === 'soil'
                ? 'url(#subsurfaceSoilGrad)'
                : 'url(#maturityIndexGrad)'
            }
            className="transition-all duration-700 cursor-pointer"
            filter="drop-shadow(0 14px 24px rgba(14, 44, 23, 0.18))"
          />

          {/* Furrow / Mesh Overlays */}
          {(activeLayer === 'surface' || activeLayer === 'market') && (
            <path
              d="M 95 110 Q 280 60 495 100 Q 535 230 480 325 Q 310 365 115 315 Q 60 220 95 110 Z"
              fill="url(#cropFurrows3)"
              opacity="0.85"
              className="pointer-events-none"
            />
          )}

          {activeLayer === 'soil' && (
            <path
              d="M 95 110 Q 280 60 495 100 Q 535 230 480 325 Q 310 365 115 315 Q 60 220 95 110 Z"
              fill="url(#soilChemGrid3)"
              className="pointer-events-none"
            />
          )}

          {/* Spatial Mandi Routing Vectors (When MARKET Layer Active) */}
          {activeLayer === 'market' && (
            <g className="pointer-events-none">
              {/* Route to Unnao Mandi (Optimal - Solid Green) */}
              <line x1="300" y1="200" x2="520" y2="80" stroke="#10B981" strokeWidth="2.5" strokeDasharray="4 4" className="animate-pulse" />
              <circle cx="520" cy="80" r="8" fill="#065F46" stroke="#FFFFFF" strokeWidth="2" />

              {/* Route to Kanpur Chakeri (Sub-optimal - Blue) */}
              <line x1="300" y1="200" x2="480" y2="340" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="3 3" />
              <circle cx="480" cy="340" r="6" fill="#0369A1" stroke="#FFFFFF" strokeWidth="1.5" />

              {/* Route to Chaubepur (Short - Amber) */}
              <line x1="300" y1="200" x2="100" y2="80" stroke="#D97706" strokeWidth="1.8" strokeDasharray="3 3" />
              <circle cx="100" cy="80" r="6" fill="#B45309" stroke="#FFFFFF" strokeWidth="1.5" />

              {/* Route to Pukhrayan (Distant - Rose) */}
              <line x1="300" y1="200" x2="80" y2="340" stroke="#E11D48" strokeWidth="1.8" strokeDasharray="4 4" />
              <circle cx="80" cy="340" r="6" fill="#BE123C" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>
          )}

          {/* Perimeter line */}
          <path
            d="M 95 110 Q 280 60 495 100 Q 535 230 480 325 Q 310 365 115 315 Q 60 220 95 110 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth="2.5"
            className="filter drop-shadow-sm"
          />

          {/* Probe Pin */}
          <g transform="translate(290, 195)" className="cursor-pointer" onClick={() => setSelectedProvenance(snapshot?.soil.metadata || null)}>
            <circle r="18" fill="rgba(255,255,255,0.3)" className="animate-ping" />
            <circle r="8" fill="#143E22" stroke="#FFFFFF" strokeWidth="2" />
            <circle r="3" fill="#34D399" />
          </g>
        </svg>

        {/* Floating Spatial Instrumentation Tags */}
        <motion.div
          style={{
            x: layerParallaxX,
            y: layerParallaxY,
            transform: 'translateZ(50px)',
          }}
          className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4"
        >
          {/* Top Left: Field Metadata Badge */}
          <div className="self-start pointer-events-auto flex items-center gap-2">
            <div 
              onClick={() => setActiveTab('field')}
              className="glass-primary px-3.5 py-2 rounded-2xl shadow-glass-sm flex items-center gap-3 border border-white/80 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-xs">
                07
              </div>
              <div>
                <div className="text-[11px] font-mono font-medium text-emerald-900 tracking-wider">
                  {(state.fieldName || 'FIELD 01').toUpperCase()} • {state.areaAcres} ACRES
                </div>
                <div className="text-xs font-semibold text-zinc-900">
                  {state.crop} ({state.variety})
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/80 border border-emerald-800/20 text-[10px] font-mono shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 living-pulse" />
              <span className="font-bold text-emerald-950">EXECUTION:</span>
              <span className="text-zinc-600">
                {executionState.activePlan.steps.filter(s => s.status === 'COMPLETED').length}/10 STEPS
              </span>
            </div>
          </div>

          {/* Center: Dynamic Market / Weather Overlay Tag */}
          <div className="self-center transform -translate-y-2 pointer-events-auto">
            {activeLayer === 'market' ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="glass-primary px-3.5 py-1.5 rounded-xl shadow-glass-md flex items-center gap-2 border border-emerald-600/40 text-emerald-950 cursor-pointer"
                onClick={() => setActiveTab('markets')}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[11px] font-mono">
                  {state.market.destinations[0]?.name || 'Primary Mandi'} ({state.market.destinations[0]?.distanceKm || 28}km):
                </span>
                <span className="text-xs font-bold font-mono text-emerald-900">
                  ₹{(state.currentDecision.expectedFinancials.expectedValueInr || (state.estimatedHarvestQuintals * (state.market.modalPrice - 42))).toLocaleString('en-IN')} Net
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1.5 rounded-xl shadow-glass-md flex items-center gap-2 border cursor-pointer ${
                  weatherRisk === 'HIGH' || weatherRisk === 'CRITICAL'
                    ? 'glass-primary border-amber-500/40 text-amber-950'
                    : 'glass-primary border-emerald-500/30 text-emerald-950'
                }`}
                onClick={() => setSelectedProvenance(snapshot?.weather.metadata || null)}
              >
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-[11px] font-mono">Storm Threat:</span>
                <span className="text-xs font-bold font-mono text-amber-900">{rainProb}% in 48h</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </motion.div>
            )}
          </div>

          {/* Bottom Right: Composite Confidence Orbit Badge */}
          <div className="self-end pointer-events-auto">
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => setActiveTab('what-if')}
              className="paper-card px-4 py-2 rounded-2xl shadow-sm flex items-center gap-3 cursor-pointer border border-[rgba(23,74,50,0.12)] bg-[#FFFDF8]"
            >
              <div className="flex flex-col text-right">
                <span className="text-[9.5px] font-bold text-[#5E9B68] tracking-wider uppercase font-sans">
                  Forecast Assurance
                </span>
                <span className="text-xs font-black text-[#173A2A] tracking-wide font-sans">
                  {overallConf}% Confidence
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#EAF3EC] flex items-center justify-center text-[#174A32]">
                <ShieldCheck className="w-4 h-4 text-[#174A32]" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="relative z-20 flex items-center justify-between pt-2 border-t border-emerald-950/5 text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-emerald-700" />
          <span>{state.location.coordinates[0].toFixed(4)}°N, {state.location.coordinates[1].toFixed(4)}°E</span>
          <span className="text-zinc-300">•</span>
          <span>{state.location.village ? `${state.location.village}, ${state.location.district}` : `${state.location.district} Corridor`}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span className="text-emerald-900 font-semibold">Layer: {activeLayer.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
