/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom Cinex design tokens
        cinex: {
          bg: {
            primary: "#060606",
            secondary: "#0D0D0D",
            tertiary: "#131313",
          },
          surface: "#181818",
          border: "#242424",
          "border-hover": "#333333",
          accent: {
            DEFAULT: "#D4A853",
            hover: "#E8BF6A",
            dim: "#8B6914",
            glow: "rgba(212,168,83,0.15)",
            "glow-strong": "rgba(212,168,83,0.25)",
          },
          text: {
            primary: "#F0F0F0",
            secondary: "#A3A3A3",
            muted: "#6B6B6B",
            inverse: "#060606",
          },
          tag: {
            scene: "#F2C94C",
            cast: "#2D9CDB",
            props: "#27AE60",
            location: "#9B59B6",
            wardrobe: "#E91E63",
            equipment: "#E67E22",
            vfx: "#E74C3C",
          },
        },
      },
      fontFamily: {
        cinzel: ["Cinzel", "Georgia", "serif"],
        "space-grotesk": ["Space Grotesk", "system-ui", "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        "jetbrains-mono": ["JetBrains Mono", "monospace"],
        telugu: ["Noto Sans Telugu", "sans-serif"],
      },
      spacing: {
        "space-1": "4px",
        "space-2": "8px",
        "space-3": "12px",
        "space-4": "16px",
        "space-5": "24px",
        "space-6": "32px",
        "space-7": "48px",
        "space-8": "64px",
        "space-9": "96px",
        "space-10": "128px",
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        "cinex-sm": "4px",
        "cinex-md": "8px",
        "cinex-lg": "12px",
        "cinex-xl": "16px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "cinex-sm": "0 1px 2px rgba(0,0,0,0.5)",
        "cinex-md": "0 4px 12px rgba(0,0,0,0.6)",
        "cinex-lg": "0 8px 24px rgba(0,0,0,0.7)",
        "cinex-glow": "0 0 24px rgba(212,168,83,0.15)",
        "cinex-glow-strong": "0 0 40px rgba(212,168,83,0.25)",
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left": {
          "0%": { opacity: "0", transform: "translateX(60px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 24px rgba(212,168,83,0.1)" },
          "50%": { boxShadow: "0 0 24px rgba(212,168,83,0.3)" },
        },
        "grain": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "30%": { transform: "translate(3%, -15%)" },
          "50%": { transform: "translate(12%, 9%)" },
          "70%": { transform: "translate(9%, 4%)" },
          "90%": { transform: "translate(-1%, 7%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-left": "slide-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "grain": "grain 0.5s steps(1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
