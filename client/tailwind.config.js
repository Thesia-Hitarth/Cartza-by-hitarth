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
        ink:          '#0A0A0A',
        canvas:       '#F5F2EE',
        surface:      '#EDE9E1',
        cream:        '#EDE9E1',
        sand:         '#C8BCA8',
        charcoal:     '#1C1C1C',
        slate:        '#2E2E2E',
        accent:       '#C8A97E',
        'accent-dark':'#9E7B50',
        'accent-light':'#E8D5B7',
        muted:        '#8A8278',
        border:       '#C8BCA8',
        'dark-nav':   '#0A0A0A',
        success:      '#4A7A5A',
        red:          '#C94040',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', '-apple-system', 'sans-serif'],
        ui:      ['"DM Sans"', '-apple-system', 'sans-serif'],
        mono:    ['"DM Mono"', '"Courier New"', 'monospace'],
        brand:   ['"DM Sans"', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'micro': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.25em' }],
        'xs':    ['0.75rem',  { lineHeight: '1.4', letterSpacing: '0.08em' }],
        'sm':    ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'base':  ['1rem',     { lineHeight: '1.65', letterSpacing: '0' }],
        'md':    ['1.2rem',   { lineHeight: '1.5', letterSpacing: '0' }],
        'lg':    ['1.5rem',   { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'xl':    ['2.25rem',  { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '2xl':   ['3rem',     { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        '3xl':   ['4.5rem',   { lineHeight: '1.02', letterSpacing: '-0.03em' }],
      },
      letterSpacing: {
        'tight':   '-0.03em',
        'wide':    '0.08em',
        'wider':   '0.15em',
        'widest':  '0.25em',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '28': '7rem',
        '36': '9rem',
        '44': '11rem',
        '52': '13rem',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'none': '0',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out':   'cubic-bezier(0.76, 0, 0.24, 1)',
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'fast':   '150ms',
        'base':   '300ms',
        'slow':   '500ms',
        'slower': '800ms',
        'crawl':  '1200ms',
      },
    },
  },
  plugins: [],
};
