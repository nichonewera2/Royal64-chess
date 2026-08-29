import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        espresso: {
          950: '#1c130d',
          900: '#241a12',
          800: '#2f2117',
          700: '#3c2c1f'
        },
        walnut: {
          800: '#4a3524',
          700: '#5c4130',
          600: '#6f4f3a'
        },
        mahogany: {
          600: '#7a3b2e',
          500: '#8f4636'
        },
        parchment: {
          100: '#f3e9d6',
          200: '#ece0c8',
          300: '#e1d0ae'
        },
        ivory: '#f8f1e4',
        gold: {
          400: '#c9a24b',
          500: '#b3893a',
          600: '#9a7530'
        },
        bronze: '#8a6a3f'
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        board: '0 20px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,162,75,0.15)',
        panel: '0 10px 30px -10px rgba(0,0,0,0.5)'
      },
      backgroundImage: {
        'wood-dark':
          'linear-gradient(135deg, #4a3524 0%, #3c2c1f 50%, #2f2117 100%)',
        'wood-light':
          'linear-gradient(135deg, #ece0c8 0%, #e1d0ae 50%, #d8c194 100%)'
      },
      keyframes: {
        'piece-lift': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-4px) scale(1.05)' }
        },
        'check-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(179,58,58,0.7)' },
          '50%': { boxShadow: '0 0 0 12px rgba(179,58,58,0)' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'piece-lift': 'piece-lift 150ms ease-out forwards',
        'check-pulse': 'check-pulse 1.1s ease-out 2',
        'fade-up': 'fade-up 400ms ease-out forwards'
      }
    }
  },
  plugins: []
};

export default config;
