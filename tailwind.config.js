/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: #00FF01 (neon green) with approximated scale
        primary: {
          50: '#E6FFE6',
          100: '#CCFFCC',
          200: '#99FF99',
          300: '#66FF66',
          500: '#00FF01',
          600: '#00E600',
          700: '#00CC00',
          800: '#00B300',
          900: '#009900',
        },
        // Secondary: #6191FF (blue) with a soft scale
        secondary: {
          50: '#EEF3FF',
          100: '#DCE6FF',
          200: '#B9CDFF',
          300: '#96B5FF',
          500: '#6191FF',
          600: '#3B73FF',
          700: '#255FFF',
          800: '#1A4BCC',
          900: '#133899',
        },
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
        'fade': 'fade 2s ease-in-out infinite',
      },
      keyframes: {
        fade: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
