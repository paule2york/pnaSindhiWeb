/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sindhi: ['var(--font-sindhi)', 'serif'] },
      colors: {
        brand: { DEFAULT: '#0d7a5f', dark: '#095c47', light: '#e6f4ef' },
        ink: '#1a1a1a',
      },
    },
  },
  plugins: [],
};
