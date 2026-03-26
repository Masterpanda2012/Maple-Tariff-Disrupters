import type { Config } from "tailwindcss";

/** Brand palette — Maple Tariff Disruptors (see project-spec.md). */
export default {
  theme: {
    extend: {
      colors: {
        maple: "#C41230",
        cream: "#F8F4EF",
        charcoal: "#1A1A1A",
        background: "#F8F4EF",
        foreground: "#1A1A1A",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "hero-blob": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(4%, -3%) scale(1.06)" },
        },
        "hero-blob-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-5%, 4%) scale(1.1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "page-enter": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(-14px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(14px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "70%": { transform: "scale(1.02)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "maple-glow": {
          "0%, 100%": {
            filter: "drop-shadow(0 0 0px transparent)",
          },
          "50%": {
            filter: "drop-shadow(0 0 5px rgba(196, 18, 48, 0.22))",
          },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "wiggle-once": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "35%": { transform: "rotate(-2.5deg)" },
          "70%": { transform: "rotate(2.5deg)" },
        },
        "shimmer-line": {
          "0%, 100%": { opacity: "0.2", transform: "scaleX(0.88)" },
          "50%": { opacity: "0.5", transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.55s ease-out both",
        "scale-in": "scale-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "hero-blob": "hero-blob 20s ease-in-out infinite",
        "hero-blob-2": "hero-blob-2 26s ease-in-out infinite",
        shimmer: "shimmer 1.4s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        "page-enter": "page-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in-left": "fade-in-left 0.65s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in-right": "fade-in-right 0.65s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "maple-glow": "maple-glow 4.5s ease-in-out infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        "wiggle-once": "wiggle-once 0.55s ease-in-out 1 both",
        "shimmer-line": "shimmer-line 5s ease-in-out infinite",
      },
    },
  },
} satisfies Config;
