/**
 * KISAN COMPASS — Human-First Agricultural Design Tokens
 * 
 * Philosophy:
 * Warm Agricultural Paper · High Contrast · Farmer-Friendly Hierarchy.
 * 
 * Color Palette:
 * - Foundation: #F7F4EC (Warm agricultural paper)
 * - Surface: #FFFDF8 (Clean readable paper surface)
 * - Forest: #174A32 (Primary brand & authority)
 * - Deep Forest: #0E3322 (Deep contrast)
 * - Leaf: #5E9B68 (Crop health & confirmation)
 * - Sky: #79B8C4 (Weather & info)
 * - Soft Sky: #DDEFF1 (Subtle sky tint)
 * - Harvest Orange: #D88732 (Attention & market opportunity)
 * - Wheat Gold: #E7C66A (Maturity & financial value)
 * - Warm Sand: #EFE2C8 (Grounded agricultural warmth)
 * - Soft Red: #D96B5F (Genuine critical risk only)
 * 
 * Typography:
 * - Primary UI: Nunito Sans with Noto Sans Devanagari fallback
 * - Hero Titles: Lora editorial serif
 * - Monospace: JetBrains Mono (strictly for IDs, hashes, times, coordinates)
 */

export const tokens = {
  colors: {
    // Environmental Canvas & Surfaces
    bg: {
      canvas: '#F7F4EC',
      surface: '#FFFDF8',
      warmSand: '#EFE2C8',
      subtle: '#F0ECE1',
      elevated: '#FFFDF8',
      glass: 'rgba(255, 253, 248, 0.88)',
      darkHero: '#174A32',
    },

    // Agricultural Green Hierarchy
    forest: {
      deep: '#0E3322',
      primary: '#174A32',
      leaf: '#5E9B68',
      soft: '#EAF3EC',
    },

    // Atmospheric & Information Sky Blue
    blue: {
      sky: '#79B8C4',
      softSky: '#DDEFF1',
      deep: '#2D6B78',
      subtle: 'rgba(121, 184, 196, 0.14)',
    },

    // Harvest & Attention Orange
    orange: {
      harvest: '#D88732',
      deep: '#B86A1D',
      soft: '#FBF0E3',
      border: 'rgba(216, 135, 50, 0.35)',
    },

    // Crop Maturity & Financial Gold
    gold: {
      wheat: '#E7C66A',
      deep: '#C99E38',
      cream: '#FAF4E3',
      soft: 'rgba(231, 198, 106, 0.20)',
    },

    // Real Risk & Alerts Only
    coral: {
      alert: '#D96B5F',
      deep: '#B54B3F',
      soft: '#FBECEB',
      border: 'rgba(217, 107, 95, 0.30)',
    },

    // High-Contrast Farmer-Readable Typography (No washed-out low-contrast text!)
    text: {
      primary: '#173A2A',     // Headings, important values, card titles, recommendations
      body: '#34483D',        // Descriptions, explanations, supporting information
      secondary: '#607268',   // Metadata, supporting labels, timestamps
      muted: '#7A8980',       // Genuinely secondary helper information
      disabled: '#9BA79F',    // Disabled controls only
      inverted: '#FFFFFF',
      invertedMuted: '#D5E5DA',
    },

    // Precision Borders
    border: {
      subtle: 'rgba(23, 74, 50, 0.08)',
      medium: 'rgba(23, 74, 50, 0.14)',
      accentGreen: 'rgba(94, 155, 104, 0.35)',
      accentBlue: 'rgba(121, 184, 196, 0.35)',
      accentOrange: 'rgba(216, 135, 50, 0.35)',
    },
  },

  // Layered Shadows for Paper Surfaces
  shadows: {
    paper: '0 4px 20px rgba(14, 51, 34, 0.04), 0 1px 3px rgba(14, 51, 34, 0.02)',
    paperElevated: '0 12px 36px rgba(14, 51, 34, 0.06), 0 2px 6px rgba(14, 51, 34, 0.03)',
    hero: '0 16px 44px rgba(14, 51, 34, 0.07), 0 2px 8px rgba(14, 51, 34, 0.02)',
    glowGreen: '0 12px 32px -4px rgba(94, 155, 104, 0.22)',
    glowOrange: '0 12px 32px -4px rgba(216, 135, 50, 0.22)',
  },

  // Clean Radii
  radius: {
    hero: '28px',
    card: '22px',
    button: '14px',
    pill: '9999px',
  },

  // Typography Utilities
  typography: {
    heroTitle: 'font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#17281F]',
    pageTitle: 'text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#17281F]',
    sectionTitle: 'text-xl sm:text-2xl font-bold text-[#17281F]',
    body: 'text-sm sm:text-base text-[#304238] leading-relaxed',
    secondary: 'text-xs sm:text-sm text-[#607268]',
    technicalId: 'font-mono text-xs tracking-wider uppercase text-[#607268]',
  },
};
