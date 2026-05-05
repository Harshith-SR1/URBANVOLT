/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-dark': '#020617',
        'dark-bg': '#0F172A',
        'dark-card': '#1E293B',
        'primary': '#3B82F6',
        'accent': '#14B8A6',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        'glass-border': 'rgba(255,255,255,0.08)',
      },
      animation: {
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59,130,246,0.2), 0 0 10px rgba(59,130,246,0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(59,130,246,0.6), 0 0 20px rgba(59,130,246,0.6)' },
        }
      }
    },
  },
  plugins: [],
}
