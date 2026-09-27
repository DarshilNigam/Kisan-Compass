/**
 * KISAN COMPASS — Centralized Feature Configuration
 * 
 * Canonical source of truth for the 5 primary product domains.
 * Written in friendly, grounded agricultural language.
 */

import { 
  Sprout, 
  Compass, 
  TrendingUp, 
  History, 
  ShieldCheck,
  LucideIcon
} from 'lucide-react';

export type FeatureId = 'field' | 'decision' | 'market' | 'memory' | 'trust';

export interface FeatureDefinition {
  id: FeatureId;
  name: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  bullets: string[];
  icon: LucideIcon;
  badge: string;
  route: FeatureId;
  themeColor: {
    primary: string;
    accent: string;
    soft: string;
    border: string;
    text: string;
    glow: string;
  };
}

export const FEATURES: Record<FeatureId, FeatureDefinition> = {
  field: {
    id: 'field',
    name: 'Field',
    tagline: 'Your crops, soil & weather',
    shortDescription: 'See how your crop is growing, check soil moisture, and track upcoming rain.',
    longDescription: 'Live monitoring of Field 07 (2.4 acres, Wheat HD-2967). Real-time heat progress, root-zone soil moisture, and high-resolution rain radar.',
    bullets: [
      'Field 07 · 2.4 acres wheat',
      'Wheat is 94.6% ready for harvest',
      'Soil moisture at 28% (good condition)',
      'Radar rain forecast for next 48 hours'
    ],
    icon: Sprout,
    badge: 'Crop & Land',
    route: 'field',
    themeColor: {
      primary: '#174A32',
      accent: '#5E9B68',
      soft: '#EAF3EC',
      border: 'rgba(94, 155, 104, 0.30)',
      text: '#174A32',
      glow: 'rgba(94, 155, 104, 0.16)',
    }
  },

  decision: {
    id: 'decision',
    name: 'Advice',
    tagline: 'What to do today',
    shortDescription: 'Compare your choices, understand what could happen, and decide the right time to harvest or sell.',
    longDescription: 'Clear recommendations balancing rain risk against mandi prices. Compare waiting versus harvesting today, with full visibility into possible outcomes.',
    bullets: [
      'Today\'s best choice: Sell before the storm',
      'Likely take-home cash: ₹74,820 after transport',
      'What happens if you wait 5 days',
      'What changes our mind'
    ],
    icon: Compass,
    badge: 'Today\'s Choice',
    route: 'decision',
    themeColor: {
      primary: '#174A32',
      accent: '#D88732',
      soft: '#FBF0E3',
      border: 'rgba(216, 135, 50, 0.30)',
      text: '#B86A1D',
      glow: 'rgba(216, 135, 50, 0.18)',
    }
  },

  market: {
    id: 'market',
    name: 'Market',
    tagline: 'Where to sell for more',
    shortDescription: 'Compare nearby mandis by what you will actually earn after paying for transport.',
    longDescription: 'Compare real take-home cash across Unnao, Kanpur, Bilhaur, and Hardoi after accounting for tractor haulage costs and grain quality discounts.',
    bullets: [
      '4 nearby APMC mandis compared',
      'Tractor transport cost deducted',
      'Quality dockage calculated',
      'Shows what stays in your pocket'
    ],
    icon: TrendingUp,
    badge: 'Mandi Rates',
    route: 'market',
    themeColor: {
      primary: '#174A32',
      accent: '#79B8C4',
      soft: '#DDEFF1',
      border: 'rgba(121, 184, 196, 0.30)',
      text: '#2D6B78',
      glow: 'rgba(121, 184, 196, 0.16)',
    }
  },

  memory: {
    id: 'memory',
    name: 'Memory',
    tagline: 'Your farm\'s past choices',
    shortDescription: 'See your past decisions, what worked well, and how the system learned from your real harvests.',
    longDescription: 'A record of past recommendations, your decisions, and verified mandi receipts. Helps the system understand your preferences and make better suggestions.',
    bullets: [
      'Past recommendations & your choices',
      'Track record of accepted advice',
      'Real sale receipts and actual outcomes',
      'Advice tuned to how you like to farm'
    ],
    icon: History,
    badge: 'Past Choices',
    route: 'memory',
    themeColor: {
      primary: '#174A32',
      accent: '#5E9B68',
      soft: '#EAF3EC',
      border: 'rgba(94, 155, 104, 0.30)',
      text: '#174A32',
      glow: 'rgba(94, 155, 104, 0.14)',
    }
  },

  trust: {
    id: 'trust',
    name: 'Trust',
    tagline: 'Why you can rely on this',
    shortDescription: 'Check where our numbers come from, see real sensor readings, and verify any calculation.',
    longDescription: 'Every recommendation is grounded in live sensor readings and verified calculations. Nothing is guessed or hidden.',
    bullets: [
      '5 live sources checked in real time',
      'Step-by-step reasoning for every number',
      'Past advice accuracy record',
      'Inspect any calculation anytime'
    ],
    icon: ShieldCheck,
    badge: 'Checked & Verified',
    route: 'trust',
    themeColor: {
      primary: '#174A32',
      accent: '#79B8C4',
      soft: '#DDEFF1',
      border: 'rgba(121, 184, 196, 0.30)',
      text: '#2D6B78',
      glow: 'rgba(121, 184, 196, 0.14)',
    }
  }
};

export const FEATURE_ORDER: FeatureId[] = [
  'field',
  'decision',
  'market',
  'memory',
  'trust'
];

export const NEUTRAL_INTELLIGENCE = {
  title: 'Kisan Compass',
  badge: 'Farm Companion',
  tagline: 'A trusted companion for your farm',
  shortDescription: 'Clear, honest advice to help you decide when to harvest, where to sell, and how to get the most for your crop.',
  callout: 'Select any topic to explore · Sign in anytime',
  stats: [
    { label: 'Parcel', value: 'Field 07 (2.4 Acres)' },
    { label: 'Crop', value: 'Wheat HD-2967' },
    { label: 'Condition', value: '94.6% Mature' },
    { label: 'Status', value: '5 Live Sources Active' }
  ]
};
