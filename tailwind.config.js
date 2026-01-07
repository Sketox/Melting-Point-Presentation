/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Claude-inspired color palette
        claude: {
          bg: '#1a1a1a',
          'bg-secondary': '#2a2a2a',
          'bg-tertiary': '#3a3a3a',
          orange: '#da7756',
          'orange-light': '#e89b7f',
          'orange-dark': '#c45a3a',
          'orange-glow': 'rgba(218, 119, 86, 0.3)',
          text: '#f5f5f5',
          'text-secondary': '#a0a0a0',
          'text-muted': '#6b6b6b',
          border: '#404040',
          success: '#4ade80',
          warning: '#fbbf24',
          error: '#f87171',
        }
      },
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(218, 119, 86, 0.3)',
        'glow-lg': '0 0 40px rgba(218, 119, 86, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(218, 119, 86, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
