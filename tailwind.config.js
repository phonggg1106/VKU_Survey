/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vku: {
          blue: {
            DEFAULT: '#0047BA',
            dark: '#002A54',
            light: '#2563EB',
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#002a54',
          },
          red: {
            DEFAULT: '#E31B23',
            dark: '#B91C1C',
            light: '#EF4444',
            50: '#fef2f2',
            100: '#fee2e2',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
          },
          yellow: {
            DEFAULT: '#FDB813',
            dark: '#D97706',
            light: '#FBBF24',
            50: '#fffbeb',
            100: '#fef3c7',
            400: '#facc15',
            500: '#f59e0b',
            600: '#d97706',
          },
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#002a54',
        }
      }
    },
  },
  plugins: [],
}

