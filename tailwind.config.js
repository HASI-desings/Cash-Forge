/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. The Core Color Palette
      colors: {
        cyan: {
          DEFAULT: '#00FFFF', // Your Brand Primary
          50: '#F0FFFF',
          100: '#E0FFFF',
          200: '#B2FFFF',
          300: '#80FFFF',
          400: '#4DFFFF',
          500: '#00FFFF',
          600: '#00CCCC',
          700: '#009999',
          800: '#006666',
          900: '#003333',
        },
        slate: {
          850: '#1e293b', // Deep text color for contrast against white
        }
      },
      // 2. Typography (Thicker by default)
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontWeight: {
        base: '500',    // We bump normal text to 500
        heading: '700', // Headings are bold
        heavy: '800',   // Prices/Numbers are extra bold
      },
      // 3. Custom Animations for Micro-interactions
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-light': 'bounceLight 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceLight: {
          '0%, 100%': { transform: 'translateY(-3%)' },
          '50%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}