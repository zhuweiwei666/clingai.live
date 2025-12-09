/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          primary: '#000000',
          secondary: '#0a0a0a',
          card: '#111111',
          elevated: '#1a1a1a',
        },
        // Accent colors
        accent: {
          start: '#ff6b8a',
          end: '#ff8e53',
          pink: '#ff4d7d',
          coral: '#ff6b6b',
          orange: '#ff9f43',
        },
        // Text colors
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#666666',
        },
        // Border
        border: {
          DEFAULT: '#222222',
        },
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 138, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 138, 0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #ff6b8a, #ff8e53)',
        'gradient-hot': 'linear-gradient(135deg, #f12711, #f5af19)',
        'gradient-viral': 'linear-gradient(135deg, #ff9f43, #ff6b6b)',
      },
    },
  },
  plugins: [],
}
