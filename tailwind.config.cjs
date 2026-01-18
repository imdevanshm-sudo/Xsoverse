/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'ui-sans-serif', 'system-ui'],
        manrope: ['Manrope', 'ui-sans-serif', 'system-ui'],
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        'soft-cream': '#F8F6F1',
      },
    },
  },
  plugins: [],
};

module.exports = config;
