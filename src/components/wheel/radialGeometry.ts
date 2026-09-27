/**
 * KISAN COMPASS — Radial Wheel Mathematical Geometry Engine
 * 
 * Strict mathematical implementation of a regular pentagon:
 * - 5 feature nodes
 * - Angular step: exactly 72° (360° / 5)
 * - Start angle: exactly -90° (12 o'clock / north for FIELD)
 * - Single center coordinate system: (cx, cy)
 * - Identical radial distance R for all five nodes
 * - Node anchor: center of each node sits exactly on the circumference
 */

import { FeatureId, FEATURE_ORDER } from '../../config/features';

export const FEATURE_COUNT = 5;
export const START_ANGLE_DEG = -90; // 12 o'clock / North
export const ANGLE_STEP_DEG = 360 / FEATURE_COUNT; // Exactly 72°

// Fixed, invariant node dimensions across all 5 domains
export const NODE_WIDTH = 136; // px (within 124–140px spec)
export const NODE_HEIGHT = 54; // px (within 52–60px spec)

export interface RadialNodeGeometry {
  index: number;
  featureId: FeatureId;
  angleDeg: number;
  angleRad: number;
  x: number; // Exact center coordinate X on circumference
  y: number; // Exact center coordinate Y on circumference
  radius: number; // Measured Euclidean distance from (cx, cy)
}

export interface GeometryValidationResult {
  isValid: boolean;
  maxRadiusDeviation: number;
  maxAngleDeviation: number;
  radiusList: number[];
  angleDeltas: number[];
  nodes: {
    id: FeatureId;
    angleDeg: number;
    x: number;
    y: number;
    r: number;
  }[];
}

/**
 * Calculates exact Cartesian coordinates for all 5 feature nodes
 * forming a mathematically regular pentagon centered at (cx, cy).
 */
export function calculateRadialGeometry(
  cx: number,
  cy: number,
  radius: number
): RadialNodeGeometry[] {
  return FEATURE_ORDER.map((featureId, index) => {
    // Exact angle calculation: START_ANGLE + index * 72°
    const angleDeg = START_ANGLE_DEG + index * ANGLE_STEP_DEG;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Standard Cartesian coordinates relative to center (cx, cy)
    const x = cx + radius * Math.cos(angleRad);
    const y = cy + radius * Math.sin(angleRad);

    // Euclidean distance verification: sqrt((x - cx)^2 + (y - cy)^2)
    const measuredRadius = Math.hypot(x - cx, y - cy);

    return {
      index,
      featureId,
      angleDeg,
      angleRad,
      x,
      y,
      radius: measuredRadius,
    };
  });
}

/**
 * Programmatic assertion to verify regular pentagon invariants:
 * 1. All distances from (cx, cy) are identical within floating point epsilon (< 1e-4)
 * 2. Every adjacent pair has exactly 72° angular separation
 */
export function validateRadialGeometry(
  nodes: RadialNodeGeometry[],
  cx: number,
  cy: number,
  expectedRadius: number
): GeometryValidationResult {
  const radiusList = nodes.map(n => Math.hypot(n.x - cx, n.y - cy));
  const maxRadiusDeviation = Math.max(...radiusList) - Math.min(...radiusList);

  const angleDeltas: number[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const currentAngle = nodes[i].angleDeg;
    const nextAngle = nodes[(i + 1) % nodes.length].angleDeg;
    const delta = (nextAngle - currentAngle + 360) % 360;
    angleDeltas.push(Math.round(delta * 1000) / 1000);
  }

  const maxAngleDeviation = Math.max(...angleDeltas.map(d => Math.abs(d - ANGLE_STEP_DEG)));
  const isRadiusUniform = maxRadiusDeviation < 1e-4 && Math.abs(radiusList[0] - expectedRadius) < 1e-4;
  const isAngleUniform = maxAngleDeviation < 1e-4;

  return {
    isValid: isRadiusUniform && isAngleUniform,
    maxRadiusDeviation,
    maxAngleDeviation,
    radiusList,
    angleDeltas,
    nodes: nodes.map(n => ({
      id: n.featureId,
      angleDeg: n.angleDeg,
      x: Math.round(n.x * 100) / 100,
      y: Math.round(n.y * 100) / 100,
      r: Math.round(n.radius * 100) / 100,
    })),
  };
}
