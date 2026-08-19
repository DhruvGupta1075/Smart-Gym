/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gym: {
          darker: '#06070B',
          dark: '#0B0D14',
          card: '#10131E',
          cardLight: '#181D2E',
          border: '#23283B',
          borderLight: '#343B54',
          red: '#EF4444',
          redGlow: '#F87171',
          crimson: '#DC2626',
          ruby: '#B91C1C',
          darkRed: '#991B1B',
          amber: '#F59E0B',
          gold: '#FBBF24',
          emerald: '#10B981',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.6))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.2))' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
