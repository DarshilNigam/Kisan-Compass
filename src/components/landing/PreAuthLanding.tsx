/**
 * KISAN COMPASS — PreAuthLanding Component (Hover-First Refinement)
 * 
 * First landing experience for unauthenticated users.
 * Interaction rule:
 * - HOVER = EXPLANATION (Card morphs immediately with zero clicks)
 * - MOUSE LEAVE = Neutral farm intelligence state
 * - TOUCH / CLICK = Selects domain on mobile, triggers authentication directly or via action card
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KisanWheel } from '../wheel/KisanWheel';
import { FeatureExplanationCard } from './FeatureExplanationCard';
import { FeatureAuthGate } from '../auth/FeatureAuthGate';
import { FeatureId } from '../../config/features';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

interface PreAuthLandingProps {
  onAuthenticatedNavigate: (featureId: FeatureId) => void;
}

export const PreAuthLanding: React.FC<PreAuthLandingProps> = ({
  onAuthenticatedNavigate,
}) => {
  const { openAuthGate } = useAuth();
  
  // Hover-driven state: null = neutral default card
  const [hoveredFeature, setHoveredFeature] = useState<FeatureId | null>(null);
  // Last active target feature for the auth gate
  const [targetAuthFeature, setTargetAuthFeature] = useState<FeatureId>('field');

  const handleHoverFeature = (fId: FeatureId | null) => {
    setHoveredFeature(fId);
    if (fId) {
      setTargetAuthFeature(fId);
    }
  };

  const handleClickFeature = (fId: FeatureId) => {
    setTargetAuthFeature(fId);
    // On touch screens or first tap: if not already hovered, select and reveal card first
    if (hoveredFeature !== fId) {
      setHoveredFeature(fId);
    } else {
      // If already active, trigger auth gate
      openAuthGate(fId);
    }
  };

  const handleAuthSuccess = (fId: FeatureId) => {
    onAuthenticatedNavigate(fId);
  };

  return (
    <div className="relative min-h-[calc(100vh-40px)] flex flex-col justify-between px-4 sm:px-8 py-3 sm:py-5 select-none overflow-x-hidden">
      
      {/* Subtle Top Instrument Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 border-b border-[rgba(22,58,40,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#163A28]" />
          <span className="font-extrabold tracking-widest text-[#163A28] text-sm font-sans">
            KISAN COMPASS
          </span>
          <span className="text-[#5F9CA8]">•</span>
          <span className="text-[11px] font-mono text-[#637168] hidden sm:inline">
            Spatial Agricultural Intelligence
          </span>
        </div>

        <button
          onClick={() => openAuthGate(targetAuthFeature)}
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#EEF2ED] border border-[rgba(22,58,40,0.12)] text-[#163A28] text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Lock className="w-3 h-3 text-[#3F7655]" />
          <span>SIGN IN</span>
        </button>
      </header>

      {/* Main Asymmetric Composition: Wheel Primary (~60%), Card Secondary (~35%) */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 py-4 sm:py-8">
        
        {/* Left Column: The Primary KisanWheel with 72° Spacing */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[560px] sm:min-h-[600px]">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-center text-[10px] font-mono text-[#637168] uppercase tracking-widest">
            EXPLORE THE FIVE COMPASS DOMAINS • CHOOSE ANY DOMAIN TO ENTER
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <KisanWheel
              selectedFeature={hoveredFeature}
              onHoverFeature={handleHoverFeature}
              onClickFeature={handleClickFeature}
              size="standard"
            />
          </motion.div>
        </div>

        {/* Right Column: Feature Explanation Glass Card */}
        <div className="w-full lg:w-[380px] xl:w-[410px] shrink-0 flex items-center justify-center">
          <FeatureExplanationCard
            featureId={hoveredFeature}
            onExplore={(fId) => {
              openAuthGate(fId || targetAuthFeature);
            }}
          />
        </div>

      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-7xl mx-auto py-3 border-t border-[rgba(22,58,40,0.06)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#637168]">
        <div className="flex items-center gap-2">
          <span>UP Regional Pilot Parcel 07</span>
          <span>•</span>
          <span>Open-Meteo High-Resolution Radar</span>
          <span>•</span>
          <span>AGMARKNET Mandi Network</span>
        </div>
        <div>
          Deterministic Decision Core v12.4
        </div>
      </footer>

      {/* Embedded Auth Gate */}
      <FeatureAuthGate
        targetFeature={targetAuthFeature}
        onSuccess={handleAuthSuccess}
      />

    </div>
  );
};
