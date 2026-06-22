module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './public/index.html',
  ],

  // CRITICAL — prefix prevents collision with Bootstrap classes
  prefix: 'tw-',

  // CRITICAL — disable Tailwind's base reset (Bootstrap already handles this)
  corePlugins: {
    preflight: false,
  },

  theme: {
    extend: {
      colors: {
        ink:          '#0D0D0D',
        canvas:       '#FAFAF8',
        surface:      '#FFFFFF',
        accent:       '#FF3D00',
        'accent-alt': '#FF8C42',
        muted:        '#6B7280',
        border:       '#E5E5E3',
        'dark-nav':   '#111111',
        success:      '#16A34A',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        ui:      ['Inter', 'system-ui', 'sans-serif'],
        brand:   ['"Space Grotesk"', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        'sm':   ['13px', { lineHeight: '1.5', letterSpacing: '0' }],
        'base': ['15px', { lineHeight: '1.6', letterSpacing: '0' }],
        'lg':   ['17px', { lineHeight: '1.5', letterSpacing: '0' }],
        'xl':   ['22px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        '2xl':  ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '3xl':  ['48px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'hero': ['72px', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
        '26': '104px',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 30px rgba(0,0,0,0.12)',
        'accent':  '0 8px 24px rgba(255,61,0,0.35)',
        'nav':     '0 2px 8px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'card': '10px',
        'btn':  '6px',
        'pill': '9999px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'sharp':  'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
};
