/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          950: '#070A10',
          900: '#090D16',
          850: '#0C1220',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155'
        },
        italia: {
          green: '#008C45',
          'green-light': '#00A852',
          'green-dark': '#064E26',
          'green-glow': '#008C4540',
          red: '#CD212A',
          'red-light': '#E63946',
          'red-dark': '#8B141B',
          'red-glow': '#CD212A40',
          white: '#F8FAFC',
          gold: '#D4AF37'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      backgroundImage: {
        'tricolor-gradient': 'linear-gradient(135deg, #008C45 0%, #ffffff 50%, #CD212A 100%)',
        'tricolor-horizontal': 'linear-gradient(90deg, #008C45 0%, #F8FAFC 50%, #CD212A 100%)',
        'green-gradient': 'linear-gradient(135deg, #008C45 0%, #0A5C36 100%)',
        'red-gradient': 'linear-gradient(135deg, #CD212A 0%, #991B1B 100%)',
        'luxury-glow': 'radial-gradient(circle at 50% 0%, rgba(0, 140, 69, 0.15) 0%, rgba(205, 33, 42, 0.08) 50%, transparent 80%)',
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'green-glow': '0 0 25px -5px rgba(0, 140, 69, 0.45)',
        'red-glow': '0 0 25px -5px rgba(205, 33, 42, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
