/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F7F8F6',
          50: '#FAFBF9',
          100: '#F7F8F6',
          200: '#EEF0EC',
        },
        forest: {
          DEFAULT: '#123C32',
          50: '#E8F0EE',
          100: '#C5D9D5',
          200: '#8DB5AE',
          300: '#5A9188',
          400: '#2A6D62',
          500: '#123C32',
          600: '#0D2E26',
          700: '#08201A',
          800: '#04120F',
          900: '#010605',
        },
        sage: {
          DEFAULT: '#A8B9AA',
          50: '#F0F3F0',
          100: '#DDE5DE',
          200: '#C5D1C7',
          300: '#A8B9AA',
          400: '#8BA38E',
          500: '#6E8D72',
          600: '#567059',
          700: '#3E5340',
          800: '#263628',
          900: '#0F1910',
        },
        charcoal: {
          DEFAULT: '#202724',
          50: '#F2F3F2',
          100: '#D9DDD9',
          200: '#B3BAB5',
          300: '#8C9690',
          400: '#66736A',
          500: '#404F45',
          600: '#202724',
          700: '#181E1B',
          800: '#101412',
          900: '#080A09',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      boxShadow: {
        'glass': '0 4px 24px -2px rgba(18, 60, 50, 0.08), 0 1px 4px rgba(18, 60, 50, 0.04)',
        'glass-lg': '0 8px 40px -4px rgba(18, 60, 50, 0.12), 0 2px 8px rgba(18, 60, 50, 0.06)',
        'glass-xl': '0 16px 60px -8px rgba(18, 60, 50, 0.16), 0 4px 16px rgba(18, 60, 50, 0.08)',
        'card': '0 1px 3px rgba(32, 39, 36, 0.06), 0 4px 16px rgba(32, 39, 36, 0.04)',
        'card-hover': '0 4px 20px rgba(32, 39, 36, 0.10), 0 8px 40px rgba(32, 39, 36, 0.06)',
        'inset-glass': 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.48) 100%)',
        'forest-gradient': 'linear-gradient(135deg, #123C32 0%, #1a5447 100%)',
        'sage-gradient': 'linear-gradient(135deg, #A8B9AA 0%, #8ba38e 100%)',
        'ivory-gradient': 'linear-gradient(180deg, #F7F8F6 0%, #EEF0EC 100%)',
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23123C32' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
}
