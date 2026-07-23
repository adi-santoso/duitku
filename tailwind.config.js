/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f3f4f8',
          100: '#e5e8f0',
          400: '#7d879f',
          500: '#64708d',
          700: '#333d5b',
          800: '#242e4d',
          900: '#17213f',
          950: '#0c1222',
        },
        canvas: '#f4f1e9',
        surface: '#fffdf8',
        lime: '#c8f16d',
        coral: '#ff8068',
        violet: '#aa9cff',
        sky: '#78c6ef',
        primary: {
          50: '#f8fee9',
          100: '#edfcc8',
          200: '#dcf79d',
          300: '#c8f16d',
          400: '#8ebd31',
          500: '#55751f',
          600: '#465d20',
          700: '#3c4f20',
          800: '#465d20',
          900: '#3c4f20',
        }
      },
      boxShadow: {
        soft: '0 8px 34px rgba(41, 45, 67, 0.06)',
        float: '0 24px 70px rgba(41, 45, 67, 0.12)',
      }
    },
  },
  plugins: [],
}
