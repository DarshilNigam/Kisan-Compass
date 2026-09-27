/**
 * KISAN COMPASS — AuthenticatedLanding Component (Radial Centered Operating System)
 * 
 * The central spatial home operating system after authentication.
 * The KisanWheel is strictly centered with NO explanation card.
 * Clicking any domain triggers a direct spatial transition into that feature page.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KisanWheel } from '../wheel/KisanWheel';
import { FeatureId, FEATURES } from '../../config/features';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { LogOut, ArrowRight, ShieldCheck, ChevronDown, Plus, Sparkles, MapPin } from 'lucide-react';

interface AuthenticatedLandingProps {
  onEnterFeature: (featureId: FeatureId) => void;
  onOpenJudgeMode?: () => void;
}

export const AuthenticatedLanding: React.FC<AuthenticatedLandingProps> = ({
  onEnterFeature,
  onOpenJudgeMode,
}) => {
  const { user, logout, pendingFeature } = useAuth();
  const { 
    activeField, 
    fields, 
    switchField, 
    isDemoMode, 
    toggleDemoMode, 
    setIsOnboardingModalOpen,
    activeCropCycle,
    activeFarm,
    state
  } = useFarm();

  const [selectedFeature, setSelectedFeature] = useState<FeatureId>(pendingFeature || 'decision');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [isFieldMenuOpen, setIsFieldMenuOpen] = useState<boolean>(false);

  const activeFeatureDef = FEATURES[selectedFeature];

  return (
    <div className="relative min-h-[calc(100vh-40px)] flex flex-col justify-between px-4 sm:px-8 py-3 sm:py-5 select-none overflow-x-hidden">
      
      {/* Top Floating Instrument Bar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 border-b border-[rgba(22,58,40,0.06)] relative z-40">
        
        {/* Brand identity & station info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#163A28] animate-pulse" />
            <span className="font-extrabold tracking-widest text-[#163A28] text-sm font-sans">
              KISAN COMPASS
            </span>
          </div>

          <span className="text-[#5F9CA8]">•</span>
          
          {/* Field Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setIsFieldMenuOpen(!isFieldMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2ED] hover:bg-[#E4ECE3] text-[#163A28] font-mono text-[11px] font-bold transition-all cursor-pointer border border-[rgba(22,58,40,0.08)] shadow-xs"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-[#D97706]' : 'bg-[#3F7655]'}`} />
              <span className="uppercase tracking-tight">
                {isDemoMode ? 'FIELD 07 (DEMO)' : (activeField?.field_name || state.fieldName || 'FIELD 01')}
              </span>
              <ChevronDown className="w-3 h-3 text-[#5A7363]" />
            </button>

            {/* Field Switcher Dropdown */}
            {isFieldMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl p-2 z-50 border border-[rgba(22,58,40,0.12)] shadow-xl text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 border-b border-[rgba(22,58,40,0.06)] text-[10px] font-mono uppercase font-bold text-[#637168] flex items-center justify-between">
                  <span>YOUR PARCELS</span>
                  <span className="text-[#3F7655]">{fields.length} TOTAL</span>
                </div>

                <div className="py-1 space-y-1">
                  {fields.map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        switchField(f.id);
                        setIsFieldMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                        activeField?.id === f.id && !isDemoMode
                          ? 'bg-[#163A28] text-white font-bold'
                          : 'hover:bg-[#EEF2ED] text-[#163A28]'
                      }`}
                    >
                      <span className="truncate">{f.field_name}</span>
                      <span className="text-[10px] opacity-75">{f.area_acres} ac</span>
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setIsFieldMenuOpen(false);
                      setIsOnboardingModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-mono text-[#3F7655] hover:bg-[#EEF2ED] flex items-center gap-1.5 font-bold transition-colors cursor-pointer border-t border-[rgba(22,58,40,0.06)] mt-1 pt-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Field</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Demo Mode Toggle Switch */}
          <button
            onClick={() => toggleDemoMode()}
            className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 border cursor-pointer ${
              isDemoMode 
                ? 'bg-[#FDF3D6] text-[#8C600B] border-[#D4AF37]/60 shadow-xs' 
                : 'bg-white/80 text-[#5A7363] border-[rgba(22,58,40,0.12)] hover:bg-[#EEF2ED]'
            }`}
            title={isDemoMode ? "Currently viewing synthetic Field 07 benchmark. Click to return to your real farm." : "Click to view the isolated benchmark demonstration dataset."}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-[#D97706] animate-pulse' : 'bg-[#3F7655]'}`} />
            <span>{isDemoMode ? 'DEMO MODE' : 'LIVE FARM'}</span>
          </button>
        </div>

        {/* Right side: Judge Mode trigger + User Account Dropdown */}
        <div className="flex items-center gap-3">
          {onOpenJudgeMode && (
            <button
              onClick={onOpenJudgeMode}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#EEF2ED] border border-[rgba(22,58,40,0.12)] text-[#163A28] font-mono text-[11px] font-bold transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#3F7655]" />
              <span>JUDGE PROOF</span>
            </button>
          )}

          {/* Account Pill */}
          <div className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[rgba(22,58,40,0.12)] hover:border-[#163A28]/30 shadow-xs transition-all cursor-pointer text-xs font-mono"
            >
              <div className="w-5 h-5 rounded-full bg-[#163A28] text-white flex items-center justify-center text-[10px] font-bold">
                {user?.name ? user.name[0].toUpperCase() : 'K'}
              </div>
              <span className="font-bold text-[#17221B] hidden md:inline">
                {user?.name || state.farmerName || 'Kisan'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F7655]" />
            </button>

            {/* Dropdown Menu */}
            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 tier-intelligence rounded-2xl p-2 z-50 border border-[rgba(22,58,40,0.12)] shadow-xl text-xs font-sans animate-in fade-in zoom-in-95 duration-150 bg-white">
                <div className="p-2 border-b border-[rgba(22,58,40,0.06)] space-y-0.5">
                  <div className="font-bold text-[#17221B] truncate">{user?.name || state.farmerName}</div>
                  <div className="text-[10px] font-mono text-[#637168] truncate">{user?.email || 'farmer@kisan.org'}</div>
                  <div className="text-[9px] font-mono text-[#3F7655] uppercase font-semibold flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{activeFarm ? `${activeFarm.village}, ${activeFarm.district}` : (isDemoMode ? 'Unnao Corridor' : 'Active Station')}</span>
                  </div>
                </div>

                <div className="p-1 space-y-1">
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      setIsOnboardingModalOpen(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl hover:bg-[#EEF2ED] text-[#163A28] text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#3F7655]" />
                    <span>Farm Configuration</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      toggleDemoMode();
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl hover:bg-[#EEF2ED] text-[#163A28] text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E7C66A]" />
                    <span>{isDemoMode ? 'Exit Demo Mode' : 'Explore Demo Mode'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl hover:bg-black/[0.04] text-[#D96A5F] text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer border-t border-[rgba(22,58,40,0.06)] pt-1.5 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>SIGN OUT</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </header>

      {/* Main Centered Spatial Compass */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-4 sm:py-8 relative">
        
        {/* Subtle Ambient Instruction */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1 mb-2"
        >
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] font-bold text-[#3F7655]">
            KISAN COMPASS • {activeFarm?.district ? `STATION ${activeFarm.district.toUpperCase()}` : (isDemoMode ? 'STATION UNNAO (DEMO)' : 'STATION LIVE')}
          </div>
          <div className="text-xs text-[#637168] font-mono">
            Select any domain on the compass to inspect field state, market arbitrage, and verified decisions
          </div>
        </motion.div>

        {/* The Centered Mathematically Spaced Wheel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <KisanWheel
            selectedFeature={selectedFeature}
            onHoverFeature={(fId) => {
              if (fId) setSelectedFeature(fId);
            }}
            onClickFeature={(fId) => {
              onEnterFeature(fId);
            }}
            size="large"
          />
        </motion.div>

        {/* Bottom Domain Quick Action Bar */}
        <motion.div
          key={selectedFeature}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="mt-6 flex flex-col sm:flex-row items-center gap-3 px-5 py-2.5 rounded-2xl tier-intelligence bg-white/90 border border-[rgba(22,58,40,0.10)] shadow-xs"
        >
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-[#163A28]">{activeFeatureDef.name}</span>
            <span className="text-[#5F9CA8]">•</span>
            <span className="text-[#637168]">{activeFeatureDef.tagline}</span>
          </div>

          <button
            onClick={() => onEnterFeature(selectedFeature)}
            className="px-4 py-1.5 rounded-xl bg-[#163A28] hover:bg-[#1D4B34] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>ENTER {activeFeatureDef.name}</span>
            <ArrowRight className="w-3 h-3 text-[#CFE0D5]" />
          </button>
        </motion.div>

      </main>

      {/* Minimal Footer with Real Field Data */}
      <footer className="w-full max-w-7xl mx-auto py-3 border-t border-[rgba(22,58,40,0.06)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#637168]">
        <div className="flex items-center gap-2">
          <span>Parcel: {activeField?.field_name || state.fieldName} ({activeField?.area_acres || state.areaAcres || 2.4} Acres)</span>
          <span>•</span>
          <span>{activeCropCycle?.crop_name || state.crop} {activeCropCycle?.crop_variety || state.variety}</span>
          <span>•</span>
          <span>{activeCropCycle?.quantity_quintals ? `${activeCropCycle.quantity_quintals} Quintals` : `${state.estimatedHarvestQuintals} Quintals`}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3F7655]" />
          <span>{isDemoMode ? 'Synthetic Demonstration Dataset (Isolated)' : 'Live Authenticated Tenant State'}</span>
        </div>
      </footer>

    </div>
  );
};
