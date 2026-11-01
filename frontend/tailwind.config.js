/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Distinctive Indian-inspired B2B SaaS Palette
        brand: {
          50: '#FFF5F1',
          100: '#FFE8DF',
          200: '#FFD0BF',
          300: '#FFAA8D',
          400: '#FF7E54',
          500: '#F05A28', // Primary Orange
          600: '#DE4714',
          700: '#B9340B',
          800: '#942C0E',
          900: '#7A270F',
          950: '#431204',
        },
        purple: {
          50: '#F7F4FE',
          100: '#EFEAFC',
          200: '#E0D6FA',
          300: '#C8B6F6',
          400: '#A88DF1',
          500: '#8A63EB',
          600: '#6C3CE9', // Royal Purple
          700: '#5828D2',
          800: '#4820B0',
          900: '#3D1C8F',
          950: '#230E5B',
        },
        warm: {
          50: '#FAF8F5',  // Warm Canvas Background
          100: '#F4F0E8', // Light tinted containers
          200: '#EBE7DF', // Standard subtle warm border
          300: '#DDD8CE',
          400: '#BDB6A8',
          500: '#9E9687',
        },
        ink: {
          DEFAULT: '#24212B', // Main text
          primary: '#24212B',
          secondary: '#706B78', // Muted secondary text
          muted: '#9D97A5',     // Metadata & placeholder
          border: '#EBE7DF',
        },
        // Semantic colours kept restrained
        semantic: {
          success: '#10B981',
          'success-bg': '#ECFDF5',
          'success-border': '#A7F3D0',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          'warning-border': '#FDE68A',
          danger: '#EF4444',
          'danger-bg': '#FEF2F2',
          'danger-border': '#FECACA',
          info: '#3B82F6',
          'info-bg': '#EFF6FF',
          'info-border': '#BFDBFE',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(36, 33, 43, 0.04)',
        'card': '0 1px 3px 0 rgba(36, 33, 43, 0.04), 0 1px 2px -1px rgba(36, 33, 43, 0.04)',
        'float': '0 4px 20px -2px rgba(36, 33, 43, 0.06), 0 2px 6px -1px rgba(36, 33, 43, 0.03)',
        'elevation': '0 10px 30px -4px rgba(36, 33, 43, 0.08), 0 4px 10px -2px rgba(36, 33, 43, 0.04)',
        'modal': '0 20px 40px -8px rgba(36, 33, 43, 0.14), 0 1px 3px 0 rgba(36, 33, 43, 0.06)',
      },
      borderRadius: {
        'card': '14px',
        'panel': '18px',
      }
    },
  },
  plugins: [],
}
