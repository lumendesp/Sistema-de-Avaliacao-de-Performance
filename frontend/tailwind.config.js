const { getJSDocReadonlyTag } = require('typescript');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',
        secondary: '#64748B',
        accent: '#F59E0B',
        background: '#F9FAFB',
        green: {
          main: '#08605F',
        },
        gray: {
          main: '#565656',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
