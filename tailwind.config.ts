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
    },
  },
} satisfies Config;
