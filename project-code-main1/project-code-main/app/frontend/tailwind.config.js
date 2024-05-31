/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';
import tailwindcssTypography from '@tailwindcss/typography';
import 'tailwindcss-radix';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      current: 'currentColor',
      transparent: 'transparent',
      white: '#FFFFFF',
      black: '#000000',
      dark: {
        100: '#474747',
        200: '#353535',
        300: '#292929'
      },
      purple: {
        100: '#F5EBFF',
        200: '#E6CDFF',
        300: '#AC72E7',
        400: '#A666E6',
        500: '#9831FF',
        600: '#7200E3'
      },
      red: {
        100: '#FCC7C5',
        200: '#FF4444',
        300: '#F5503D',
        400: '#FF0000'
      },
      green: {
        100: '#DCFBEA',
        200: '#28AF66',
        300: '#249F5D',
        400: '#208D53'
      },
      blue: {
        100: '#C7E2FF',
        200: '#007BFF',
        300: '#0047FF',
        400: '#2147A8'
      },
      gray: {
        100: '#F7F8FC',
        200: '#F4F5F5',
        300: '#E3E4E6',
        400: '#E0E2E7',
        500: '#CACCD0',
        600: '#B1B4BA',
        700: '#989CA7',
        800: '#989DA9',
        900: '#757B8A'
      },
      indigo: {
        500: '#6A63FE'
      }
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['18px', '26px'],
      xl: ['20px', '24px'],
      '2xl': ['24px', '32px'],
      '3xl': ['24px', '40px'],
      '4xl': ['32px', '40px'],
      '5xl': ['40px', '48px'],
      '6xl': ['64px', '1']
    },
    extend: {
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        jakarta: ['Jakarta', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      backgroundImage: (theme) => ({
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': `linear-gradient(77deg, ${theme('colors.purple.500')}, ${theme(
          'colors.red.200'
        )})`
      }),
      gridTemplateColumns: {
        cards: 'repeat(auto-fill, minmax(300px, auto))',
        'small-cards': 'repeat(auto-fill, minmax(200px, auto))'
      },
      zIndex: {
        overlay: 1,
        modal: 2,
        dropdown: 3,
        toast: 4
      },
      keyframes: {
        dots: {
          '0%': { content: '' },
          '25%': { content: '.' },
          '50%': { content: '..' },
          '75%': { content: '...' },
          '100%': { content: '' }
        },
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        contentShow: {
          from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
        },
        'slide-to-left': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' }
        },
        'slide-to-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' }
        }
      },
      animation: {
        dots: 'dots 1s infinite',
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-to-left': 'slide-to-left 150ms linear',
        'slide-to-right': 'slide-to-right 150ms linear'
      }
    }
  },
  plugins: [tailwindcssAnimate, tailwindcssTypography]
};
