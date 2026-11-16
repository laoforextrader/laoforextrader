"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DICT, LANGS, LANG_LABEL, loc, pickLang, type Lang } from "@/lib/contest/i18n"
import type { BoardRow, Contest } from "@/lib/contest/store"

// The public face of a round: countdown, prizes, rules, and the board.
//
// Rendered from a server snapshot and then kept fresh by polling the board
// route. Polling only while the round is live keeps a finished round at zero
// requests — there is nothing left to change on it.

const POLL_MS = 30_000

function Countdown({ to, label, t }: { to: string; label: string; t: any }) {
  const [left, setLeft] = useState(() => Date.parse(to) - Date.now())
  useEffect(() => {
    const id = setInterval(() => setLeft(Date.parse(to) - Date.now()), 1000)
    return () => clearInterval(id)
  }, [to])
  if (!Number.isFinite(left) || left <= 0) return null
  const s = Math.floor(left / 1000)
  const parts = [
    [Math.floor(s / 86400), t.days],
    [Math.floor(s / 3600) % 24, t.hours],
    [Math.floor(s / 60) % 60, t.minutes],
    [s % 60, t.seconds],
  ] as const
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11.5px] font-semibold uppercase tracking-wide text-bk-muted">{label}</span>
      <div className="flex gap-2">
        {parts.map(([v, unit]) => (
          <div key={unit} className="flex min-w-[52px] flex-col items-center rounded-bk border border-bk-line bg-bk-sunken px-2 py-1.5">
            <span className="font-mono text-[18px] font-extrabold tabular-nums leading-none">{String(v).padStart(2, "0")}</span>
            <span className="mt-0.5 text-[10px] text-bk-muted">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusChip({ contest, t }: { contest: Contest; t: any }) {
  const map: Record<string, { text: string; cls: string }> = {
    register: { text: t.registerOpen, cls: "bg-accent-soft text-accent-ink border-accent-line" },
    live:     { text: t.live,         cls: "bg-ok-soft text-ok-ink border-ok-line" },
    judging:  { text: t.judging,      cls: "bg-warn-soft text-warn-ink border-warn-line" },
    done:     { text: t.finished,     cls: "bg-bk-sunken text-bk-muted border-bk-line" },
  }
  const s = map[contest.status] ?? map.done
  return <span className={`rounded-bk border px-2.5 py-1 text-[11.5px] font-bold ${s.cls}`}>{s.text}</span>
}

function money(v: number | undefined, currency?: string) {
  if (typeof v !== "number") return "—"
  // Whole units: a starting balance is never 100,000.00 on a poster.
  const n = v.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (currency === "cent") return `${n}¢`
  return currency === "USD" ? `$${n}` : `${n}${currency ? " " + currency : ""}`
}

function Board({ rows, t, slug }: { rows: BoardRow[]; t: any; slug: string }) {
  if (!rows.length) {
    return <p className="rounded-bk border border-dashed border-bk-line bg-bk-sunken p-4 text-[12.5px] text-bk-muted">{t.noEntries}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-bk-line text-left text-[11px] uppercase tracking-wide text-bk-muted">
            <th className="py-2 pr-2 font-semibold">{t.rank}</th>
            <th className="py-2 pr-2 font-semibold">{t.trader}</th>
            <th className="py-2 pr-2 text-right font-semibold">{t.profit}</th>
            <th className="py-2 pr-2 text-right font-semibold">%</th>
            <th className="hidden py-2 pr-2 text-right font-semibold sm:table-cell">{t.drawdown}</th>
            <th className="hidden py-2 pr-2 text-right font-semibold sm:table-cell">{t.trades}</th>
            <th className="py-2 text-right font-semibold">{t.lastSeen}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const pos = (r.profit ?? 0) >= 0
            const stale = r.lastSeen ? Date.now() - Date.parse(r.lastSeen) > 2 * 3600_000 : true
            return (
              <tr key={r._id} className="border-b border-bk-line last:border-0">
                <td className="py-2 pr-2 font-mono font-bold tabular-nums">{i + 1}</td>
                <td className="py-2 pr-2">
                  <Link href={`/contest/${slug}/${r.mtLogin}`} className="font-semibold hover:text-accent">
                    {r.displayName}
                  </Link>
                  <span className="ml-1.5 font-mono text-[11px] text-bk-muted">#{r.mtLogin}</span>
                  {r.status === "blown" && <span className="ml-1.5 text-[11px] font-bold text-bad">· {t.blown}</span>}
                  {r.status === "flagged" && <span className="ml-1.5 text-[11px] font-bold text-warn">· {t.flagged}</span>}
                  {r.status === "pending" && <span className="ml-1.5 text-[11px] text-bk-muted">· {t.waitingEa}</span>}
                </td>
                <td className={`py-2 pr-2 text-right font-mono font-bold tabular-nums ${pos ? "text-ok" : "text-bad"}`}>
                  {typeof r.profit === "number" ? r.profit.toFixed(2) : "—"}
                </td>
                <td className={`py-2 pr-2 text-right font-mono tabular-nums ${pos ? "text-ok" : "text-bad"}`}>
                  {typeof r.profitPct === "number" ? `${r.profitPct.toFixed(1)}%` : "—"}
                </td>
                <td className="hidden py-2 pr-2 text-right font-mono tabular-nums text-bk-muted sm:table-cell">
                  {typeof r.maxDDPct === "number" ? `${r.maxDDPct.toFixed(1)}%` : "—"}
                </td>
                <td className="hidden py-2 pr-2 text-right font-mono tabular-nums text-bk-muted sm:table-cell">
                  {r.trades ?? 0}
                </td>
                <td className={`py-2 text-right text-[11px] ${stale ? "text-bad" : "text-bk-muted"}`}>
                  {r.lastSeen ? new Date(r.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function ContestHome({
  contest, rows, entries, archive, myCode,
}: {
  contest: Contest
  rows: BoardRow[]
  entries: number
  archive: Array<{ slug: string; title: string; status: string }>
  myCode: string | null
}) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "lo"
    try { return pickLang(localStorage.getItem("semi.lang")) } catch { return "lo" }
  })
  const [board, setBoard] = useState(rows)
  const t = DICT[lang]

  useEffect(() => {
    if (contest.status !== "live") return
    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/contest/board?slug=${contest.slug}`, { cache: "no-store" })
        if (!r.ok) return
        const j = await r.json()
        if (Array.isArray(j.rows)) setBoard(j.rows)
      } catch { /* a dropped poll just means the next one carries it */ }
    }, POLL_MS)
    return () => clearInterval(id)
  }, [contest.status, contest.slug])

  const spots = contest.earlyBirdCount ?? 0
  const spotsLeft = Math.max(0, spots - entries)

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-4 px-4 py-6">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[22px] font-extrabold leading-tight tracking-tight">{t.pageTitle}</h1>
          <p className="text-[13px] text-bk-muted">{t.tagline}</p>
        </div>
        <div className="flex shrink-0 gap-0.5 rounded-bk border border-bk-line bg-bk-sunken p-0.5">
          {LANGS.map(l => (
            <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("semi.lang", l) } catch {} }}
              className={`rounded-bk px-2 py-1 text-[11.5px] font-bold ${lang === l ? "bg-accent text-white" : "text-bk-muted"}`}>
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </div>

      {/* round card */}
      <section className="overflow-hidden rounded-bk border border-bk-line bg-bk-surface">
        <div className="h-[3px] bg-gradient-to-r from-ok to-accent" />
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[16px] font-extrabold">{contest.title}</h2>
            <StatusChip contest={contest} t={t} />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              [t.broker, contest.broker ?? "—"],
              ["Account", contest.accountType ?? "—"],
              ["Start", money(contest.startBalance, contest.currency)],
              ["Symbol", contest.symbol ?? "—"],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-bk border border-bk-line bg-bk-sunken px-3 py-2">
                <div className="text-[10.5px] uppercase tracking-wide text-bk-muted">{k}</div>
                <div className="font-mono text-[13px] font-bold">{v}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            {contest.status === "register" && <Countdown to={contest.startAt} label={t.startsIn} t={t} />}
            {contest.status === "live" && <Countdown to={contest.endAt} label={t.endsIn} t={t} />}
            {contest.status === "judging" && contest.announceAt &&
              <Countdown to={contest.announceAt} label={t.resultsIn} t={t} />}

            {contest.status === "register" && (
              <Link href="/contest/register"
                className="rounded-bk bg-accent px-5 py-2.5 text-[13px] font-bold text-white hover:opacity-90">
                {myCode ? t.myEntry : t.register}
              </Link>
            )}
          </div>

          {myCode && (
            <p className="rounded-bk bg-ok-soft px-3 py-2 text-[12px] font-semibold text-ok-ink">
              {t.yourCode}: <span className="font-mono">{myCode}</span>
            </p>
          )}
        </div>
      </section>

      {/* prizes + perks */}
      {(contest.prizes?.length || contest.perks?.length) && (
        <section className="rounded-bk border border-bk-line bg-bk-surface p-4">
          <h3 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide">{t.prizes}</h3>
          <div className="flex flex-wrap gap-2">
            {(contest.prizes ?? []).map((p, i) => (
              <div key={i} className="flex items-baseline gap-2 rounded-bk border border-bk-line bg-bk-sunken px-3 py-2">
                <span className="text-[15px]">{p.place === 1 ? "🥇" : p.place === 2 ? "🥈" : p.place === 3 ? "🥉" : "🎖"}</span>
                <span className="font-mono text-[14px] font-extrabold">
                  {typeof p.amount === "number" ? `$${p.amount}` : loc(p.label, lang)}
                </span>
              </div>
            ))}
          </div>
          {!!contest.perks?.length && (
            <>
              <h3 className="mb-2 mt-3 text-[13px] font-extrabold uppercase tracking-wide">{t.perks}</h3>
              <ul className="flex flex-col gap-1">
                {contest.perks.map((p, i) => (
                  <li key={i} className="text-[12.5px] text-bk-muted">🎁 {loc(p.text, lang)}</li>
                ))}
              </ul>
              {contest.status === "register" && spots > 0 && (
                <p className="mt-2 text-[12px] font-bold text-accent">
                  {t.spotsLeft}: {spotsLeft} / {spots}
                </p>
              )}
            </>
          )}
        </section>
      )}

      {/* how to join */}
      <section className="rounded-bk border border-bk-line bg-bk-surface p-4">
        <h3 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide">{t.howTitle}</h3>
        <ol className="flex flex-col gap-1.5">
          {t.how.map((step: string, i: number) => (
            <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed">
              <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent text-[10.5px] font-bold text-white">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* rules */}
      {!!contest.rules?.length && (
        <section className="rounded-bk border border-bk-line bg-bk-surface p-4">
          <h3 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide">{t.rules}</h3>
          <ul className="flex flex-col gap-1.5">
            {contest.rules.map((r, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-bk-muted">
                <span className="text-accent">•</span><span>{loc(r.text, lang)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* leaderboard */}
      <section className="rounded-bk border border-bk-line bg-bk-surface p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-[13px] font-extrabold uppercase tracking-wide">{t.leaderboard}</h3>
          <span className="text-[11.5px] text-bk-muted">{entries} {t.trader}</span>
        </div>
        <Board rows={board} t={t} slug={contest.slug} />
        <p className="mt-3 border-t border-bk-line pt-2 text-[11px] leading-relaxed text-bk-muted">{t.unverified}</p>
      </section>

      {/* winners */}
      {contest.status === "done" && !!contest.winners?.length && (
        <section className="rounded-bk border border-bk-line bg-bk-surface p-4">
          <h3 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide">{t.winners}</h3>
          <ul className="flex flex-col gap-1.5">
            {contest.winners.map((w, i) => (
              <li key={i} className="flex items-baseline gap-2 text-[13px]">
                <span>{w.place === 1 ? "🥇" : w.place === 2 ? "🥈" : "🥉"}</span>
                <span className="font-bold">{w.entry?.displayName ?? "—"}</span>
                <span className="font-mono text-[12px] text-ok">{w.verifiedProfit?.toFixed(2) ?? "—"}</span>
                <span className="text-[11px] text-bk-muted">{t.verified}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* archive */}
      {archive.length > 1 && (
        <section className="flex flex-wrap items-center gap-2 pb-4">
          <span className="text-[11.5px] font-semibold uppercase tracking-wide text-bk-muted">{t.archive}</span>
          {archive.filter(a => a.slug !== contest.slug).map(a => (
            <Link key={a.slug} href={`/contest/${a.slug}`}
              className="rounded-bk border border-bk-line bg-bk-sunken px-2.5 py-1 text-[11.5px] hover:border-accent">
              {a.title}
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}
