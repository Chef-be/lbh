import type { Config } from "tailwindcss";

const configuration: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/composants/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette principale BEE — tons bleu-gris professionnels
        primaire: {
          50: "#f0f4ff",
          100: "#dce6fd",
          200: "#bcd0fb",
          300: "#90b1f8",
          400: "#6088f3",
          500: "#3b63ee",
          600: "#2745e3",
          700: "#1f35d0",
          800: "#1e2ea9",
          900: "#1e2d85",
          950: "#161d52",
        },
        // Couleur secondaire — teinte chaude pour les éléments d'accent
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f97316",
          600: "#ea6f0e",
          700: "#c2550b",
        },
        // Couleurs sémantiques
        succes: "#16a34a",
        alerte: "#d97706",
        danger: "#dc2626",
        info: "#0ea5e9",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default configuration;
