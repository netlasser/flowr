/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        brand: {
          400: '#34d399',
          500: '#10b981',
        },
        whiplash: {
          500: '#ef4444',
          600: '#dc2626',
        },
        buffer: {
          500: '#f59e0b',
          600: '#d97706',
        },
        dark: {
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s cubic-bezier(.22,1,.36,1)',
        'guardian-pulse': 'guardian-pulse 4s ease-in-out infinite',
        'breath': 'breath 6s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'guardian-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.03)', opacity: '1' },
        },
        'breath': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
