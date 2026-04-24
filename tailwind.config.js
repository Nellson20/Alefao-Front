/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6fc',
          100: '#dcecf9',
          200: '#bce0f4',
          300: '#8acdec',
          400: '#4faede',
          500: '#035fab',
          600: '#034a8a',
          700: '#033a6b',
          800: '#042f56',
          900: '#052a54',
          950: '#031a38',
        },
        accent: {
          50: '#fef8ee',
          100: '#fcefd8',
          200: '#fadab2',
          300: '#f6be83',
          400: '#f19e53',
          500: '#ec8104',
          600: '#dc6d03',
          700: '#b75304',
          800: '#92410b',
          900: '#75360c',
          950: '#3f1a04',
        },
        background: 'var(--bg-color)',
        surface: 'var(--surface-color)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
