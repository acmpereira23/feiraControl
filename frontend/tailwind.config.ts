import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#fff7ed",
          100: "#ffedd5",
          300: "#fdba74",
          500: "#f97316",
          700: "#c2410c",
          900: "#7c2d12"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 20px 60px rgba(249, 115, 22, 0.18)"
      }
    }
  },
  plugins: []
} satisfies Config;

