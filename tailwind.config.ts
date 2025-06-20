import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Apple Design System Colors
        apple: {
          blue: "hsl(var(--apple-blue))",
          gray: "hsl(var(--apple-gray))",
          "gray-light": "hsl(var(--apple-gray-light))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontFamily: {
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.42857', letterSpacing: '-0.016em' }],
        'sm': ['0.875rem', { lineHeight: '1.42857', letterSpacing: '-0.016em' }],
        'base': ['1rem', { lineHeight: '1.47059', letterSpacing: '-0.022em' }],
        'lg': ['1.125rem', { lineHeight: '1.38889', letterSpacing: '-0.017em' }],
        'xl': ['1.25rem', { lineHeight: '1.38095', letterSpacing: '-0.017em' }],
        '2xl': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.022em' }],
        '3xl': ['1.875rem', { lineHeight: '1.16667', letterSpacing: '-0.022em' }],
      },
      boxShadow: {
        'apple': 'var(--apple-shadow)',
        'apple-hover': 'var(--apple-shadow-hover)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "apple-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "apple-fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "apple-slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "apple-preview-expand": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.02)", opacity: "0.8" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "apple-preview-collapse": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(0.98)", opacity: "0.8" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "apple-bounce": "apple-bounce 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "apple-fade-in": "apple-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "apple-slide-up": "apple-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "apple-preview-expand": "apple-preview-expand 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "apple-preview-collapse": "apple-preview-collapse 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
