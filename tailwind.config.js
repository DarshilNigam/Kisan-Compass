/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        display: ['Lora', 'Georgia', 'serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        primary: '#173A2A',
        body: '#34483D',
        secondary: '#607268',
        muted: '#7A8980',
        disabled: '#9BA79F',
        forest: {
          DEFAULT: '#174A32',
          deep: '#0E3322',
        },
        leaf: '#5E9B68',
        sky: {
          DEFAULT: '#79B8C4',
          soft: '#DDEFF1',
        },
        harvest: '#D88732',
        wheat: '#E7C66A',
        surface: '#FFFDF8',
        canvas: '#F7F4EC',
        kisan: {
          bg: {
            DEFAULT: '#F8F9FA',
            subtle: '#F1F3F5',
            warm: '#FAFAF7',
            canvas: '#F4F5F2'
          },
          green: {
            50: '#F0F7F2',
            100: '#DCEDE1',
            500: '#2E7D47',
            600: '#236537',
            700: '#1B502C',
            800: '#143E22',
            900: '#0E2C17',
            950: '#081B0E',
          },
          earth: {
            50: '#FAF8F5',
            100: '#F3ECE2',
            200: '#E4D6C3',
            500: '#9C7A4A',
            800: '#4A3720',
            900: '#2E2214',
          },
          blue: {
            50: '#F0F6FC',
            100: '#E1EDFB',
            500: '#2A6F97',
            600: '#1E5879',
            700: '#16435D',
            900: '#0C2738',
          },
          harvest: {
            50: '#FEF6F0',
            100: '#FDE9DA',
            500: '#E06D3B',
            600: '#C95927',
            700: '#A34217',
            900: '#652309',
          },
          charcoal: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
            950: '#020617',
          }
        }
      },
      boxShadow: {
        'glass-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.04), 0 1px 3px -1px rgba(0, 0, 0, 0.02)',
        'glass-md': '0 8px 24px -4px rgba(14, 44, 23, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'glass-lg': '0 20px 40px -10px rgba(14, 44, 23, 0.09), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'glass-float': '0 25px 50px -12px rgba(14, 44, 23, 0.14), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
        'inner-light': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'field-pulse': 'fieldPulse 8s ease-in-out infinite',
        'subtle-drift': 'subtleDrift 20s ease-in-out infinite alternate',
        'ambient-glow': 'ambientGlow 10s ease-in-out infinite alternate',
      },
      keyframes: {
        fieldPulse: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.008)' },
        },
        subtleDrift: {
          '0%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '100%': { transform: 'translate(10px, 6px) rotate(0.5deg)' },
        },
        ambientGlow: {
          '0%': { opacity: '0.3', transform: 'scale(0.98)' },
          '100%': { opacity: '0.6', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
