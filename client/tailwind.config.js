/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        turf: {
          light: '#10b981', // Emerald 500
          DEFAULT: '#059669', // Emerald 600
          dark: '#047857', // Emerald 700
          glow: 'rgba(16, 185, 129, 0.15)'
        },
        accent: {
          gold: '#f59e0b', // Amber 500
          coral: '#f43f5e', // Rose 500
        },
        slatebg: {
          light: '#1e293b', // Slate 800
          DEFAULT: '#0f172a', // Slate 900
          dark: '#020617', // Slate 950
          glass: 'rgba(30, 41, 59, 0.65)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
