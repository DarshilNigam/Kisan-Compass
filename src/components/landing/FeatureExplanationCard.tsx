/**
 * KISAN COMPASS — Feature Explanation Card (Staggered Microinteraction Refinement)
 * 
 * Pre-authentication discovery card docked to the right of the KisanWheel.
 * Features:
 * 1. Default neutral intelligence state when cursor is not over any feature.
 * 2. Instant morphing on hover with orchestrated child staggering (Title -> Tagline -> Description -> Bullets -> CTA).
 * 3. Domain-specific accent colors and direct CTA to authenticate into that domain.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureId, FEATURES, NEUTRAL_INTELLIGENCE } from '../../config/features';
import { ArrowRight, Check, Compass, Sparkles } from 'lucide-react';

interface FeatureExplanationCardProps {
  featureId: FeatureId | null;
  onExplore: (featureId: FeatureId | null) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

const childVariants = {
  hidden: { opacity: 0, y: 7 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
  }
};

export const FeatureExplanationCard: React.FC<FeatureExplanationCardProps> = ({
  featureId,
  onExplore,
}) => {
  const feature = featureId ? FEATURES[featureId] : null;
  const Icon = feature ? feature.icon : Compass;

  return (
    <div 
      className="w-full max-w-sm sm:max-w-md paper-card p-6 sm:p-7 flex flex-col justify-between select-none relative overflow-hidden bg-[#FFFDF8] border border-[rgba(23,74,50,0.12)] shadow-md"
      style={{
        minHeight: '440px',
        boxShadow: feature 
          ? `0 20px 60px -10px ${feature.themeColor.glow}, 0 4px 16px rgba(22, 58, 40, 0.04)`
          : '0 20px 60px rgba(22, 58, 40, 0.07), 0 4px 16px rgba(22, 58, 40, 0.03)'
      }}
    >
      
      {/* Background radial accent tint based on domain */}
      <div 
        className="absolute top-0 right-0 w-52 h-52 rounded-full pointer-events-none blur-3xl opacity-25 -mr-12 -mt-12 transition-colors duration-500"
        style={{ 
          background: feature 
            ? feature.themeColor.accent 
            : 'radial-gradient(circle, rgba(95,156,168,0.4) 0%, rgba(209,138,53,0.2) 100%)' 
        }}
      />

      <AnimatePresence mode="wait">
        {feature ? (
          /* Domain-specific state */
          <motion.div
            key={feature.id}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4 relative z-10 flex flex-col justify-between h-full"
          >
            {/* Header pill & icon */}
            <motion.div variants={childVariants} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs transition-colors duration-200"
                    style={{
                      backgroundColor: feature.themeColor.accent,
                      color: '#FFFFFF'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span 
                      className="text-xs uppercase tracking-wider font-extrabold block"
                      style={{ color: feature.themeColor.accent }}
                    >
                      {feature.badge}
                    </span>
                    <h3 className="text-xl font-extrabold tracking-tight text-[#173A2A] font-sans">
                      {feature.name}
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#EAF3EC] text-[#174A32] text-xs font-bold">
                  Field 07
                </span>
              </div>

              {/* Subtitle / Tagline */}
              <div className="text-xs text-[#607268] font-bold font-sans">
                {feature.tagline}
              </div>

              {/* Core Description */}
              <p className="text-sm text-[#34483D] leading-relaxed font-sans pt-1 font-medium">
                {feature.shortDescription}
              </p>
            </motion.div>

            {/* Domain Capabilities Bullet List */}
            <motion.div variants={childVariants} className="space-y-2 pt-2 border-t border-[rgba(23,74,50,0.08)]">
              <span className="text-xs text-[#607268] uppercase tracking-wider block font-extrabold">
                Domain highlights
              </span>
              <div className="space-y-1.5">
                {feature.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#34483D] font-medium">
                    <Check 
                      className="w-3.5 h-3.5 shrink-0 mt-0.5" 
                      style={{ color: feature.themeColor.accent }}
                    />
                    <span className="font-sans leading-tight">{bullet}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Explore / Action Button */}
            <motion.div variants={childVariants} className="pt-2">
              <button
                onClick={() => onExplore(feature.id)}
                className="w-full group px-4 py-3 rounded-2xl text-white text-xs font-bold font-mono tracking-wider flex items-center justify-between transition-all duration-200 shadow-md cursor-pointer hover:bg-[#1D4B34]"
                style={{
                  backgroundColor: '#163A28',
                }}
              >
                <span>ENTER {feature.name} DOMAIN</span>
                <div 
                  className="w-6 h-6 rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200"
                  style={{
                    backgroundColor: feature.themeColor.accent
                  }}
                >
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
              <div className="text-center pt-2">
                <span className="text-[10px] font-mono text-[#93A098]">
                  Select domain to authenticate &amp; view full telemetry
                </span>
              </div>
            </motion.div>

          </motion.div>
        ) : (
          /* Neutral Default State */
          <motion.div
            key="neutral-state"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-5 relative z-10 flex flex-col justify-between h-full"
          >
            <motion.div variants={childVariants} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#163A28] text-white flex items-center justify-center shadow-xs">
                    <Compass className="w-4 h-4 text-[#CFE0D5]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#3F7655] font-bold block">
                      {NEUTRAL_INTELLIGENCE.badge}
                    </span>
                    <h3 className="text-xl font-extrabold tracking-tight text-[#17221B] font-sans">
                      {NEUTRAL_INTELLIGENCE.title}
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#EEF2ED] text-[#163A28] text-[10px] font-mono font-semibold">
                  STATION UP-KN-892
                </span>
              </div>

              <div className="text-xs font-mono text-[#637168] font-semibold">
                {NEUTRAL_INTELLIGENCE.tagline}
              </div>

              <p className="text-xs sm:text-sm text-[#17221B] leading-relaxed font-sans pt-1">
                {NEUTRAL_INTELLIGENCE.shortDescription}
              </p>
            </motion.div>

            {/* Live Station Indicators */}
            <motion.div variants={childVariants} className="space-y-2 pt-2 border-t border-[rgba(22,58,40,0.06)]">
              <span className="text-[9.5px] font-mono text-[#93A098] uppercase tracking-wider block font-bold">
                ACTIVE PARCEL SNAPSHOT
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {NEUTRAL_INTELLIGENCE.stats.map((s, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-white/70 border border-[rgba(22,58,40,0.06)]">
                    <span className="text-[9px] text-[#93A098] block uppercase">{s.label}</span>
                    <strong className="text-[#17221B] text-[11px] block truncate">{s.value}</strong>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Instruction Banner */}
            <motion.div variants={childVariants} className="pt-2">
              <div className="w-full px-4 py-3 rounded-2xl bg-[#EEF2ED] border border-[rgba(22,58,40,0.08)] text-center text-xs font-mono text-[#163A28] font-semibold flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D18A35]" />
                <span>{NEUTRAL_INTELLIGENCE.callout}</span>
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
