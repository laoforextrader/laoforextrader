// Owner-only operations dashboard — everything in one page.
//
// Deliberately NOT a replacement for GA4: GA answers "where did the traffic
// come from", this answers "what is my site actually doing right now" using
// data only we hold (Sanity), plus the things that fail silently in this repo
// (EA feed stopping, cron-job.org stopping, an unanswered support chat).

import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import type { Metadata } from "next"
import {
  Eye, Users, MousePointerClick, MessageSquare, AlertTriangle,
  Bot, Radio, Activity, ExternalLink,
} from "lucide-react"

import { authOptions } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin/auth"
import { categoryRoute } from "@/lib/utils"
import { getAdminStats, scheduleHealth, eaHealth } from "@/lib/admin/stats"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

// ── formatting ────────────────────────────────────────────────────────────
const nf = new Intl.NumberFormat("en-US")
const n = (v?: number) => nf.format(Math.round(v ?? 0))

function ago(iso?: string): string {
  if (!iso) return "—"
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms)) return "—"
  const m = Math.floor(ms / 60_000)
  if (m < 1) return "ຫາກໍ່"
  if (m < 60) return `${m} ນາທີກ່ອນ`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ຊົ່ວໂມງກ່ອນ`
  return `${Math.floor(h / 24)} ວັນກ່ອນ`
}

function pct(v?: number): string {
  if (v == null) return "—"
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`
}

const PERIOD_LO: Record<string, string> = { daily: "ລາຍວັນ", weekly: "ລາຍອາທິດ", monthly: "ລາຍເດືອນ" }

// ── shared styles ─────────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: "#fff", border: "1px solid #E2E6F0", borderRadius: 14, padding: 18,
}
const H2: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 14px",
  display: "flex", alignItems: "center", gap: 8,
  fontFamily: "'Noto Sans Lao', sans-serif",
}
const TH: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase",
  letterSpacing: "0.06em", textAlign: "left", padding: "0 8px 8px 0", whiteSpace: "nowrap",
}
const TD: React.CSSProperties = {
  fontSize: 12, color: "#374151", padding: "9px 8px 9px 0",
  borderTop: "1px solid #F3F4F6", fontFamily: "'Noto Sans Lao', sans-serif",
}
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }

const HEALTH: Record<string, { bg: string; fg: string; text: string }> = {
  ok:    { bg: "#ECFDF5", fg: "#047857", text: "ປົກກະຕິ" },
  stale: { bg: "#FEF2F2", fg: "#B91C1C", text: "ຂໍ້ມູນຄ້າງ" },
  never: { bg: "#FFFBEB", fg: "#B45309", text: "ຍັງບໍ່ເຄີຍ" },
  off:   { bg: "#F3F4F6", fg: "#6B7280", text: "ປິດຢູ່" },
}

function Badge({ health }: { health: string }) {
  const h = HEALTH[health] ?? HEALTH.off
  return (
    <span style={{
      display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 8px",
      borderRadius: 5, background: h.bg, color: h.fg,
      fontFamily: "'Noto Sans Lao', sans-serif", whiteSpace: "nowrap",
    }}>{h.text}</span>
  )
}

function Tile({ icon: Icon, label, value, hint, tone = "#2563EB" }: {
  icon: any; label: string; value: string; hint?: string; tone?: string
}) {
  return (
    <div style={{ ...CARD, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <Icon size={14} color={tone} strokeWidth={2.4} />
        <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "'Noto Sans Lao', sans-serif" }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#111827", lineHeight: 1.1, ...MONO }}>{value}</div>
      {hint && (
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4, fontFamily: "'Noto Sans Lao', sans-serif" }}>{hint}</div>
      )}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────
export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  if (!isAdminEmail(session.user?.email)) redirect("/")

  let stats: Awaited<ReturnType<typeof getAdminStats>> | null = null
  let error: string | null = null
  try {
    stats = await getAdminStats()
  } catch (e: any) {
    error = e?.message ?? "unknown error"
  }

  if (!stats) {
    return (
      <div style={{ background: "#EDEEF2", minHeight: "80vh", padding: "40px 24px" }}>
        <div style={{ ...CARD, maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>ໂຫຼດຂໍ້ມູນບໍ່ໄດ້</h1>
          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 10, fontFamily: "'Noto Sans Lao', sans-serif" }}>
            ສ່ວນຫຼາຍແມ່ນ <code style={MONO}>SANITY_API_TOKEN</code> ບໍ່ໄດ້ຕັ້ງຄ່າໃນ environment ນີ້.
          </p>
          <pre style={{ ...MONO, fontSize: 11, color: "#B91C1C", background: "#FEF2F2", padding: 10, borderRadius: 8, overflowX: "auto" }}>{error}</pre>
        </div>
      </div>
    )
  }

  const { totals, chat, clickTotals } = stats
  const staleEas       = stats.eas.filter((e) => eaHealth(e) === "stale")
  const staleSchedules = stats.schedules.filter((s) => scheduleHealth(s) === "stale")
  const alerts = staleEas.length + staleSchedules.length + stats.awaitingCount

  return (
    <div style={{ background: "#EDEEF2", minHeight: "80vh" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 56px" }}>

        {/* ── header ── */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0, fontFamily: "'Noto Sans Lao', sans-serif" }}>
              ພາບລວມເວັບໄຊ
            </h1>
            <p style={{ fontSize: 11, color: "#6B7280", margin: "3px 0 0", fontFamily: "'Noto Sans Lao', sans-serif" }}>
              ຂໍ້ມູນສົດຈາກ Sanity · ວັນທີ <span style={MONO}>{stats.day}</span> (ເວລາລາວ)
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", textDecoration: "none", background: "#fff", border: "1px solid #E2E6F0", borderRadius: 8, padding: "7px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}>
              Google Analytics <ExternalLink size={11} />
            </a>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", textDecoration: "none", background: "#fff", border: "1px solid #E2E6F0", borderRadius: 8, padding: "7px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}>
              Search Console <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* ── alerts ── */}
        {alerts > 0 && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <AlertTriangle size={14} color="#B91C1C" strokeWidth={2.5} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#B91C1C", fontFamily: "'Noto Sans Lao', sans-serif" }}>
                ຕ້ອງກວດເບິ່ງ ({alerts})
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "#7F1D1D", fontFamily: "'Noto Sans Lao', sans-serif", lineHeight: 1.8 }}>
              {stats.awaitingCount > 0 && <li>ມີ {stats.awaitingCount} ແຊັດທີ່ລູກຄ້າຖາມແລ້ວຍັງບໍ່ໄດ້ຕອບ</li>}
              {staleEas.map((e) => (
                <li key={e.eaId}>EA <b>{e.title || e.eaId}</b> ບໍ່ໄດ້ສົ່ງຂໍ້ມູນມາ {ago(e.lastUpdate)} — ກວດເບິ່ງວ່າ MT5 ຍັງເປີດຢູ່ບໍ່</li>
              ))}
              {staleSchedules.map((s) => (
                <li key={s.key}>Broadcast <b>{s.title || s.key}</b> ບໍ່ໄດ້ຍິງມາ {ago(s.lastRunAt)} — ກວດເບິ່ງ cron-job.org</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── tiles ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 12, marginBottom: 22 }}>
          <Tile icon={Eye} label="ຍອດເບິ່ງບົດຄວາມລວມ" value={n(totals.views)} hint={`${n(totals.articles)} ບົດຄວາມ`} />
          <Tile icon={Users} label="ສະມາຊິກ" value={n(totals.subscribers)} hint={`+${n(totals.subscribers7d)} ໃນ 7 ວັນ`} tone="#7C3AED" />
          <Tile icon={MousePointerClick} label="ຄລິກສະໝັກ (7 ວັນ)" value={n(clickTotals.d7)} hint={`ມື້ນີ້ ${n(clickTotals.today)} ຄັ້ງ`} tone="#059669" />
          <Tile icon={Bot} label="AI chat ມື້ນີ້" value={n(chat.today)} hint={`${n(chat.users)} ຄົນ · 7 ວັນ ${n(chat.d7)}`} tone="#EA580C" />
          <Tile icon={MessageSquare} label="ລໍຖ້າຕອບ" value={n(stats.awaitingCount)} hint="ແຊັດຫາ admin" tone={stats.awaitingCount ? "#DC2626" : "#6B7280"} />
        </div>

        {/* ── 1. บทความฮิต ── */}
        <section style={{ ...CARD, marginBottom: 16 }}>
          <h2 style={H2}><Eye size={14} color="#2563EB" /> ບົດຄວາມທີ່ຄົນອ່ານຫຼາຍທີ່ສຸດ</h2>
          {stats.topArticles.length === 0 ? (
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>ຍັງບໍ່ມີຂໍ້ມູນ</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr>
                    <th style={{ ...TH, width: 24 }}>#</th>
                    <th style={TH}>ຫົວຂໍ້</th>
                    <th style={{ ...TH, textAlign: "right" }}>ເບິ່ງ</th>
                    <th style={{ ...TH, textAlign: "right" }}>♥</th>
                    <th style={{ ...TH, textAlign: "right" }}>💬</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topArticles.map((a, i) => (
                    <tr key={a._id}>
                      <td style={{ ...TD, color: "#9CA3AF", ...MONO }}>{i + 1}</td>
                      <td style={TD}>
                        <Link href={`/${categoryRoute(a.category ?? "education")}/${a.slug}`} style={{ color: "#111827", textDecoration: "none", fontWeight: 500 }}>
                          {a.title}
                        </Link>
                        {a.category && (
                          <span style={{ marginLeft: 7, fontSize: 10, color: "#9CA3AF", background: "#F3F4F6", padding: "1px 6px", borderRadius: 4 }}>
                            {a.category}
                          </span>
                        )}
                      </td>
                      <td style={{ ...TD, textAlign: "right", fontWeight: 700, ...MONO }}>{n(a.views)}</td>
                      <td style={{ ...TD, textAlign: "right", ...MONO, color: a.likes ? "#DC2626" : "#D1D5DB" }}>{a.likes}</td>
                      <td style={{ ...TD, textAlign: "right", ...MONO, color: a.comments ? "#2563EB" : "#D1D5DB" }}>{a.comments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 10, fontFamily: "'Noto Sans Lao', sans-serif" }}>
            ລວມທັງໝົດ: {n(totals.views)} ເບິ່ງ · {n(totals.likes)} ໄລ້ · {n(totals.comments)} ຄຳເຫັນ
          </p>
        </section>

        {/* ── 2. EA + broadcast ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16 }}>
          <section style={CARD}>
            <h2 style={H2}><Activity size={14} color="#059669" /> ຜົນງານ EA (ສົດຈາກ MT5)</h2>
            {stats.eas.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9CA3AF" }}>ຍັງບໍ່ມີ eaStats doc</p>
            ) : stats.eas.map((ea) => {
              const last = ea.monthlyReturns?.length ? ea.monthlyReturns[ea.monthlyReturns.length - 1] : null
              return (
                <div key={ea.eaId} style={{ borderTop: "1px solid #F3F4F6", padding: "11px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
                    <Link href={`/ea/${ea.eaId}`} style={{ fontSize: 13, fontWeight: 700, color: "#111827", textDecoration: "none", fontFamily: "'Noto Sans Lao', sans-serif" }}>
                      {ea.title || ea.eaId}
                    </Link>
                    <Badge health={eaHealth(ea)} />
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11, color: "#6B7280" }}>
                    <span>ກຳໄລລວມ <b style={{ ...MONO, color: (ea.profitTotalPct ?? 0) >= 0 ? "#047857" : "#B91C1C" }}>{pct(ea.profitTotalPct)}</b></span>
                    <span>ເດືອນລ່າສຸດ <b style={{ ...MONO, color: (last?.profitPct ?? 0) >= 0 ? "#047857" : "#B91C1C" }}>{pct(last?.profitPct)}</b></span>
                    <span>Balance <b style={MONO}>${n(ea.balance)}</b></span>
                  </div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4, fontFamily: "'Noto Sans Lao', sans-serif" }}>
                    ອັບເດດ {ago(ea.lastUpdate)} · ໂໝດ {ea.updateMode ?? "?"}
                  </div>
                </div>
              )
            })}
          </section>

          <section style={CARD}>
            <h2 style={H2}><Radio size={14} color="#7C3AED" /> LINE Broadcast</h2>
            {stats.schedules.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9CA3AF" }}>ຍັງບໍ່ມີ broadcastSchedule doc</p>
            ) : stats.schedules.map((s) => (
              <div key={s.key} style={{ borderTop: "1px solid #F3F4F6", padding: "11px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'Noto Sans Lao', sans-serif" }}>
                    {s.title || s.key}
                  </span>
                  <Badge health={scheduleHealth(s)} />
                </div>
                <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'Noto Sans Lao', sans-serif" }}>
                  {PERIOD_LO[s.period ?? ""] ?? s.period} · {String(s.hour ?? "?").padStart(2, "0")}:00 ICT
                </div>
                <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4, fontFamily: "'Noto Sans Lao', sans-serif" }}>
                  ຍິງລ່າສຸດ {ago(s.lastRunAt)}{s.lastStatus ? ` · ${s.lastStatus}` : ""}
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* ── 3. affiliate clicks + subscribers ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16 }}>
          <section style={CARD}>
            <h2 style={H2}><MousePointerClick size={14} color="#059669" /> ຄລິກປຸ່ມສະໝັກ / ດາວໂຫຼດ</h2>
            {stats.clicks.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.7, fontFamily: "'Noto Sans Lao', sans-serif" }}>
                ຍັງບໍ່ມີຂໍ້ມູນ — ການນັບຄລິກຫາກໍ່ເປີດໃຊ້ ຕົວເລກຈະຂຶ້ນເມື່ອມີຄົນກົດປຸ່ມ
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={TH}>ປຸ່ມ</th>
                      <th style={{ ...TH, textAlign: "right" }}>ມື້ນີ້</th>
                      <th style={{ ...TH, textAlign: "right" }}>7 ວັນ</th>
                      <th style={{ ...TH, textAlign: "right" }}>30 ວັນ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.clicks.map((c) => (
                      <tr key={c.target}>
                        <td style={TD}>
                          {c.label}
                          <div style={{ ...MONO, fontSize: 10, color: "#C4C8D4" }}>{c.target}</div>
                        </td>
                        <td style={{ ...TD, textAlign: "right", ...MONO }}>{n(c.today)}</td>
                        <td style={{ ...TD, textAlign: "right", ...MONO, fontWeight: 700 }}>{n(c.d7)}</td>
                        <td style={{ ...TD, textAlign: "right", ...MONO, color: "#9CA3AF" }}>{n(c.d30)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section style={CARD}>
            <h2 style={H2}><Users size={14} color="#7C3AED" /> ສະມາຊິກລ່າສຸດ</h2>
            {stats.recentSubscribers.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9CA3AF" }}>ຍັງບໍ່ມີສະມາຊິກ</p>
            ) : stats.recentSubscribers.map((s) => (
              <div key={s.email} style={{ borderTop: "1px solid #F3F4F6", padding: "8px 0", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#111827", fontFamily: "'Noto Sans Lao', sans-serif" }}>{s.name || "—"}</div>
                  <div style={{ ...MONO, fontSize: 10, color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis" }}>{s.email}</div>
                </div>
                <div style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap", fontFamily: "'Noto Sans Lao', sans-serif" }}>
                  {ago(s.createdAt)}
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* ── 4. AI chat + support threads ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <section style={CARD}>
            <h2 style={H2}><Bot size={14} color="#EA580C" /> TheRocket AI (ມື້ນີ້)</h2>
            <div style={{ display: "flex", gap: 22, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", ...MONO }}>{n(chat.today)}</div>
                <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'Noto Sans Lao', sans-serif" }}>ຂໍ້ຄວາມ</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", ...MONO }}>{n(chat.users)}</div>
                <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'Noto Sans Lao', sans-serif" }}>ຄົນໃຊ້</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", ...MONO }}>{n(chat.d7)}</div>
                <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "'Noto Sans Lao', sans-serif" }}>7 ວັນ</div>
              </div>
            </div>
            {Object.keys(chat.byTier).length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(chat.byTier).map(([tier, c]) => (
                  <span key={tier} style={{ fontSize: 11, background: "#F3F4F6", color: "#374151", padding: "3px 9px", borderRadius: 6, ...MONO }}>
                    {tier}: {n(c)}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section style={CARD}>
            <h2 style={H2}>
              <MessageSquare size={14} color="#DC2626" /> ແຊັດຫາ admin
              {stats.awaitingCount > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, background: "#FEF2F2", color: "#B91C1C", padding: "2px 7px", borderRadius: 5 }}>
                  {stats.awaitingCount} ລໍຖ້າຕອບ
                </span>
              )}
            </h2>
            {stats.threads.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9CA3AF" }}>ຍັງບໍ່ມີແຊັດ</p>
            ) : stats.threads.map((t) => (
              <div key={t.threadId} style={{
                borderTop: "1px solid #F3F4F6", padding: "9px 0",
                borderLeft: t.awaitingReply ? "3px solid #DC2626" : "3px solid transparent",
                paddingLeft: 9,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", fontFamily: "'Noto Sans Lao', sans-serif" }}>
                    {t.name || "(ບໍ່ບອກຊື່)"}
                  </span>
                  <span style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap", fontFamily: "'Noto Sans Lao', sans-serif" }}>
                    {ago(t.lastUserAt)}
                  </span>
                </div>
                {t.lastMsg && (
                  <div style={{
                    fontSize: 11, color: "#6B7280", marginTop: 2, fontFamily: "'Noto Sans Lao', sans-serif",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {t.lastMsg}
                  </div>
                )}
                <div style={{ fontSize: 10, color: "#C4C8D4", marginTop: 3, ...MONO }}>
                  {t.msgCount} ຂໍ້ຄວາມ{t.path ? ` · ${t.path}` : ""}
                </div>
              </div>
            ))}
            <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 10, fontFamily: "'Noto Sans Lao', sans-serif" }}>
              ຕອບໄດ້ທາງ Telegram — reply ໃສ່ຂໍ້ຄວາມແຈ້ງເຕືອນຂອງ thread ນັ້ນ
            </p>
          </section>
        </div>

        <p style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", marginTop: 26, fontFamily: "'Noto Sans Lao', sans-serif" }}>
          ໜ້ານີ້ເຫັນສະເພາະ admin · ຂໍ້ມູນຜູ້ເຂົ້າຊົມ (ມາຈາກໃສ, ຄຳຄົ້ນຫາ) ຢູ່ໃນ Google Analytics ແລະ Search Console
        </p>
      </div>
    </div>
  )
}
