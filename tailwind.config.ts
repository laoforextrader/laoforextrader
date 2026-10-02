import type { Config } from "tailwindcss"

const config: Config = {
  // Manual toggle, not prefers-color-scheme: ThemeScript puts `dark` on
  // <html> from localStorage, falling back to the OS setting.
  darkMode: "class",
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

        // Theme tokens — defined in app/globals.css, flipped by html.dark.
        // Use these for every neutral; reach for a literal colour only when
        // it must stay put in both themes (white on a brand-blue button).
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
          sunken: "var(--surface-sunken)",
        },
        fg: {
          DEFAULT: "var(--fg)",
          2: "var(--fg-2)",
          3: "var(--fg-3)",
          4: "var(--fg-4)",
          inverse: "var(--fg-inverse)",
        },
        line: { DEFAULT: "var(--line)", 2: "var(--line-2)" },
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          2: "var(--accent-2)",
          soft: "var(--accent-soft)",
          soft2: "var(--accent-soft-2)",
          line: "var(--accent-line)",
          ink: "var(--accent-ink)",
        },
        ok:   { DEFAULT: "var(--success)", soft: "var(--success-soft)", line: "var(--success-line)", ink: "var(--success-ink)" },
        bad:  { DEFAULT: "var(--danger)",  soft: "var(--danger-soft)",  line: "var(--danger-line)",  ink: "var(--danger-ink)" },
        warn: { DEFAULT: "var(--warn)",    soft: "var(--warn-soft)",    line: "var(--warn-line)",    ink: "var(--warn-ink)" },
        pink: { DEFAULT: "var(--pink)" },
        violet: { DEFAULT: "var(--violet)", soft: "var(--violet-soft)", line: "var(--violet-line)" },
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
      keyframes: {
        ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        floatCard: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseDot: {
          '0%': { boxShadow: '0 0 0 0 rgba(37,99,235,0.4)' },
          '70%': { boxShadow: '0 0 0 8px rgba(37,99,235,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0)' }
        }
      },
      animation: {
        ticker: 'ticker 28s linear infinite',
        float: 'floatCard 5s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
export default config
