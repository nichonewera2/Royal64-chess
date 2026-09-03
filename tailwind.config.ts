import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deeper near-black brown base + saturated amber/copper accents —
        // a punchier vintage-wood palette than the previous chocolate tone.
        espresso: {
          950: '#0f0a06',
          900: '#170f09',
          800: '#1f150d',
          700: '#2a1d12'
        },
        walnut: {
          800: '#3a2716',
          700: '#4a331d',
          600: '#5c4024'
        },
        mahogany: {
          600: '#8a3820',
          500: '#a3432a'
        },
        parchment: {
          100: '#f6e9cf',
          200: '#efdcb8',
          300: '#e3c691'
        },
        ivory: '#faf1de',
        gold: {
          400: '#f0a83c',
          500: '#e08e1f',
          600: '#c2760f'
        },
        amber: {
          400: '#ffb454',
          500: '#f59b1f'
        },
        bronze: '#8a6a3f'
      },
      fontFamily: {
        display: ['"Wood Chaos"', 'var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        player: ['Leander', 'var(--font-display)', 'cursive']
      },
      boxShadow: {
        board: '0 20px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,162,75,0.15)',
        panel: '0 10px 30px -10px rgba(0,0,0,0.5)'
      },
      backgroundImage: {
        // Dark squares are a proper walnut BROWN, not near-black — this is
        // also what real wooden chess boards look like (brown/tan, not
        // black/tan). The earlier near-black value (#0f0a06) was almost
        // identical to the black piece color, so black pieces on dark
        // squares had almost no contrast. Light squares are unchanged.
        'wood-dark':
          'linear-gradient(135deg, #6b4226 0%, #59371f 50%, #4a2c17 100%)',
        'wood-light':
          'linear-gradient(135deg, #efdcb8 0%, #e3c691 50%, #d4ac6e 100%)'
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
