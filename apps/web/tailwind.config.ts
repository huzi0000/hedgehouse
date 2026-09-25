import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0D0C",
        surface: {
          DEFAULT: "#121514",
          subtle: "#161A18",
          raised: "#1B201E",
          hover: "#222725",
        },
        border: {
          DEFAULT: "#222725",
          strong: "#2E3633",
          light: "#181D1B",
        },
        text: {
          primary: "#F4F4F0",
          secondary: "#8A918E",
          subtle: "#565E5A",
        },
        brand: {
          DEFAULT: "#10B981",
          hover: "#059669",
          muted: "rgba(16, 185, 129, 0.12)",
          glow: "rgba(16, 185, 129, 0.25)",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
