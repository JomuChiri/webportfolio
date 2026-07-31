import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#111827",
        surface: "#172033",
        elevated: "#1F2937",
        line: "rgba(255,255,255,0.10)",
        accent: "#3B82F6",
        cyan: "#5DE6FF"
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"],
        display: ["Hanken Grotesk", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(59,130,246,0.18), 0 24px 80px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: [typography]
};

export default config;

