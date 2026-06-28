/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sindhi: ['var(--font-sindhi)', 'serif'] },
      colors: {
        brand: { DEFAULT: '#c8102e', dark: '#8f0a20', light: '#fdebed' },
        accent: { DEFAULT: '#c8102e', dark: '#8f0a20' },
        ink: '#1a1a1a',
      },
    },
  },
  plugins: [],
};
