/**
 * KISAN COMPASS — Human-First FeaturePageShell
 * 
 * Reconstructed according to the Human-First Product Redesign:
 * 1. Warm Agricultural Paper Header:
 *    - Left: ← Compass / Kisan Compass (Your farm, at a glance)
 *    - Center: Clean domain navigation ([Field] [Advice] [Market] [Memory] [Trust])
 *    - Right: ● Everything is up to date • Language toggle (EN / हि) • Ramesh user pill
 * 2. Compact "Today" Context Bar:
 *    - Shows date, parcel status, and urgent notice across all pages
 * 3. Human Status Strip Footer:
 *    - 5 live sources • 1 older source • Human approval required
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FeatureId, FEATURES, FEATURE_ORDER } from '../../config/features';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { ArrowLeft, LogOut, Globe, CloudRain } from 'lucide-react';

interface FeaturePageShellProps {
  featureId: FeatureId;
  onBackToWheel: () => void;
  onNavigateToFeature?: (featureId: FeatureId) => void;
  children: React.ReactNode;
}

export const FeaturePageShell: React.FC<FeaturePageShellProps> = ({
  featureId,
  onBackToWheel,
  onNavigateToFeature,
  children,
}) => {
  const { user, logout } = useAuth();
  const { state, activeField, activeCropCycle } = useFarm();
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden select-none bg-[#F7F4EC]">
      
      {/* 1. Global Paper Header */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[rgba(23,74,50,0.08)] shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity & Return to Wheel */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWheel}
              className="group px-3.5 py-1.5 rounded-full bg-[#F7F4EC] hover:bg-[#EFE2C8] border border-[rgba(23,74,50,0.12)] text-[#174A32] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Return to Compass Wheel"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-[#174A32]" />
              <span className="font-extrabold tracking-wide font-sans">{lang === 'hi' ? 'कम्पास' : 'Compass'}</span>
            </button>

            <span className="text-[rgba(23,74,50,0.2)] hidden sm:inline">•</span>

            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-extrabold text-[#174A32] font-sans leading-none">
                Kisan Compass
              </span>
              <span className="text-[11px] text-[#607268] mt-0.5 font-sans">
                {lang === 'hi' ? 'आपकी खेती, एक नज़र में' : 'Your farm, at a glance'}
              </span>
            </div>
          </div>

          {/* Center: Clean Segmented Navigation */}
          {onNavigateToFeature && (
            <nav className="flex items-center p-1 rounded-full bg-[#F7F4EC] border border-[rgba(23,74,50,0.09)] shadow-2xs">
              {FEATURE_ORDER.map((fId) => {
                const isCurrent = fId === featureId;
                const feat = FEATURES[fId];
                const Icon = feat.icon;

                return (
                  <button
                    key={fId}
                    onClick={() => onNavigateToFeature(fId)}
                    className={`relative px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent
                        ? 'text-white shadow-xs'
                        : 'text-[#607268] hover:text-[#174A32] hover:bg-[#FFFDF8]'
                    }`}
                  >
                    {/* Animated Active Background Indicator */}
                    {isCurrent && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 rounded-full bg-[#174A32]"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{feat.name}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right: Operational Status, Language & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Friendly Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF8] border border-[rgba(23,74,50,0.09)] text-[11px] text-[#174A32] font-sans shadow-2xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#5E9B68]" />
              <span>{lang === 'hi' ? 'सब कुछ अद्यतन है' : 'Everything is up to date'}</span>
            </div>

            {/* Language Toggle (EN / हिन्दी) */}
            <button
              onClick={() => setLang(prev => prev === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1 rounded-full bg-[#F7F4EC] hover:bg-[#EFE2C8] border border-[rgba(23,74,50,0.12)] text-[#174A32] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title="Toggle Language"
            >
              <Globe className="w-3 h-3 text-[#5E9B68]" />
              <span className="font-sans">{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* User Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDF8] border border-[rgba(23,74,50,0.12)] shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-[#174A32] text-white flex items-center justify-center text-[10px] font-bold">
                {user?.name ? user.name[0].toUpperCase() : (state.farmerName ? state.farmerName[0].toUpperCase() : 'F')}
              </div>
              <span className="text-xs font-bold text-[#17281F] font-sans hidden sm:inline">
                {user?.name?.split(' ')[0] || (state.farmerName ? state.farmerName.split(' ')[0] : 'Farmer')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#5E9B68]" />
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-full bg-[#FFFDF8] hover:bg-[#FBECEB] border border-[rgba(23,74,50,0.09)] text-[#607268] hover:text-[#D96B5F] transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Compact "Today" Context Bar (Section 27) */}
      <div className="w-full bg-[#F0ECE1] border-b border-[rgba(23,74,50,0.06)] px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="font-extrabold text-[#174A32] tracking-wide uppercase text-[11px]">
              TODAY · ACTIVE PARCEL
            </span>
            <span className="text-[rgba(23,74,50,0.25)]">•</span>
            <span className="text-[#304238]">
              {activeField?.field_name || state.fieldName} · {activeCropCycle?.crop_name || state.crop} {activeCropCycle?.crop_variety || state.variety} ({activeField?.area_acres || state.areaAcres} Acres)
            </span>
            <span className="text-[rgba(23,74,50,0.25)]">•</span>
            <span className="text-[#5E9B68] font-bold">94.6% Mature</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#B86A1D] font-bold bg-[#FBF0E3] px-2.5 py-0.5 rounded-full border border-[#D88732]/25">
            <CloudRain className="w-3.5 h-3.5" />
            <span>{state.weather.rainfallProbability48h >= 40 ? `Rain expected (${state.weather.rainfallProbability48h}%) within 48h` : 'Dry harvest window open'}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Page Body */}
      <motion.main
        key={featureId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 sm:py-7 space-y-6"
      >
        {children}
      </motion.main>

      {/* 4. Human System Status Strip Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3.5 border-t border-[rgba(23,74,50,0.07)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#607268] font-sans">
        {/* Status feeds */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5E9B68]" />
            <strong className="text-[#174A32]">5 live sources</strong>
          </span>
          <span className="text-[#93A098]">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D88732]" />
            <span>1 older source</span>
          </span>
          <span className="text-[#93A098]">•</span>
          <span className="text-[#304238] font-medium">
            Human approval required before any action
          </span>
        </div>

        <div className="text-[11px] text-[#78877D]">
          Kisan Compass · Unnao Regional Station
        </div>
      </footer>

    </div>
  );
};
