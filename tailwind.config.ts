import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fin: {
          red: "#DF2531",
          background: "#0f0f0f",
          panel: "#1a1a1a",
          border: "#2a2a2a",
          text: "#f5f5f5",
          muted: "#a1a1aa",
          success: "#22c55e",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;
