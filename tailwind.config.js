/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base "esquí": nieve / hielo
        snow: "#f7fafd",
        ice: {
          50: "#f2f7fb",
          100: "#e3edf6",
          200: "#c8dbea",
          300: "#a3c1da",
          400: "#6f9dc3",
          500: "#4b7ea9",
          600: "#3a6488",
          700: "#2f4f6c",
          800: "#243b51",
          900: "#1a2b3b",
        },
        // Acento dorado / champán (guiño sutil, elegante)
        gold: {
          300: "#e8d6a3",
          400: "#d9bd77",
          500: "#c9a24b",
          600: "#a9853a",
        },
        // Cálido "chocolate / caramelo" (pelo de perro) para CTAs / hitos
        caramel: {
          300: "#d8a877",
          400: "#c48a4f",
          500: "#a86d33",
          600: "#8a5626",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
