import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import scrollbarHide from 'tailwind-scrollbar-hide';

export default {
  darkMode: 'class',
  content: [
    './i18n/**/*.{json,js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Courier'],
    },
    extend: {
      height: {
        screen: '100dvh',
      },
      fontSize: {
        '4xs': ['0.5rem', '1'],
        '3xs': ['0.6rem', '1'],
        '2xs': ['0.7rem', '1'],
      },
      colors: {
        primary: '#00BF78',
        'primary-50': '#7FDEBB',
        'primary-25': '#BFEFDD',
        'primary-10': '#EAF9F3',
        'dark-200': '#141412',
        dark: '#2E2E2B',
        'dark-50': '#969694',
        'dark-25': '#CBCBCB',
        marine: '#0070DE',
        'marine-200': '#004A8C',
        'marine-50': '#8FB5ED',
        'marine-25': '#C5DBF9',
        cloud: {
          DEFAULT: '#F2F2ED',
          200: '#D1D1CB',
          300: '#D8D8D1',
          400: '#E7E7DE',
          500: '#EBEBE5',
          600: '#E0E0D7',
        },
        gold: '#E7B549',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        jiggle: {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
      },
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
        '20': 'repeat(20, minmax(0, 1fr))',
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      animation: {
        wiggle: 'wiggle 200ms ease-in-out',
        jiggle: 'jiggle 2000ms ease-in-out infinite',
      },
      gridTemplateRows: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
      },
      maxWidth: {
        'screen-3xl': '1920px',
        'screen-4xl': '2560px',
      },
      typography: ({ theme }) => ({
        xs: {
          css: {
            fontSize: '0.75rem',
            lineHeight: '1.35',
            p: { marginTop: '0.4em', marginBottom: '0.4em' },
            h1: { fontSize: '1.25em' },
            h2: { fontSize: '1.1em' },
            h3: { fontSize: '1em' },
            h4: { fontSize: '0.95em' },
            'ul li': { marginTop: '0.25em', marginBottom: '0.25em' },
            'ol li': { marginTop: '0.25em', marginBottom: '0.25em' },
            code: {
              fontSize: '0.85em',
              backgroundColor: theme('colors.gray.100'),
              padding: '0.1em 0.25em',
              borderRadius: '0.2em',
            },
            '> :first-child': { marginTop: '0' },
            '> :last-child': { marginBottom: '0' },
          },
        },
      }),
    },
  },
  plugins: [
    typography,
    forms,
    scrollbarHide,
    ({ addVariant }) => {
      addVariant('fullscreen', '.is-fullscreen &');
    },
  ],
};
