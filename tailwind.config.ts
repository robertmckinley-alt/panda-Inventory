import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      colors: {
        brand: {
          DEFAULT: "#72BC44",
          black: "#000000",
          white: "#FFFFFF",
          accent: "#72BC44",
          accentBright: "#8FD158",
          accentDark: "#4a8f2c",
          accentSoft: "rgba(114, 188, 68, 0.12)"
        },
        ink: {
          950: "#070b16",
          900: "#0b1020",
          800: "#111827",
          700: "#1a2233",
          600: "#26304a"
        }
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 1px 2px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.25)",
        cardLight: "0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,23,42,0.06), 0 6px 18px rgba(15,23,42,0.05)"
      }
    }
  },
  plugins: []
};

export default config;
