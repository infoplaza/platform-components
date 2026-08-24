import forms from '@tailwindcss/forms'

export default {
  darkMode: 'class',
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
    },
  },
  plugins: [forms],
}
