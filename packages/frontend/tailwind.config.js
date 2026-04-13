/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  // ✅ WAJIB: Enable class-based dark mode
  darkMode: 'class',
  
  theme: {
    extend: {
      colors: {
        // Light mode defaults (Tailwind built-in)
        // Dark mode will override with dark:* variants
        
        // Primary brand colors
        primary: {
          DEFAULT: '#6366f1',    // Indigo
          hover: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.5)'
        },
        accent: {
          DEFAULT: '#8b5cf6',    // Purple
          hover: '#7c3aed'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        
        // ✅ Custom dark theme (hanya untuk dark mode)
        background: {
          DEFAULT: '#0a0a0f',      // Dark: used with dark:bg-background
          secondary: '#13131f',
          tertiary: '#1a1a2e'
        },
        text: {
          primary: '#ffffff',      // Dark: used with dark:text-text-primary
          secondary: '#94a3b8',
          muted: '#64748b'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        'glass': 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}