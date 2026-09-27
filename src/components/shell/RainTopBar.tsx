/**
 * KISAN COMPASS — Rain AI-Level Ultra-Thin Spatial Top Bar
 * 
 * Replaces stacked clunky navbars with a single, elegant floating glass bar.
 * Provides spatial navigation (FIELD, DECISION, WHAT-IF, MARKETS, MEMORY)
 * alongside live truth telemetry, Trust Center, and Judge Mode.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFarm, NavigationTab } from '../../context/FarmContext';
import { buildTruthContracts, buildTruthInventory } from '../../services/truthRegistry';
import { 
  Sprout, 
  Sliders, 
  TrendingUp, 
  History, 
  Sparkles, 
  AlertTriangle,
  GitCommit,
  Layers,
  ChevronDown
} from 'lucide-react';

export const RainTopBar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    state, 
    snapshot, 
    forecast, 
    evaluationRun,
    setIsDecisionProofOpen,
    setIsJudgeModeOpen,
    setIsEvaluationLabOpen,
    toggleApiFailure
  } = useFarm();

  const [showTruthDropdown, setShowTruthDropdown] = useState(false);
  const [showResilienceDrawer, setShowResilienceDrawer] = useState(false);

  const contracts = React.useMemo(() => {
    return buildTruthContracts(state, snapshot, forecast, evaluationRun);
  }, [state, snapshot, forecast, evaluationRun]);

  const inventory = React.useMemo(() => {
    return buildTruthInventory(contracts);
  }, [contracts]);

  const tabs: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'compass', label: 'FIELD', icon: Sprout },
    { id: 'what-if', label: 'WHAT-IF', icon: Sliders },
    { id: 'markets', label: 'MARKETS', icon: TrendingUp },
    { id: 'decisions', label: 'MEMORY', icon: History },
  ];

  const hasFailure = !state.systemStatus.weatherApiOnline || 
                     !state.systemStatus.marketFeedOnline || 
                     !state.systemStatus.soilCatalogOnline || 
                     !state.systemStatus.forecastEngineOnline;

  return (
    <header className="sticky top-3 z-50 w-full max-w-6xl mx-auto px-3 sm:px-4 select-none">
      <div className="rain-glass-surface rounded-2xl px-3 py-2 flex items-center justify-between gap-3 shadow-ambient transition-all">
        
        {/* Left: Brand Identity & Agricultural Mark */}
        <div 
          onClick={() => setActiveTab('compass')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          {/* Custom Agricultural Contour Compass Icon */}
          <div className="relative w-7 h-7 rounded-xl bg-[#123D25] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4 text-[#A8C6A5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3" strokeLinecap="round" />
              <polygon points="12,7 15,12 12,17 9,12" fill="currentColor" fillOpacity="0.6" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#6E9F6F] living-pulse" />
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-xs tracking-tight text-[#102117] font-sans">
              KISAN COMPASS
            </span>
            <span className="hidden lg:inline text-[9px] font-mono text-[#69776F] uppercase tracking-wider">
              • FIELD 07
            </span>
          </div>
        </div>

        {/* Center: Spatial Navigation Switcher */}
        <nav className="flex items-center p-0.5 rounded-xl bg-black/[0.03] border border-black/[0.04]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive ? 'text-[#123D25] font-bold' : 'text-[#69776F] hover:text-[#102117]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavHighlight"
                    className="absolute inset-0 rounded-lg bg-white shadow-xs border border-black/[0.06]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1B5E35]' : 'text-[#9AA7A0]'}`} />
                  <span className="text-[11px] tracking-wide">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Truth Status, Judge Mode & Resilience Control */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Truth Telemetry Status Pill */}
          <div className="relative">
            <button
              onClick={() => setShowTruthDropdown(!showTruthDropdown)}
              className="rain-glass-pill px-2.5 py-1 rounded-lg text-[10px] font-mono text-[#405048] flex items-center gap-1.5 hover:text-[#102117] transition-colors cursor-pointer"
              title="Inspect Live Truth Contracts"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${inventory.cachedCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-[#2E7D4A] living-pulse'}`} />
              <span className="font-semibold">{inventory.liveCount} LIVE</span>
              {inventory.cachedCount > 0 && (
                <span className="text-amber-700 font-bold">• {inventory.cachedCount} CACHED</span>
              )}
              <ChevronDown className="w-2.5 h-2.5 text-[#9AA7A0]" />
            </button>

            {/* Quick Truth Dropdown Popover */}
            {showTruthDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.08] shadow-elevated z-50 font-mono text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06]">
                  <span className="font-bold text-[#102117] text-[11px]">DATA-ORIGIN CONTRACT</span>
                  <span className="text-[10px] text-[#2E7D4A] font-semibold">{inventory.compositeAssurance} ASSURANCE</span>
                </div>

                <div className="space-y-1 text-[10px] text-[#405048]">
                  <div className="flex justify-between">
                    <span>Active Sources:</span>
                    <strong className="text-[#102117]">{inventory.totalContracts} Contracts</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified Telemetry:</span>
                    <span className="text-[#2E7D4A] font-bold">{inventory.liveCount} Live APIs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fallback Caching:</span>
                    <span>{inventory.cachedCount} Preserved</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Historical Baselines:</span>
                    <span>{inventory.historicalCount} Empirical</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => {
                      setShowTruthDropdown(false);
                      setIsDecisionProofOpen(true);
                    }}
                    className="w-full py-1.5 rounded-lg bg-[#123D25] hover:bg-[#1B5E35] text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <GitCommit className="w-3 h-3 text-[#A8C6A5]" />
                    <span>Trace Full Lineage</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Failure Resilience Indicator Pill */}
          {hasFailure && (
            <button
              onClick={() => setShowResilienceDrawer(true)}
              className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer animate-pulse"
              title="Telemetry Offline — Click to inspect fallback"
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>DEGRADED</span>
            </button>
          )}

          {/* Judge Mode Trigger Button */}
          <button
            onClick={() => setIsJudgeModeOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-[#FFF0C9] hover:bg-[#E8B65A]/40 text-[#652309] border border-[#E8B65A]/60 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            title="Start Guided Hackathon Demonstration Tour"
          >
            <Sparkles className="w-3 h-3 text-[#D99A2B]" />
            <span className="hidden sm:inline">JUDGE</span>
          </button>

          {/* Evaluation Lab Trigger */}
          <button
            onClick={() => setIsEvaluationLabOpen(true)}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white text-[#405048] hover:text-[#102117] border border-black/[0.08] text-[10px] font-mono font-semibold transition-all cursor-pointer"
            title="Open Scientific Evaluation Lab"
          >
            <Layers className="w-3 h-3 text-[#1B5E35]" />
            <span>EVAL</span>
          </button>
        </div>

      </div>

      {/* Resilience Simulation Drawer (When Opened) */}
      {showResilienceDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-5 rounded-3xl bg-white border border-black/[0.1] shadow-modal space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-[#102117] font-sans">
                  Failure Resilience & Graceful Fallback
                </h3>
              </div>
              <button
                onClick={() => setShowResilienceDrawer(false)}
                className="text-[#69776F] hover:text-[#102117]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#405048] font-sans leading-relaxed">
              When telemetry APIs fail, KISAN COMPASS does not invent hallucinated values. It transitions deterministically:
              <strong> LIVE &rarr; CACHED &rarr; BASELINE &rarr; UNKNOWN</strong> with reduced assurance.
            </p>

            <div className="space-y-2 pt-1">
              {[
                { key: 'weatherApiOnline' as const, label: 'Open-Meteo NWP Forecast', isOnline: state.systemStatus.weatherApiOnline },
                { key: 'marketFeedOnline' as const, label: 'AGMARKNET APMC Benchmark', isOnline: state.systemStatus.marketFeedOnline },
                { key: 'soilCatalogOnline' as const, label: 'ICAR Benchmark Soil Profile', isOnline: state.systemStatus.soilCatalogOnline },
                { key: 'forecastEngineOnline' as const, label: 'Parameterized Quantile Engine', isOnline: state.systemStatus.forecastEngineOnline },
              ].map((item) => (
                <div key={item.key} className="p-2.5 rounded-xl bg-[#F7F9F7] border border-black/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#102117]">{item.label}</span>
                  <button
                    onClick={() => toggleApiFailure(item.key)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      item.isOnline 
                        ? 'bg-[#DCEBDA] text-[#123D25] border border-[#6E9F6F]' 
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {item.isOnline ? 'ONLINE' : 'CACHED FALLBACK'}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowResilienceDrawer(false)}
              className="w-full py-2 rounded-xl bg-[#123D25] text-white font-bold text-xs cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
