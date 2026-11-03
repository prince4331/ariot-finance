/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec0ff',
          400: '#599eff',
          500: '#327bf7',
          600: '#1d5ee9',
          700: '#1648d6',
          800: '#183ba8',
          900: '#193584',
        }
      }
    },
  },
  plugins: [],
}
