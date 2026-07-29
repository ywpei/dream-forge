/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dream: {
          bg: "#0f172a",
          card: "#1e293b",
          accent: "#818cf8",
          "accent-light": "#a5b4fc",
          text: "#f1f5f9",
          muted: "#94a3b8",
          border: "#334155",
          glow: "#818cf8",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(129, 140, 248, 0.15)",
        "glow-lg": "0 0 40px rgba(129, 140, 248, 0.25)",
        "glow-input": "0 0 15px rgba(129, 140, 248, 0.15), 0 0 30px rgba(129, 140, 248, 0.05)",
        "glow-btn": "0 0 15px rgba(129, 140, 248, 0.3), 0 0 30px rgba(129, 140, 248, 0.1)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "breathe": "breathe 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(129, 140, 248, 0.1)" },
          "50%": { boxShadow: "0 0 25px rgba(129, 140, 248, 0.3)" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(129, 140, 248, 0.15)" },
          "50%": { boxShadow: "0 0 20px rgba(129, 140, 248, 0.3)" },
        },
      },
    },
  },
  plugins: [],
};