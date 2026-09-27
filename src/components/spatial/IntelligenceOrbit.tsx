/**
 * KISAN COMPASS — Floating Intelligence Orbit Nodes (Rain AI Experience)
 * 
 * Renders spatial telemetry nodes orbiting around Field 07:
 * - Weather Radar Node (Precipitation Risk)
 * - Market Arbitrage Node (Unnao Modal Price)
 * - Logistics Vector Node (Dedicated Haulage)
 * - Agronomic Soil Node (GDD Thermal Maturity)
 */

import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { 
  CloudRain, 
  TrendingUp, 
  Truck, 
  Sprout, 
  ChevronRight
} from 'lucide-react';

interface Props {
  onSelectNode?: (nodeCategory: 'WEATHER' | 'MARKET' | 'LOGISTICS' | 'SOIL') => void;
}

export const IntelligenceOrbit: React.FC<Props> = ({ onSelectNode }) => {
  const { state, setActiveTab, setSelectedProvenance } = useFarm();

  const rainProb = state.weather.rainfallProbability48h || 68;
  const modalPrice = state.market.modalPrice || 2380;
  const gddProgress = Math.min(100, Math.round((state.gddAccumulated / state.gddTarget) * 100));

  const handleWeatherClick = () => {
    setSelectedProvenance({
      status: state.systemStatus.weatherApiOnline ? 'LIVE' : 'CACHED',
      sourceName: 'Open-Meteo Numerical Forecast',
      provider: 'Open-Meteo GmbH (ECMWF IFS / DWD ICON)',
      fetchedAt: '12m ago',
      ageMinutes: 12,
      confidence: 0.92,
      usedBy: ['Precipitation Risk Window', 'Harvest Timing Matrix'],
      isFallback: !state.systemStatus.weatherApiOnline
    });
    if (onSelectNode) onSelectNode('WEATHER');
  };

  const handleMarketClick = () => {
    setActiveTab('markets');
    if (onSelectNode) onSelectNode('MARKET');
  };

  const handleLogisticsClick = () => {
    setSelectedProvenance({
      status: 'LIVE',
      sourceName: 'Geodesic Haversine Matrix & Mandi Tariff',
      provider: 'Deterministic Transport Tariff (1.25x Rural Detour)',
      fetchedAt: '35m ago',
      ageMinutes: 35,
      confidence: 0.91,
      usedBy: ['Mandi Arbitrage Matrix', 'Net-Realization Optimizer'],
      isFallback: false
    });
    if (onSelectNode) onSelectNode('LOGISTICS');
  };

  const handleSoilClick = () => {
    setSelectedProvenance({
      status: state.systemStatus.soilCatalogOnline ? 'LIVE' : 'CACHED',
      sourceName: 'ICAR Benchmark Soil Profile',
      provider: 'ICAR-IARI Soil Health Benchmark Data',
      fetchedAt: '3h ago',
      ageMinutes: 180,
      confidence: 0.96,
      usedBy: ['GDD Thermal Maturity', 'Moisture Desiccation'],
      isFallback: !state.systemStatus.soilCatalogOnline
    });
    if (onSelectNode) onSelectNode('SOIL');
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {/* 1. Weather Radar Orbit Node */}
      <div 
        onClick={handleWeatherClick}
        className="rain-intelligence-node p-3.5 rounded-2xl cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#405048]">
            <CloudRain className="w-3.5 h-3.5 text-[#4E8FA8]" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Weather Forecast</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4E8FA8] living-pulse" />
        </div>

        <div className="mt-2 space-y-0.5">
          <div className="text-base font-bold text-[#102117] font-sans flex items-baseline gap-1">
            <span>{rainProb}%</span>
            <span className="text-xs font-normal text-[#C8753D]">Storm Risk</span>
          </div>
          <div className="text-[10px] font-mono text-[#69776F]">
            48h front • 36h operational window
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] font-mono text-[#1B5E35]">
          <span className="font-semibold">Open-Meteo Live</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 2. Mandi Arbitrage Orbit Node */}
      <div 
        onClick={handleMarketClick}
        className="rain-intelligence-node p-3.5 rounded-2xl cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#405048]">
            <TrendingUp className="w-3.5 h-3.5 text-[#2E7D4A]" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Optimal Mandi</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4A]" />
        </div>

        <div className="mt-2 space-y-0.5">
          <div className="text-base font-bold text-[#102117] font-sans flex items-baseline gap-1">
            <span>₹{modalPrice}</span>
            <span className="text-[10px] font-normal text-[#1B5E35] font-mono">/ Qtl</span>
          </div>
          <div className="text-[10px] font-mono text-[#1B5E35] font-semibold">
            Unnao Yard (+₹920 Net Gain)
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] font-mono text-[#1B5E35]">
          <span className="font-semibold">AGMARKNET APMC</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 3. Logistics Vector Orbit Node */}
      <div 
        onClick={handleLogisticsClick}
        className="rain-intelligence-node p-3.5 rounded-2xl cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#405048]">
            <Truck className="w-3.5 h-3.5 text-[#6E9F6F]" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Freight Route</span>
          </div>
          <span className="text-[10px] font-mono text-[#69776F]">28 km</span>
        </div>

        <div className="mt-2 space-y-0.5">
          <div className="text-base font-bold text-[#102117] font-sans flex items-baseline gap-1">
            <span>₹1,340</span>
            <span className="text-[10px] font-normal text-[#69776F] font-mono">Haul</span>
          </div>
          <div className="text-[10px] font-mono text-[#69776F]">
            Dedicated HGV • NH-27 Bypass
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] font-mono text-[#1B5E35]">
          <span className="font-semibold">Haversine Matrix</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 4. Biological Soil & GDD Maturity Node */}
      <div 
        onClick={handleSoilClick}
        className="rain-intelligence-node p-3.5 rounded-2xl cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#405048]">
            <Sprout className="w-3.5 h-3.5 text-[#1B5E35]" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Crop Maturity</span>
          </div>
          <span className="px-1.5 py-0.2 rounded bg-[#DCEBDA] text-[9px] font-mono text-[#123D25] font-bold">
            {gddProgress}%
          </span>
        </div>

        <div className="mt-2 space-y-0.5">
          <div className="text-base font-bold text-[#102117] font-sans flex items-baseline gap-1">
            <span>1,845</span>
            <span className="text-[10px] font-mono text-[#69776F]">/ 1,950 GDD</span>
          </div>
          <div className="text-[10px] font-mono text-[#2E7D4A]">
            Moisture 13.2% (APMC Grade A)
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] font-mono text-[#1B5E35]">
          <span className="font-semibold">ICAR Benchmark</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
