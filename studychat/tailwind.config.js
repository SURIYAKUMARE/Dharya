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
        darkBase: '#0A0A0F',
        darkSurface: '#12121A',
        darkCard: 'rgba(255, 255, 255, 0.04)',
        primaryViolet: '#8B5CF6',
        accentBlue: '#0EA5E9',
        accentRed: '#EF4444',
        accentGreen: '#10B981',
        accentAmber: '#F59E0B',
        accentPurple: '#A855F7',
        accentTeal: '#14B8A6',
        accentPink: '#EC4899',
        accentIndigo: '#6366F1',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'glass-hover': '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
      },
    },
  },
  plugins: [],
}
