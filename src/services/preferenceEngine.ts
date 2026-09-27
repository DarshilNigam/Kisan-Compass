import { PreferenceProfile } from '../types/farm';
import { 
  LongitudinalDecisionRecord, 
  PreferenceDimensionRecord, 
  RejectionReasonType 
} from '../types/memory';

export interface ExtendedPreferenceProfile extends PreferenceProfile {
  liquidityPreference: number;
  priceUpsidePreference: number;
  evidenceCount: number;
  signalStrength: 'WEAK SIGNAL' | 'MODERATE SIGNAL' | 'STRONG SIGNAL';
  dimensions: PreferenceDimensionRecord[];
  historyLog: {
    timestamp: string;
    decisionId: string;
    changeSummary: string;
    dimensionDeltas: { dimension: string; prev: number; next: number }[];
  }[];
}

export const initialExtendedPreferences: ExtendedPreferenceProfile = {
  riskAversion: 0.68,
  weatherSensitivity: 0.82,
  storageTrust: 0.45,
  cashUrgency: 0.55,
  liquidityPreference: 0.55,
  priceUpsidePreference: 0.42,
  evidenceCount: 6,
  signalStrength: 'STRONG SIGNAL',
  lastAdjustedDecisionId: 'DEC-2026-03-26-01',
  adjustmentSummary: 'Recent pattern: Farmer consistently prioritized crop safety over speculative price gain when storm probability exceeded 50%.',
  dimensions: [
    {
      dimension: 'riskAversion',
      name: 'Downside Risk Aversion',
      currentScore: 0.68,
      previousScore: 0.60,
      evidenceCount: 6,
      signalStrength: 'STRONG SIGNAL',
      description: 'Tendency to avoid downside loss vs holding for speculative price gains.',
      observedPattern: '4 of 6 decisions chose immediate harvest/sale over holding through volatile weather.',
      lastUpdated: 'Mar 26, 2026',
    },
    {
      dimension: 'weatherSensitivity',
      name: 'Weather Hazard Sensitivity',
      currentScore: 0.82,
      previousScore: 0.74,
      evidenceCount: 6,
      signalStrength: 'STRONG SIGNAL',
      description: 'Weight given to numerical weather forecast models and rain projections for standing mature crops.',
      observedPattern: 'Rejected delay when precipitation probability exceeded 60%.',
      lastUpdated: 'Mar 26, 2026',
    },
    {
      dimension: 'liquidityPreference',
      name: 'Cash Liquidity Urgency',
      currentScore: 0.55,
      previousScore: 0.50,
      evidenceCount: 4,
      signalStrength: 'MODERATE SIGNAL',
      description: 'Preference for immediate liquidity to pay labor & rent vs delayed settlement.',
      observedPattern: 'Selected nearest high-volume APMC with on-the-spot cash settlement.',
      lastUpdated: 'Mar 12, 2026',
    },
    {
      dimension: 'priceUpsidePreference',
      name: 'Price Upside Tolerance',
      currentScore: 0.42,
      previousScore: 0.48,
      evidenceCount: 5,
      signalStrength: 'MODERATE SIGNAL',
      description: 'Willingness to endure price volatility for potential upside drift.',
      observedPattern: 'Reluctant to hold beyond 5 days for less than ₹50/qtl gross spread.',
      lastUpdated: 'Feb 20, 2026',
    },
  ],
  historyLog: [
    {
      timestamp: '2026-03-26T14:15:00+05:30',
      decisionId: 'DEC-2026-03-26-01',
      changeSummary: 'Rejection of +5 day hold: Risk Aversion updated 0.60 → 0.68.',
      dimensionDeltas: [
        { dimension: 'riskAversion', prev: 0.60, next: 0.68 },
        { dimension: 'weatherSensitivity', prev: 0.74, next: 0.82 },
      ],
    },
  ],
};

/**
 * Deterministic Bounded Preference Adaptation
 * Formula: delta = baseRate * feedbackWeight * (1 / sqrt(evidenceCount + 1))
 */
export function adaptPreferencesOnAction(
  current: ExtendedPreferenceProfile,
  action: 'ACCEPTED' | 'REJECTED',
  reason?: RejectionReasonType,
  decision?: LongitudinalDecisionRecord
): ExtendedPreferenceProfile {
  const count = current.evidenceCount + 1;
  const dampFactor = 1 / Math.sqrt(count); // Gradual convergence, prevents sudden jumps

  let deltaRisk = 0;
  let deltaWeather = 0;
  let deltaLiquidity = 0;
  let deltaUpside = 0;
  let changeSummary = '';

  if (action === 'REJECTED') {
    switch (reason) {
      case 'TOO_RISKY':
        deltaRisk = +(0.14 * dampFactor).toFixed(3);
        deltaWeather = +(0.10 * dampFactor).toFixed(3);
        deltaUpside = -(0.08 * dampFactor).toFixed(3);
        changeSummary = `Rejected as TOO RISKY: Risk Aversion raised (+${Math.round(deltaRisk * 100)}%), Weather Sensitivity increased (+${Math.round(deltaWeather * 100)}%).`;
        break;

      case 'NEED_IMMEDIATE_CASH':
        deltaLiquidity = +(0.16 * dampFactor).toFixed(3);
        deltaUpside = -(0.10 * dampFactor).toFixed(3);
        deltaRisk = +(0.06 * dampFactor).toFixed(3);
        changeSummary = `Rejected for CASH LIQUIDITY: Liquidity Preference raised (+${Math.round(deltaLiquidity * 100)}%).`;
        break;

      case 'DISAGREE_WEATHER':
        deltaWeather = -(0.08 * dampFactor).toFixed(3); // farmer has local micro-climate confidence
        changeSummary = `Weather disagreement noted: Weather hazard sensitivity moderated (-${Math.round(Math.abs(deltaWeather) * 100)}%).`;
        break;

      case 'BETTER_LOCAL_PRICE':
        deltaLiquidity = +(0.06 * dampFactor).toFixed(3);
        changeSummary = `Local price arbitrage prioritized over distant wholesale APMC.`;
        break;

      default:
        deltaRisk = +(0.05 * dampFactor).toFixed(3);
        changeSummary = `General rejection recorded: Risk Aversion adjusted slightly (+${Math.round(deltaRisk * 100)}%).`;
        break;
    }
  } else if (action === 'ACCEPTED') {
    if (decision && decision.recommendedHorizonDays > 2) {
      // Farmer accepted a hold decision -> willing to tolerate upside risk
      deltaUpside = +(0.08 * dampFactor).toFixed(3);
      deltaRisk = -(0.05 * dampFactor).toFixed(3);
      changeSummary = `Accepted +${decision.recommendedHorizonDays}d HOLD: Upside tolerance reinforced (+${Math.round(deltaUpside * 100)}%).`;
    } else {
      // Farmer accepted immediate liquidation
      deltaRisk = +(0.04 * dampFactor).toFixed(3);
      changeSummary = `Accepted immediate harvest: Downside risk aversion confirmed.`;
    }
  }

  // Strictly bound between 0.10 and 0.90
  const clamp = (val: number) => Math.min(0.90, Math.max(0.10, +(val).toFixed(2)));

  const newRisk = clamp(current.riskAversion + deltaRisk);
  const newWeather = clamp(current.weatherSensitivity + deltaWeather);
  const newLiquidity = clamp(current.liquidityPreference + deltaLiquidity);
  const newUpside = clamp(current.priceUpsidePreference + deltaUpside);

  // Compute Signal Strength
  let signalStrength: 'WEAK SIGNAL' | 'MODERATE SIGNAL' | 'STRONG SIGNAL' = 'WEAK SIGNAL';
  if (count >= 6) signalStrength = 'STRONG SIGNAL';
  else if (count >= 3) signalStrength = 'MODERATE SIGNAL';

  const updatedDimensions: PreferenceDimensionRecord[] = [
    {
      dimension: 'riskAversion',
      name: 'Downside Risk Aversion',
      currentScore: newRisk,
      previousScore: current.riskAversion,
      evidenceCount: count,
      signalStrength,
      description: 'Tendency to avoid downside loss vs holding for speculative price gains.',
      observedPattern: `${Math.round(newRisk * 100)}% calibrated preference. Last action: ${action} (${reason || 'Standard'})`,
      lastUpdated: 'Just now',
    },
    {
      dimension: 'weatherSensitivity',
      name: 'Weather Hazard Sensitivity',
      currentScore: newWeather,
      previousScore: current.weatherSensitivity,
      evidenceCount: count,
      signalStrength,
      description: 'Weight given to numerical weather forecast models and rain projections for standing mature crops.',
      observedPattern: `${Math.round(newWeather * 100)}% sensitivity weighting applied in decision utility.`,
      lastUpdated: 'Just now',
    },
    {
      dimension: 'liquidityPreference',
      name: 'Cash Liquidity Urgency',
      currentScore: newLiquidity,
      previousScore: current.liquidityPreference,
      evidenceCount: count,
      signalStrength,
      description: 'Preference for immediate liquidity to pay labor & rent vs delayed settlement.',
      observedPattern: `${Math.round(newLiquidity * 100)}% cash liquidity priority.`,
      lastUpdated: 'Just now',
    },
    {
      dimension: 'priceUpsidePreference',
      name: 'Price Upside Tolerance',
      currentScore: newUpside,
      previousScore: current.priceUpsidePreference,
      evidenceCount: count,
      signalStrength,
      description: 'Willingness to endure price volatility for potential upside drift.',
      observedPattern: `${Math.round(newUpside * 100)}% upside tolerance.`,
      lastUpdated: 'Just now',
    },
  ];

  return {
    ...current,
    riskAversion: newRisk,
    weatherSensitivity: newWeather,
    liquidityPreference: newLiquidity,
    priceUpsidePreference: newUpside,
    cashUrgency: newLiquidity,
    evidenceCount: count,
    signalStrength,
    lastAdjustedDecisionId: decision?.id || 'RECENT',
    adjustmentSummary: changeSummary,
    dimensions: updatedDimensions,
    historyLog: [
      {
        timestamp: new Date().toISOString(),
        decisionId: decision?.id || 'MANUAL',
        changeSummary,
        dimensionDeltas: [
          { dimension: 'riskAversion', prev: current.riskAversion, next: newRisk },
          { dimension: 'weatherSensitivity', prev: current.weatherSensitivity, next: newWeather },
          { dimension: 'liquidityPreference', prev: current.liquidityPreference, next: newLiquidity },
          { dimension: 'priceUpsidePreference', prev: current.priceUpsidePreference, next: newUpside },
        ],
      },
      ...current.historyLog,
    ],
  };
}
