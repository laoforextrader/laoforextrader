import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: { DEFAULT: "#2563EB", light: "#EEF3FF", mid: "#BFCFFF", dark: "#1D4ED8" },
        indigo: { DEFAULT: "#4F46E5" },
      },
      fontFamily: {
        // ใช้ Noto Sans Lao ทั้งหมด
        sans: ["Noto Sans Lao", "sans-serif"],
        lao:  ["Noto Sans Lao", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#374151",
            fontFamily: "'Noto Sans Lao', sans-serif",
            h1: { color: "#111827", fontFamily: "'Noto Sans Lao', sans-serif" },
            h2: { color: "#111827", fontFamily: "'Noto Sans Lao', sans-serif" },
            h3: { color: "#111827", fontFamily: "'Noto Sans Lao', sans-serif" },
            p:  { color: "#374151" },
            strong: { color: "#111827" },
            a: { color: "#2563EB" },
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
