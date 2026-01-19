/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary and Accent brand colors
        primary: "#3b82f6",
        accent: "#1d4ed8",
        // Primary text - off-white for reduced eye fatigue
        textPrimary: "#e5e7eb",
        // Muted text - blue-grey for labels
        textMuted: "#9ca3af",
        // Disabled state
        textDisabled: "#6b7280",
        // Status colors
        success: "#10b981",
        successLight: "rgba(16, 185, 129, 0.1)",
        danger: "#ef4444",
        dangerLight: "rgba(239, 68, 68, 0.1)",
        warning: "#f59e0b",
        warningLight: "rgba(245, 158, 11, 0.1)",
        info: "#3b82f6",
        infoLight: "rgba(59, 130, 246, 0.1)",
        // Card and background colors
        bg: "#0a0a0f",
        card: "#12121a",
        cardHover: "#1a1a24",
        cardLight: "rgba(18, 18, 26, 0.5)",
        border: "rgba(255, 255, 255, 0.08)",
        borderHighlight: "rgba(255, 255, 255, 0.12)",
        borderFocus: "rgba(16, 185, 129, 0.5)",
      },
      boxShadow: {
        // Card shadow for depth
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'card-glow': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        'glow-sm': '0 0 15px rgba(16, 185, 129, 0.15)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.2)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Consistent heading scale
        'heading-1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-2': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-3': ['1.5rem', { lineHeight: '1.4' }],
        'heading-4': ['1.25rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
