/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hyundai: {
          navy: '#002C5F',
          primary: '#0072CE',
          blue: '#0072CE',
          lightBlue: '#EAF4FF',
          sky: '#F0F7FF',
          accent: '#00AEEF',
          bg: '#F7F9FC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          borderSubtle: '#EDF2F7',
          dark: '#0F172A',
          muted: '#64748B',
          textDark: '#0A192F',
          textSecondary: '#475569',
          success: '#16A36A',
          warning: '#F59E0B',
          danger: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 2px 6px -1px rgba(0, 0, 0, 0.05), 0 1px 4px -2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(0, 44, 95, 0.08), 0 8px 10px -6px rgba(0, 44, 95, 0.04)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'card': '14px',
        'subtle': '10px'
      }
    },
  },
  plugins: [],
}
