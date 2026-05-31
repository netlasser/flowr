/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom curated, harmonious palette for high productivity and focus
        // Focus green, calm darks, transition amber
        brand: {
          50: '#f4fbf7',
          100: '#e7f7ed',
          200: '#c2edd3',
          500: '#10b981', // focus emerald
          600: '#059669',
          700: '#047857',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#0f172a',
          900: '#090d16', // super deep sleek dark space
          950: '#030712',
        },
        whiplash: {
          500: '#ef4444', // whiplash alert red
          600: '#dc2626',
        },
        buffer: {
          500: '#f59e0b', // buffer alert amber
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'breath': 'breath 5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.12)', opacity: '1' },
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
