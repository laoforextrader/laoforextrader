import { Rocket, Zap, TrendingUp, Download, BarChart3 } from "lucide-react"
import Link from "next/link"
import { GalaxyCanvas } from "@/components/ui/GalaxyCanvas"
import { HyperspaceCanvas } from "@/components/ui/HyperspaceCanvas"
import { AuroraCanvas } from "@/components/ui/AuroraCanvas"
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
  variant: "galaxy" | "hyperspace" | "aurora"
  theme: "blue" | "purple" | "emerald"
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
  /** Pre-launch mode: hide all live profit numbers and show "Coming Soon". */
  comingSoon?: boolean
  /** Swap layout: stat card on the left, text on the right. */
  mirror?: boolean
  /**
   * When provided, render Copy Trade / Download / Backtest buttons instead of
   * the default single "Live Results" LINE button.
   */
  links?: {
    copyTrade?: string
    download?: string
    backtest?: string
  }
}

export default async function EAShowcaseSection({
  eaId, variant, theme,
  badgeLabel, titleText, subtitleAccent, description,
  strategy, risk, riskColor,
  fallbacks, comingSoon = false, mirror = false, links,
}: ShowcaseProps) {
  let stats: EAStats | null = null
  if (!comingSoon) {
    try {
      stats = await sanityClient.fetch<EAStats>(
        QUERIES.eaStatsByEaId(eaId),
        {},
        { next: { revalidate: 60 } }
      )
      if (!stats || stats.updateMode === "off") stats = null
    } catch {}
  }

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

  const isPurple  = theme === "purple"
  const isEmerald = theme === "emerald"
  const Icon = isEmerald ? TrendingUp : isPurple ? Zap : Rocket
  const iconColor = isEmerald ? "#FBBF24" : isPurple ? "#F472B6" : "#FCD34D"

  // Section background — overrides default blue gradient per theme.
  const sectionBg = isEmerald
    ? "linear-gradient(135deg, #021410 0%, #04241B 50%, #06342A 100%)"
    : isPurple
    ? "linear-gradient(135deg, #0A031F 0%, #1B0F36 50%, #2A0A40 100%)"
    : undefined

  // Pill (live badge) tint matches theme.
  const pillBg     = isEmerald ? "rgba(52,211,153,0.14)"  : isPurple ? "rgba(196,181,253,0.14)" : "rgba(96,165,250,0.15)"
  const pillBorder = isEmerald ? "rgba(52,211,153,0.38)"  : isPurple ? "rgba(196,181,253,0.35)" : "rgba(96,165,250,0.35)"
  const pillText   = isEmerald ? "#6EE7B7"                : isPurple ? "#DDD6FE"               : "#93C5FD"

  // Subtitle gradient (matches theme accent).
  const subtitleGradient = isEmerald
    ? "linear-gradient(135deg, #34D399, #FBBF24)"
    : isPurple
    ? "linear-gradient(135deg, #C4B5FD, #F472B6)"
    : "linear-gradient(135deg, #60A5FA, #A78BFA)"

  // CTA gradient.
  const ctaGradient = isEmerald
    ? "linear-gradient(135deg, #059669, #0D9488)"
    : isPurple
    ? "linear-gradient(135deg, #7C3AED, #DB2777)"
    : "linear-gradient(135deg, #2563EB, #4F46E5)"
  const ctaShadow   = isEmerald
    ? "0 8px 24px rgba(5,150,105,0.4)"
    : isPurple
    ? "0 8px 24px rgba(124,58,237,0.4)"
    : "0 8px 24px rgba(37,99,235,0.4)"

  // Strategy stat colour per theme.
  const strategyColor = isEmerald ? "#34D399" : isPurple ? "#F472B6" : "#A78BFA"

  const Canvas =
    variant === "galaxy" ? <GalaxyCanvas />
    : variant === "hyperspace" ? <HyperspaceCanvas />
    : <AuroraCanvas />

  // ── Text / CTA block ──
  const textBlock = (
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
        {links ? (
          <>
            {links.copyTrade && (
              <a
                href={links.copyTrade}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: ctaGradient,
                  color: "#fff", textDecoration: "none",
                  padding: "14px 26px", borderRadius: 10,
                  fontSize: 14, fontWeight: 700,
                  fontFamily: "Noto Sans Lao, sans-serif",
                  boxShadow: ctaShadow,
                }}
              >
                <Icon size={15} strokeWidth={2.5} />
                ເລີ່ມ Copy Trade →
              </a>
            )}
            {links.backtest && (
              <Link
                href={links.backtest}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff", textDecoration: "none",
                  padding: "14px 22px", borderRadius: 10,
                  fontSize: 14, fontWeight: 600,
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  fontFamily: "Noto Sans Lao, sans-serif",
                  backdropFilter: "blur(6px)",
                }}
              >
                <BarChart3 size={15} strokeWidth={2.5} />
                ເບິ່ງ Backtest
              </Link>
            )}
            {links.download && (
              <a
                href={links.download}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff", textDecoration: "none",
                  padding: "14px 22px", borderRadius: 10,
                  fontSize: 14, fontWeight: 600,
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  fontFamily: "Noto Sans Lao, sans-serif",
                  backdropFilter: "blur(6px)",
                }}
              >
                <Download size={15} strokeWidth={2.5} />
                ດາວໂຫຼດ EA
              </a>
            )}
          </>
        ) : (
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
            {comingSoon ? "ແຈ້ງເຕືອນເມື່ອເປີດໂຕ →" : "ເບິ່ງ Live Results →"}
          </a>
        )}
      </div>
    </div>
  )

  // ── Stat card ──
  const statCard = (
    <div style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 20, padding: 28,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    }}>
      {comingSoon ? (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(252,211,77,0.12)",
          border: "0.5px solid rgba(252,211,77,0.35)",
          borderRadius: 100, padding: "4px 12px",
          fontSize: 11, color: "#FCD34D", fontWeight: 600, marginBottom: 20,
        }}>
          🔜 Coming Soon
        </div>
      ) : (
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
      )}

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
          fontSize: comingSoon ? 34 : 48, fontWeight: 700,
          color: comingSoon ? "#FCD34D" : totalColor,
          fontFamily: "JetBrains Mono, monospace", lineHeight: 1.1,
        }}>
          {comingSoon ? "Coming Soon" : totalDisplay}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          {comingSoon ? "ກຳລັງຈະເປີດໂຕ · ຕິດຕາມໄດ້ໄວໆນີ້" : monthsLabel}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "ເດືອນນີ້", value: comingSoon ? "🔜" : monthDisplay, color: comingSoon ? "rgba(255,255,255,0.5)" : monthColor },
          { label: "ມື້ນີ້",   value: comingSoon ? "🔜" : dayDisplay,   color: comingSoon ? "rgba(255,255,255,0.5)" : dayColor },
          { label: "Strategy", value: strategy,     color: strategyColor },
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
  )

  return (
    <section className={styles.section} style={sectionBg ? { background: sectionBg } : undefined}>
      {Canvas}

      <div className={styles.grid}>
        {mirror ? (
          <>
            {statCard}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {statCard}
          </>
        )}
      </div>
    </section>
  )
}
