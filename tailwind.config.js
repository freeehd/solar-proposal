/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
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
        // New color palette
        "indigo-dye": {
          DEFAULT: "#125170",
          100: "#031016",
          200: "#06202c",
          300: "#093042",
          400: "#0c4058",
          500: "#125170",
          600: "#1a7aaa",
          700: "#2aa3e4",
          800: "#6ac0ec",
          900: "#b4dff5",
        },
        "french-gray": {
          DEFAULT: "#c2cadc",
          100: "#1e2333",
          200: "#3c4666",
          300: "#5a6999",
          400: "#8a95b7",
          500: "#c2cadc",
          600: "#cdd4e3",
          700: "#d9deea",
          800: "#e6e9f1",
          900: "#f2f4f8",
        },
        "smoky-black": {
          DEFAULT: "#0b0a08",
          100: "#020201",
          200: "#040403",
          300: "#060604",
          400: "#080806",
          500: "#0b0a08",
          600: "#3a3525",
          700: "#6a6042",
          800: "#9a8c60",
          900: "#c9b99f",
        },
        white: {
          DEFAULT: "#ffffff",
        },
        olive: {
          DEFAULT: "#3a3525",
          100: "#161707",
          200: "#2c2e0e",
          300: "#424515",
          400: "#585c1c",
          500: "#6b7222",
          600: "#97a12f",
          700: "#bfca3c",
          800: "#d2d973",
          900: "#e8ecb9",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

