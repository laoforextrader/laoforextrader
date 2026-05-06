import { Rocket, Zap } from "lucide-react"
import { GalaxyCanvas } from "@/components/ui/GalaxyCanvas"
import { HyperspaceCanvas } from "@/components/ui/HyperspaceCanvas"
import styles from "./EASGrideCTA.module.css"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { EAStats } from "@/types"

const LINE_URL = "https://line.me/R/ti/p/@499dvtuz"

function fmtPct(n: number | undefined, fallback: string): string {
  if (n === undefined || n === null || isNaN(n)) return fallback
  const sign = n >= 0 ? "+" : ""
  return `${sign}${n.toFixed(1)}%`
}

function pctColor(n: number | undefined, fallback: string): string {
  if (n === undefined || n === null || isNaN(n)) return fallback
  return n >= 0 ? "#4ADE80" : "#EF4444"
}

// Returns months running since the EA's first monthly return entry.
function monthsSince(monthStr: string | undefined): number | null {
  if (!monthStr) return null
  const m = monthStr.match(/^(\d{4})-(\d{1,2})$/)
  if (!m) return null
  const sy = parseInt(m[1], 10)
  const sm = parseInt(m[2], 10) - 1
  if (isNaN(sy) || isNaN(sm)) return null
  const now = new Date()
  const months = (now.getFullYear() - sy) * 12 + (now.getMonth() - sm) + 1
  return Math.max(1, months)
}

interface ShowcaseProps {
  eaId: string
  variant: "galaxy" | "hyperspace"
  theme: "blue" | "purple"
  badgeLabel: string
  titleText: string
  subtitleAccent: string
  description: string
  strategy: string
  risk: string
  riskColor: string // for stat card badge
  fallbacks: {
    totalPct: string
    monthPct: string
    dayPct: string
    months: number
  }
}

export default async function EAShowcaseSection({
  eaId, variant, theme,
  badgeLabel, titleText, subtitleAccent, description,
  strategy, risk, riskColor,
  fallbacks,
}: ShowcaseProps) {
  let stats: EAStats | null = null
  try {
    stats = await sanityClient.fetch<EAStats>(
      QUERIES.eaStatsByEaId(eaId),
      {},
      { next: { revalidate: 60 } }
    )
    if (!stats || stats.updateMode === "off") stats = null
  } catch {}

  const totalDisplay = fmtPct(stats?.profitTotalPct, fallbacks.totalPct)
  const totalColor   = pctColor(stats?.profitTotalPct, "#4ADE80")

  const monthly      = stats?.monthlyReturns ?? []
  const lastMonth    = monthly.length ? monthly[monthly.length - 1] : null
  const monthDisplay = fmtPct(lastMonth?.profitPct, fallbacks.monthPct)
  const monthColor   = pctColor(lastMonth?.profitPct, "#60A5FA")

  const daily        = stats?.dailyReturns ?? []
  const lastDay      = daily.length ? daily[daily.length - 1] : null
  const dayDisplay   = fmtPct(lastDay?.profitPct, fallbacks.dayPct)
  const dayColor     = pctColor(lastDay?.profitPct, "#4ADE80")

  const firstMonth   = monthly[0]?.month
  const months       = monthsSince(firstMonth) ?? fallbacks.months
  const monthsLabel  = `Total Growth · ${months} ${months === 1 ? "month" : "months"}`

  const isPurple = theme === "purple"
  const Icon = isPurple ? Zap : Rocket
  const iconColor = isPurple ? "#F472B6" : "#FCD34D"

  // Section background — overrides default blue gradient when purple.
  const sectionBg = isPurple
    ? "linear-gradient(135deg, #0A031F 0%, #1B0F36 50%, #2A0A40 100%)"
    : undefined

  // Pill (live badge) tint matches theme.
  const pillBg     = isPurple ? "rgba(196,181,253,0.14)" : "rgba(96,165,250,0.15)"
  const pillBorder = isPurple ? "rgba(196,181,253,0.35)" : "rgba(96,165,250,0.35)"
  const pillText   = isPurple ? "#DDD6FE"               : "#93C5FD"

  // Subtitle gradient (matches theme accent).
  const subtitleGradient = isPurple
    ? "linear-gradient(135deg, #C4B5FD, #F472B6)"
    : "linear-gradient(135deg, #60A5FA, #A78BFA)"

  // CTA gradient.
  const ctaGradient = isPurple
    ? "linear-gradient(135deg, #7C3AED, #DB2777)"
    : "linear-gradient(135deg, #2563EB, #4F46E5)"
  const ctaShadow   = isPurple
    ? "0 8px 24px rgba(124,58,237,0.4)"
    : "0 8px 24px rgba(37,99,235,0.4)"

  return (
    <section className={styles.section} style={sectionBg ? { background: sectionBg } : undefined}>
      {variant === "galaxy" ? <GalaxyCanvas /> : <HyperspaceCanvas />}

      <div className={styles.grid}>
        {/* Left */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: pillBg, border: `1px solid ${pillBorder}`,
            borderRadius: 100, padding: "5px 14px",
            fontSize: 11, color: pillText, fontWeight: 700,
            marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase",
            backdropFilter: "blur(6px)",
          }}>
            <Icon size={13} strokeWidth={2.5} style={{ color: iconColor }} />
            {badgeLabel}
          </div>

          <div role="heading" aria-level={2} className={styles.rocketTitle} style={{ marginBottom: 8 }}>
            <span className={styles.rocketIconWrap} aria-hidden="true">
              <Icon size={32} strokeWidth={2.4} style={{ color: iconColor }} />
            </span>
            <span>{titleText}</span>
          </div>

          <p style={{
            fontSize: 16, fontWeight: 700, marginBottom: 8,
            background: subtitleGradient,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            {subtitleAccent}
          </p>

          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7, marginBottom: 32, whiteSpace: "pre-line",
            fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            {description}
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: ctaGradient,
                color: "#fff", textDecoration: "none",
                padding: "14px 28px", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                fontFamily: "Noto Sans Lao, sans-serif",
                boxShadow: ctaShadow,
              }}
            >
              <Icon size={15} strokeWidth={2.5} />
              ເບິ່ງ Live Results →
            </a>
          </div>
        </div>

        {/* Right — stat card */}
        <div style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 20, padding: 28,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(74,222,128,0.12)",
            border: "0.5px solid rgba(74,222,128,0.35)",
            borderRadius: 100, padding: "4px 12px",
            fontSize: 11, color: "#4ADE80", fontWeight: 600, marginBottom: 20,
          }}>
            <span className={styles.pulseDot} />
            Live Account Running
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4,
              fontFamily: "JetBrains Mono, monospace",
            }}>
              <Icon size={11} strokeWidth={2.5} style={{ color: iconColor }} />
              {badgeLabel}
            </div>
            <div style={{
              fontSize: 48, fontWeight: 700, color: totalColor,
              fontFamily: "JetBrains Mono, monospace", lineHeight: 1,
            }}>
              {totalDisplay}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              {monthsLabel}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "ເດືອນນີ້", value: monthDisplay, color: monthColor },
              { label: "ມື້ນີ້",   value: dayDisplay,   color: dayColor },
              { label: "Strategy", value: strategy,     color: isPurple ? "#F472B6" : "#A78BFA" },
              { label: "Risk",     value: risk,         color: riskColor },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8, padding: "10px 12px",
              }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 600, color: s.color,
                  fontFamily: "JetBrains Mono, monospace",
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
