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
        brand: {
          DEFAULT: 'var(--accent, #175CD3)',
          light: 'var(--accent-light, #EEF4FD)',
          dark: 'var(--accent-active, #0A3580)',
        },
        surface: {
          DEFAULT: 'var(--surface, #FFFFFF)',
          muted: 'var(--surface-muted, #F1F4F9)',
          hover: 'var(--surface-hover, #E9EFF7)',
        },
        'sidebar-bg': 'var(--sidebar-bg, #FFFFFF)',
        'sidebar-border': 'var(--sidebar-border, #E2E7EF)',
        'header-bg': 'var(--header-bg, rgba(255, 255, 255, .96))',
        'header-border': 'var(--header-border, #E2E7EF)',
        'text-primary': 'var(--text-primary, #17253B)',
        'text-secondary': 'var(--text-secondary, #526176)',
        'text-muted': 'var(--text-tertiary, #7D8FA6)',
        border: 'var(--border, #E2E7EF)',
      },
      boxShadow: {
        'xs': 'var(--shadow-xs, 0 1px 2px rgba(21, 34, 56, .04))',
        'sm': 'var(--shadow-sm, 0 1px 3px rgba(21, 34, 56, .06))',
        'md': 'var(--shadow-md, 0 4px 8px -2px rgba(21, 34, 56, .06))',
        'lg': 'var(--shadow-lg, 0 8px 16px -4px rgba(21, 34, 56, .08))',
        glass: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'glass-hover': '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
      },
    },
  },
  plugins: [],
}
