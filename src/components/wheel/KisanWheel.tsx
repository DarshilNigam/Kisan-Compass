/**
 * KISAN COMPASS — KisanWheel Component (Mathematical Radial Perfection)
 * 
 * Strict Regular Pentagon Geometry:
 * - 5 feature nodes at exactly 72° angular increments (360° / 5).
 * - Exact same radial distance R for every single node.
 * - Single source of truth center: (cx, cy) shared by rings, core, rays, and nodes.
 * - Nodes anchored at their exact centers via translate(-50%, -50%).
 * - Fixed 136px x 54px node footprint ensuring invariant geometry regardless of label length.
 * - Hover scaling scales symmetrically around node center with zero orbital shift.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FeatureId, FEATURES } from '../../config/features';
import {
  calculateRadialGeometry,
  validateRadialGeometry,
  NODE_WIDTH,
  NODE_HEIGHT,
  RadialNodeGeometry,
} from './radialGeometry';

interface KisanWheelProps {
  selectedFeature?: FeatureId | null;
  onHoverFeature?: (featureId: FeatureId | null) => void;
  onClickFeature?: (featureId: FeatureId) => void;
  size?: 'standard' | 'large';
  interactive?: boolean;
}

export const KisanWheel: React.FC<KisanWheelProps> = ({
  selectedFeature,
  onHoverFeature,
  onClickFeature,
  size = 'standard',
  interactive = true,
}) => {
  const [internalHovered, setInternalHovered] = useState<FeatureId | null>(null);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // Responsive scale dimensions
  const isLarge = size === 'large';
  const width = isLarge ? 640 : 580;
  const height = isLarge ? 640 : 580;

  // ONE TRUE CENTER for the entire radial universe
  const cx = width / 2;
  const cy = height / 2;

  // ONE SINGLE RADIUS for all five feature nodes
  const orbitRadius = isLarge ? 242 : 218;
  const centerRadius = isLarge ? 86 : 78;

  // Active state
  const activeFeatureId = internalHovered ?? selectedFeature ?? null;

  // Mathematical Node Calculation: Regular Pentagon
  const nodes = useMemo<RadialNodeGeometry[]>(() => {
    return calculateRadialGeometry(cx, cy, orbitRadius);
  }, [cx, cy, orbitRadius]);

  // Active Node
  const activeNode = useMemo(() => {
    return nodes.find(n => n.featureId === activeFeatureId) || null;
  }, [nodes, activeFeatureId]);

  // Programmatic Geometry Validation (dev mode assertion)
  const validation = useMemo(() => {
    return validateRadialGeometry(nodes, cx, cy, orbitRadius);
  }, [nodes, cx, cy, orbitRadius]);

  // Keyboard shortcut (Shift + D) to toggle radial geometry debug overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseEnterNode = (featureId: FeatureId) => {
    if (!interactive) return;
    setInternalHovered(featureId);
    if (onHoverFeature) {
      onHoverFeature(featureId);
    }
  };

  const handleMouseLeaveNode = () => {
    if (!interactive) return;
    setInternalHovered(null);
    if (onHoverFeature) {
      onHoverFeature(null);
    }
  };

  const handleClickNode = (featureId: FeatureId) => {
    if (!interactive) return;
    if (onClickFeature) {
      onClickFeature(featureId);
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center select-none"
      style={{ width, height }}
      onMouseLeave={handleMouseLeaveNode}
    >
      
      {/* 1. Atmospheric Ambient Glow centered at (cx, cy) */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none opacity-40 blur-3xl transition-all duration-700"
        style={{
          background: 'radial-gradient(circle at center, rgba(126, 170, 178, 0.20) 0%, rgba(201, 137, 61, 0.08) 50%, transparent 72%)'
        }}
      />

      {/* 2. SVG Precision Geometry (Shares the exact same center cx, cy) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <radialGradient id="compassCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#EEF2ED" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#DCECEF" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Outer Atmospheric Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={orbitRadius + 42}
          fill="none"
          stroke="rgba(126, 170, 178, 0.20)"
          strokeWidth="1"
        />

        {/* Secondary Segmented Ring with 72° compass cadence */}
        <circle
          cx={cx}
          cy={cy}
          r={orbitRadius + 22}
          fill="none"
          stroke="rgba(23, 58, 39, 0.08)"
          strokeWidth="1.2"
          strokeDasharray="4 8"
        />

        {/* Main Orbital Rail: EXACT CIRCUMFERENCE WHERE NODE CENTERS LIE */}
        <circle
          cx={cx}
          cy={cy}
          r={orbitRadius}
          fill="none"
          stroke="rgba(23, 58, 39, 0.12)"
          strokeWidth="1.5"
        />

        {/* Inner Ring: Boundary of the central instrument glass disc */}
        <circle
          cx={cx}
          cy={cy}
          r={centerRadius + 18}
          fill="none"
          stroke="rgba(126, 170, 178, 0.18)"
          strokeWidth="1"
          strokeDasharray="2 6"
        />

        {/* 10 Compass Tick Marks around main orbit rail at 36° intervals */}
        {Array.from({ length: 10 }).map((_, i) => {
          const tickAngle = (i * 36 * Math.PI) / 180;
          const isNodeAzimuth = i % 2 === 0;
          const r1 = isNodeAzimuth ? orbitRadius - 6 : orbitRadius - 3;
          const r2 = isNodeAzimuth ? orbitRadius + 6 : orbitRadius + 3;
          const x1 = cx + r1 * Math.cos(tickAngle);
          const y1 = cy + r1 * Math.sin(tickAngle);
          const x2 = cx + r2 * Math.cos(tickAngle);
          const y2 = cy + r2 * Math.sin(tickAngle);
          return (
            <line
              key={`tick-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isNodeAzimuth ? "rgba(23, 58, 39, 0.22)" : "rgba(23, 58, 39, 0.10)"}
              strokeWidth={isNodeAzimuth ? "1.5" : "1"}
            />
          );
        })}

        {/* Subtle Radial Spoke Guides from (cx, cy) to each node center */}
        {nodes.map((node) => (
          <line
            key={`spoke-${node.featureId}`}
            x1={cx}
            y1={cy}
            x2={node.x}
            y2={node.y}
            stroke="rgba(23, 58, 39, 0.05)"
            strokeWidth="1"
            strokeDasharray="2 5"
          />
        ))}

        {/* Geometric Node Center Anchors on Circumference */}
        {nodes.map((node) => {
          const isNodeActive = activeFeatureId === node.featureId;
          const featDef = FEATURES[node.featureId];
          return (
            <g key={`anchor-${node.featureId}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={isNodeActive ? 5 : 2.5}
                fill={isNodeActive ? featDef.themeColor.accent : "rgba(23, 58, 39, 0.20)"}
                className="transition-all duration-200"
              />
              {isNodeActive && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={8}
                  fill="none"
                  stroke={featDef.themeColor.accent}
                  strokeWidth="1.2"
                  opacity="0.6"
                />
              )}
            </g>
          );
        })}

        {/* Active Illuminated Connector Ray from Center to Highlighted Node */}
        {activeNode && (
          <motion.line
            x1={cx}
            y1={cy}
            x2={activeNode.x}
            y2={activeNode.y}
            stroke={FEATURES[activeNode.featureId].themeColor.accent}
            strokeWidth="2"
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          />
        )}

        {/* Magnetic Compass Needle (Rotating Pointer around Center cx, cy) */}
        <g transform={`translate(${cx}, ${cy})`}>
          <motion.g
            initial={false}
            animate={{ rotate: activeNode ? activeNode.angleDeg + 90 : 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            {/* North-pointing indicator */}
            <polygon
              points="0,-48 3.5,-32 0,-26 -3.5,-32"
              fill={activeNode ? FEATURES[activeNode.featureId].themeColor.accent : '#3F7655'}
              opacity={activeNode ? 0.95 : 0.35}
              className="transition-all duration-300"
            />
            {/* South-pointing counter balance */}
            <polygon
              points="0,48 2.5,36 0,30 -2.5,36"
              fill="rgba(22, 58, 40, 0.12)"
              opacity={activeNode ? 0.6 : 0.2}
            />
          </motion.g>
        </g>

        {/* Development Debug Geometry Overlay */}
        {showDebug && (
          <g className="debug-radial-overlay font-mono text-[9px]">
            {/* Center Crosshairs */}
            <line x1={cx - 20} y1={cy} x2={cx + 20} y2={cy} stroke="#E11D48" strokeWidth="1" />
            <line x1={cx} y1={cy - 20} x2={cx} y2={cy + 20} stroke="#E11D48" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="2.5" fill="#E11D48" />
            <text x={cx + 6} y={cy - 6} fill="#E11D48" fontWeight="bold">({cx}, {cy})</text>

            {/* Pentagon Perimeter Lines Connecting the 5 Node Centers */}
            {nodes.map((node, i) => {
              const nextNode = nodes[(i + 1) % nodes.length];
              return (
                <line
                  key={`poly-${i}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode.x}
                  y2={nextNode.y}
                  stroke="#E11D48"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
              );
            })}

            {/* Per-node Coordinate & Angle Labels */}
            {nodes.map((node) => (
              <g key={`debug-node-${node.featureId}`}>
                <text
                  x={node.x}
                  y={node.y > cy ? node.y + 40 : node.y - 34}
                  textAnchor="middle"
                  fill="#E11D48"
                  fontWeight="bold"
                >
                  #{node.index} {node.angleDeg}° (R={Math.round(node.radius)}px)
                </text>
              </g>
            ))}

            {/* Summary Validation Badge */}
            <rect x={12} y={12} width={260} height={40} rx={8} fill="rgba(0,0,0,0.85)" />
            <text x={20} y={28} fill="#10B981" fontWeight="bold" fontSize="10">
              RADIAL GEOMETRY: {validation.isValid ? 'VALID' : 'INVALID'}
            </text>
            <text x={20} y={42} fill="#FFFFFF" fontSize="9">
              ΔR={validation.maxRadiusDeviation.toFixed(4)}px • Δθ={validation.maxAngleDeviation.toFixed(4)}° • R={orbitRadius}px
            </text>
          </g>
        )}
      </svg>

      {/* 3. Center KISAN COMPASS Glass Object (Anchored at exact center cx, cy) */}
      <div
        className="absolute z-20 flex flex-col items-center justify-center text-center cursor-default pointer-events-auto rain-wheel-surface transition-all duration-300"
        style={{
          left: `${cx}px`,
          top: `${cy}px`,
          width: `${centerRadius * 2}px`,
          height: `${centerRadius * 2}px`,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          boxShadow: activeNode 
            ? `0 16px 44px -8px ${FEATURES[activeNode.featureId].themeColor.glow}, 0 0 0 1.5px ${FEATURES[activeNode.featureId].themeColor.accent}30`
            : '0 12px 36px -8px rgba(22, 58, 40, 0.08), 0 0 0 1px rgba(22, 58, 40, 0.06)',
        }}
      >
        {/* Concentric inner glass ring */}
        <div 
          className="absolute inset-2 rounded-full border transition-colors duration-300 pointer-events-none" 
          style={{
            borderColor: activeNode 
              ? `${FEATURES[activeNode.featureId].themeColor.accent}20` 
              : 'rgba(22, 58, 40, 0.06)'
          }}
        />

        {/* Center brand typography */}
        <div className="space-y-0.5 relative z-10 px-2 select-none">
          <div 
            className="text-[20px] sm:text-[22px] font-black tracking-widest text-[#163A28] uppercase leading-none"
            style={{ fontFamily: 'Plus Jakarta Sans, Geist, sans-serif' }}
          >
            KISAN
          </div>
          <div 
            className="text-[10.5px] sm:text-[11.5px] font-mono tracking-[0.26em] font-bold uppercase transition-colors duration-300"
            style={{
              color: activeNode 
                ? FEATURES[activeNode.featureId].themeColor.accent 
                : '#3F7655'
            }}
          >
            COMPASS
          </div>

          <div className="pt-1.5 flex items-center justify-center gap-1.5">
            <span 
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300" 
              style={{
                backgroundColor: activeNode 
                  ? FEATURES[activeNode.featureId].themeColor.accent 
                  : '#D18A35'
              }}
            />
            <span className="text-[7.5px] font-mono tracking-widest text-[#637168] uppercase font-bold">
              {activeNode ? FEATURES[activeNode.featureId].name : '• INTEL •'}
            </span>
            <span 
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300" 
              style={{
                backgroundColor: activeNode 
                  ? FEATURES[activeNode.featureId].themeColor.accent 
                  : '#5F9CA8'
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Five Radially Symmetric Feature Nodes (Exact 72° Pentagon Geometry) */}
      {nodes.map((node) => {
        const feature = FEATURES[node.featureId];
        const Icon = feature.icon;
        const isHovered = internalHovered === node.featureId;
        const isSelected = selectedFeature === node.featureId;
        const isHighlighted = isHovered || isSelected;
        const isDimmed = activeFeatureId !== null && !isHighlighted;

        return (
          <div
            key={node.featureId}
            className="absolute z-30 pointer-events-none select-none"
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: `${NODE_WIDTH}px`,
              height: `${NODE_HEIGHT}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div
              className="w-full h-full pointer-events-auto cursor-pointer rounded-2xl flex items-center justify-between px-3 py-2 transition-colors duration-200 outline-none"
              style={{
                transformOrigin: 'center center',
                backgroundColor: '#FFFDF8',
                borderWidth: isHighlighted ? '2px' : '1px',
                borderColor: isHighlighted 
                  ? feature.themeColor.accent 
                  : 'rgba(23, 74, 50, 0.12)',
                boxShadow: isHighlighted 
                  ? `0 12px 28px -4px ${feature.themeColor.glow}, 0 2px 6px -1px rgba(14, 51, 34, 0.06)` 
                  : '0 2px 8px -2px rgba(14, 51, 34, 0.04)',
              }}
              initial={false}
              animate={{
                scale: isHighlighted ? 1.05 : 1,
                opacity: isDimmed ? 0.45 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 26,
              }}
              onMouseEnter={() => handleMouseEnterNode(node.featureId)}
              onClick={() => handleClickNode(node.featureId)}
            >
              {/* Feature Icon & Fixed Dimensions Content */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
                  style={{
                    backgroundColor: isHighlighted ? feature.themeColor.accent : feature.themeColor.soft,
                    color: isHighlighted ? '#FFFFFF' : feature.themeColor.text,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex flex-col text-left overflow-hidden min-w-0">
                  <span 
                    className="text-xs font-extrabold tracking-tight truncate leading-tight font-sans"
                    style={{
                      color: isHighlighted ? feature.themeColor.text : '#17281F'
                    }}
                  >
                    {feature.name}
                  </span>

                  <span 
                    className="text-[10px] tracking-tight truncate leading-tight mt-0.5 font-medium font-sans"
                    style={{
                      color: isHighlighted ? feature.themeColor.accent : '#78877D'
                    }}
                  >
                    {feature.badge}
                  </span>
                </div>
              </div>

              {/* Precise Small Radial State Pip */}
              <div 
                className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200"
                style={{
                  backgroundColor: isHighlighted ? feature.themeColor.accent : 'rgba(23, 58, 39, 0.15)'
                }}
              />
            </motion.div>
          </div>
        );
      })}

      {/* Subtle Dev Debug Toggle indicator (Dev Only) */}
      <button
        onClick={() => setShowDebug(prev => !prev)}
        className="absolute bottom-1 right-1 z-40 text-[9px] font-mono px-2 py-0.5 rounded bg-black/5 hover:bg-black/10 text-[#5F806B] transition-opacity opacity-40 hover:opacity-100 cursor-pointer"
        title="Toggle Radial Geometry Debug (or Shift + D)"
      >
        {showDebug ? 'HIDE GEOMETRY' : 'DEBUG GEOMETRY'}
      </button>

    </div>
  );
};
