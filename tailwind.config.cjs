/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#0F172A',
        primary: '#2563EB',
        accent: '#F59E0B',
        success: '#16A34A',
        danger: '#DC2626',
      },
      borderRadius: {
        DEFAULT: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.07)',
        lg: '0 10px 15px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
