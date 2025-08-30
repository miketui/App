import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Basquiat-inspired color palette
        'basquiat': {
          'bg': '#0B0B0B',        // near-black canvas
          'surface': '#111113',    // deep charcoal
          'text': '#F2F2F2',      // chalk white
          'muted': '#B8B8B8',     // gray pencil
          'yellow': '#F7D046',    // crown yellow
          'red': '#E1423A',       // crimson mark
          'blue': '#2A7DE1',      // electric blue
          'teal': '#2BB7A9',      // paint teal
          'pink': '#F45FA5',      // neon pink
        },
        // Map semantic colors to Basquiat palette
        primary: {
          DEFAULT: '#F7D046',     // yellow
          foreground: '#0B0B0B',
        },
        secondary: {
          DEFAULT: '#2A7DE1',     // blue
          foreground: '#F2F2F2',
        },
        accent: {
          DEFAULT: '#E1423A',     // red
          foreground: '#F2F2F2',
        },
        background: '#0B0B0B',
        foreground: '#F2F2F2',
        card: {
          DEFAULT: '#111113',
          foreground: '#F2F2F2',
        },
        popover: {
          DEFAULT: '#111113',
          foreground: '#F2F2F2',
        },
        muted: {
          DEFAULT: '#B8B8B8',
          foreground: '#0B0B0B',
        },
        destructive: {
          DEFAULT: '#E1423A',
          foreground: '#F2F2F2',
        },
        border: '#2A7DE1',
        input: '#111113',
        ring: '#F7D046',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'basquiat': '0.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
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
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(247, 208, 70, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(247, 208, 70, 0.6)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: ['class'],
} satisfies Config;