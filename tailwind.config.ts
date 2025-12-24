import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        gov: {
          dark: '#0B1120', // Slate 950
          panel: '#151F32', // Slate 900
          border: '#334155', // Slate 700
          text: '#F1F5F9', // Slate 100
          muted: '#94A3B8', // Slate 400
        },
        brand: {
          primary: '#3B82F6', // Blue 500
          accent: '#0EA5E9', // Sky 500
          glow: '#60A5FA', // Blue 400
        },
        status: {
          success: '#10B981', // Emerald 500
          warning: '#F59E0B', // Amber 500
          error: '#EF4444', // Red 500
          live: '#F43F5E', // Rose 500
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'waveform': 'waveform 1.5s ease-in-out infinite',
      },
      keyframes: {
        waveform: {
          '0%, 100%': { height: '10%' },
          '50%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
};

export default config;