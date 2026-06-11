/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0a0a0a',
        surface: {
          primary: '#111111',
          elevated: '#1a1a1a',
          hover: '#222222',
        },
        border: {
          default: '#2a2a2a',
          subtle: '#1f1f1f',
          accent: '#3a3a3a',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#888888',
          muted: '#555555',
        },
        accent: {
          blue: '#3b82f6',
          green: '#22c55e',
          amber: '#f59e0b',
          red: '#ef4444',
          purple: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '10': '10px',
        '11': '11px',
        '12': '12px',
        '13': '13px',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'shake': 'nodeShake 0.5s ease-in-out',
        'glow-red': 'pulseGlowRed 2s ease-in-out infinite',
        'glow-amber': 'pulseGlowAmber 2s ease-in-out infinite',
        'glow-purple': 'pulseGlowPurple 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        nodeShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        },
        pulseGlowRed: {
          '0%, 100%': { boxShadow: '0 0 8px #ef444440' },
          '50%': { boxShadow: '0 0 20px #ef444480' },
        },
        pulseGlowAmber: {
          '0%, 100%': { boxShadow: '0 0 6px #f59e0b30' },
          '50%': { boxShadow: '0 0 14px #f59e0b60' },
        },
        pulseGlowPurple: {
          '0%, 100%': { boxShadow: '0 0 6px #a855f730' },
          '50%': { boxShadow: '0 0 16px #a855f760' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
