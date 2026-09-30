import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0F2233", soft: "#1B3348", line: "#2A4359" },
        canvas: "#F2F4F7",
        line: "#D9DFE7",
        text: "#14212B",
        muted: "#5B6B7B",
        brand: { DEFAULT: "#0B5CAD", soft: "#E6F0FA", dark: "#084987" },
        ok: { DEFAULT: "#1F7A45", soft: "#DFF1E6" },
        warn: { DEFAULT: "#8A5700", soft: "#FCEFC8" },
        bad: { DEFAULT: "#B3261E", soft: "#FBE3E0" },
      },
      fontFamily: { sans: ['"Schibsted Grotesk Variable"', "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
