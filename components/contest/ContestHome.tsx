"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DICT, LANGS, LANG_LABEL, loc, pickLang, shortDay, type Lang } from "@/lib/contest/i18n"
import type { BoardRow, Contest } from "@/lib/contest/store"
import { Trophy, Medal, Clock, Users, Chart, Gift, Info, Arrow, CandleBand } from "@/components/contest/icons"

// The public face of a round.
//
// Shape follows what trading contests actually do: the prize money is the
// headline, the top three get a podium of their own, and everything a
// contestant has to DO lives on the registration page instead of here. This
// page is for the person deciding whether to enter, and for everyone
// watching once the round is running.
//
// Gold appears only on prize money and rank one. It is not decoration — the
// instrument is XAUUSD — and keeping it to those two places stops it
// becoming a theme.

const POLL_MS = 30_000

function useCountdown(to?: string) {
  // Starts at null on purpose. A clock rendered on the server is already
  // wrong by the time it reaches the browser, and React treats that one
  // differing digit as a hydration failure: it throws away the whole server
  // tree, re-renders from scratch, and resets <html class="dark"> that
  // ThemeScript had set before paint — which is how this page, and only this
  // page, used to come up light for a reader who had chosen dark.
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    if (!to) return
    const tick = () => setLeft(Date.parse(to) - Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [to])
  if (!to || left === null || !Number.isFinite(left) || left <= 0) return null
  const s = Math.floor(left / 1000)
  return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 }
}

// Fixed locale, both sides. `undefined` means "whatever this machine is set
// to", and the renderer and the reader are never the same machine.
const money = (v?: number, currency?: string) => {
  if (typeof v !== "number") return "—"
  const n = v.toLocaleString("en-US", { maximumFractionDigits: 0 })
  return currency === "USD" ? `$${n}` : currency === "cent" ? `${n}¢` : n
}
const round0 = (v?: number) =>
  typeof v === "number" ? v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—"
const signed0 = (v?: number) =>
  typeof v === "number" ? (v >= 0 ? "+" : "") + round0(v) : "—"
const pad = (n: number) => String(n).padStart(2, "0")

function Podium({ rows }: { rows: BoardRow[] }) {
  if (rows.length < 3) return null
  const cell = (r: BoardRow, place: 1 | 2 | 3) => (
    <div
      className={
        place === 1
          ? "rounded-t-bk border border-b-2 border-gold-line border-b-gold bg-gradient-to-b from-gold-soft to-bk-surface px-2.5 py-5 text-center"
          : "rounded-t-bk border border-b-2 border-bk-line bg-bk-surface px-2.5 py-3.5 text-center"
      }
    >
      <span
        className={`inline-flex ${place === 1 ? "text-[26px] text-gold" : place === 2 ? "text-[22px] text-bk-muted" : "text-[22px] text-[#c08a52]"}`}
      >
        {place === 1 ? <Trophy /> : <Medal />}
      </span>
      <div className="truncate text-[13px] font-semibold">{r.displayName}</div>
      <div className="font-mono text-[10.5px] tabular-nums text-bk-muted">{round0(r.equity)}</div>
      <div
        className={`mt-1.5 font-mono font-bold tabular-nums ${(r.profit ?? 0) >= 0 ? "text-ok" : "text-bad"} ${place === 1 ? "text-[19px]" : "text-[16px]"}`}
      >
        {signed0(r.profit)}
      </div>
    </div>
  )
  return (
    <div className="mb-4 grid grid-cols-3 items-end gap-2">
      {cell(rows[1], 2)}
      {cell(rows[0], 1)}
      {cell(rows[2], 3)}
    </div>
  )
}

function Board({ rows, t, slug }: { rows: BoardRow[]; t: any; slug: string }) {
  if (!rows.length) {
    return (
      <p className="rounded-bk border border-dashed border-bk-line bg-bk-sunken p-4 text-[12.5px] text-bk-muted">
        {t.noEntries}
      </p>
    )
  }
  const rest = rows.length >= 3 ? rows.slice(3) : rows
  const offset = rows.length >= 3 ? 4 : 1
  return (
    <>
      <Podium rows={rows} />
      {rest.length > 0 && (
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase tracking-[0.07em] text-bk-muted">
              <th className="w-7 pb-2.5 pr-2 font-semibold">#</th>
              <th className="pb-2.5 pr-2 font-semibold">{t.trader}</th>
              <th className="pb-2.5 pr-2 text-right font-semibold">{t.balance}</th>
              <th className="pb-2.5 text-right font-semibold">{t.profit}</th>
              <th className="hidden pb-2.5 pl-2 text-right font-semibold sm:table-cell">%</th>
              <th className="hidden pb-2.5 pl-2 text-right font-semibold sm:table-cell">{t.drawdown}</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((r, i) => {
              const tone = (r.profit ?? 0) >= 0 ? "text-ok" : "text-bad"
              return (
                <tr key={r._id} className="border-t border-bk-line">
                  <td className="py-2.5 pr-2 font-mono text-[12px] font-semibold tabular-nums text-bk-muted">{i + offset}</td>
                  <td className="py-2.5 pr-2">
                    <Link href={`/contest/${slug}/${r.mtLogin}`} className="font-semibold hover:text-accent">
                      {r.displayName}
                    </Link>
                    <span className="block font-mono text-[10.5px] text-bk-muted">#{r.mtLogin}</span>
                    {r.status === "blown" && <span className="text-[10.5px] font-bold text-bad">{t.blown}</span>}
                    {r.status === "flagged" && <span className="text-[10.5px] font-bold text-warn">{t.flagged}</span>}
                    {r.status === "pending" && <span className="text-[10.5px] text-bk-muted">{t.waitingEa}</span>}
                  </td>
                  <td className="py-2.5 pr-2 text-right font-mono tabular-nums">{round0(r.equity)}</td>
                  <td className={`py-2.5 text-right font-mono font-semibold tabular-nums ${tone}`}>{signed0(r.profit)}</td>
                  <td className={`hidden py-2.5 pl-2 text-right font-mono tabular-nums sm:table-cell ${tone}`}>
                    {typeof r.profitPct === "number" ? r.profitPct.toFixed(1) : "—"}
                  </td>
                  <td className="hidden py-2.5 pl-2 text-right font-mono tabular-nums text-bk-muted sm:table-cell">
                    <span className="inline-flex items-center justify-end gap-1.5">
                      <span className="block h-[3px] w-10 overflow-hidden rounded-sm bg-bk-line">
                        <span className="block h-full bg-bk-muted" style={{ width: `${Math.min(100, Math.max(0, (r.maxDDPct ?? 0) * 2))}%` }} />
                      </span>
                      {typeof r.maxDDPct === "number" ? `${r.maxDDPct.toFixed(1)}%` : "—"}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </>
  )
}

export default function ContestHome({
  contest, rows, entries, archive, myCode, children,
}: {
  contest: Contest
  rows: BoardRow[]
  entries: number
  archive: Array<{ slug: string; title: string; status: string }>
  myCode: string | null
  /** The site's own CTA cards, rendered on the server and passed through. */
  children?: React.ReactNode
}) {
  // Same reason as the countdown: localStorage does not exist on the server,
  // so reading it during the first render makes every string on the page
  // differ for anyone who had picked EN or ไทย. Pick it up right after mount.
  const [lang, setLang] = useState<Lang>("lo")
  useEffect(() => {
    try { setLang(pickLang(localStorage.getItem("semi.lang"))) } catch {}
  }, [])
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

  const seats = contest.maxEntries ?? 0
  const seatsLeft = seats > 0 ? Math.max(0, seats - entries) : null
  const full = seatsLeft === 0
  const canRegister = contest.status === "register" && !full
  const perks = contest.earlyBirdCount ?? 0
  const perksLeft = Math.max(0, perks - entries)

  const cd = useCountdown(
    contest.status === "register" ? contest.startAt :
    contest.status === "live" ? contest.endAt :
    contest.announceAt
  )
  const prizes = [...(contest.prizes ?? [])].sort((a, b) => (a.place ?? 9) - (b.place ?? 9))
  const pool = prizes.reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const day = (iso?: string) => shortDay(iso, lang)

  const schedule = [
    { when: day(contest.registerOpenAt), title: t.phRegister, note: t.phRegisterNote, on: contest.status === "register" },
    { when: day(contest.startAt), title: t.phStart, note: t.phStartNote, on: contest.status === "live" },
    { when: day(contest.endAt), title: t.phEnd, note: t.phEndNote, on: contest.status === "judging" },
    { when: day(contest.announceAt), title: t.phAnnounce, note: t.phAnnounceNote, on: contest.status === "done" },
  ]

  return (
    <div className="mx-auto max-w-[1100px]">
      <section className="relative overflow-hidden border-b border-bk-line">
        <CandleBand className="pointer-events-none absolute inset-x-0 bottom-0 h-[150px] text-bk-line opacity-30" />
        <div className="relative grid gap-6 px-4 py-7 sm:px-8 md:grid-cols-[1.08fr_0.92fr] md:items-center md:gap-10 md:py-11">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ok">
                <span className="h-[7px] w-[7px] rounded-full bg-ok shadow-[0_0_0_3px_rgba(46,203,148,0.16)]" />
                {contest.title}
              </span>
              <div className="flex shrink-0 gap-0.5 rounded-bk border border-bk-line bg-bk-sunken p-0.5">
                {LANGS.map(l => (
                  <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("semi.lang", l) } catch {} }}
                    className={`rounded-bk px-2 py-1 text-[11px] font-bold ${lang === l ? "bg-accent text-white" : "text-bk-muted"}`}>
                    {LANG_LABEL[l]}
                  </button>
                ))}
              </div>
            </div>

            <h1 className="mt-3 text-[27px] font-bold leading-[1.3] tracking-[-0.01em] md:text-[40px] md:leading-[1.22]">
              {t.heroA} <span className="text-gold">{t.heroGold}</span>
              <br />
              {t.heroB}
            </h1>
            <p className="mt-2.5 max-w-[46ch] text-[14px] leading-[1.7] text-bk-muted">
              {t.heroLede.replace("{bal}", money(contest.startBalance, contest.currency))}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5">
              <span className="flex items-center gap-2 py-1.5 text-[12.5px] text-bk-muted">
                <Chart /> {contest.broker} {contest.accountType} ·{" "}
                <b className="font-mono font-medium text-bk-ink">{contest.symbol}</b>
              </span>
              <span className="flex items-center gap-2 py-1.5 text-[12.5px] text-bk-muted">
                <Clock /> {t.startsOn} <b className="font-mono font-medium text-bk-ink">{day(contest.startAt)}</b>
              </span>
              <span className="flex items-center gap-2 py-1.5 text-[12.5px] text-bk-muted">
                <Users /> {t.takes} <b className="font-mono font-medium text-bk-ink">{seats || "—"}</b>
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {canRegister ? (
                <>
                  <Link href="/contest/register"
                    className="inline-flex items-center gap-2 rounded-bk bg-accent px-5 py-3.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_rgba(77,124,254,0.28)]">
                    {myCode ? t.myEntry : t.register} <Arrow />
                  </Link>
                  {seatsLeft !== null && (
                    <span className="text-[12.5px] text-bk-muted">
                      {t.seatsLeft} {seatsLeft} / {seats}
                      <span className="mt-1.5 block h-1 w-[116px] overflow-hidden rounded-sm bg-bk-line">
                        <span className="block h-full bg-accent" style={{ width: `${(seatsLeft / seats) * 100}%` }} />
                      </span>
                    </span>
                  )}
                </>
              ) : (
                <div className="text-[12.5px]">
                  <span className="font-bold text-bk-muted">
                    {full && contest.status === "register" ? t.seatsFull : t.registerClosed}
                  </span>
                  <span className="mt-0.5 block text-bk-muted">
                    {contest.status === "done" ? t.nextRound : t.watchOnly}
                  </span>
                </div>
              )}
            </div>

            {myCode && (
              <p className="mt-3 inline-block rounded-bk bg-ok-soft px-3 py-2 text-[12px] font-semibold text-ok-ink">
                {t.yourCode}: <span className="font-mono">{myCode}</span>
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-[16px] border border-bk-line bg-gradient-to-b from-[#11131a] to-bk-surface">
            <div className="flex items-center justify-between border-b border-bk-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-bk-muted">
              <span>{t.prizePool}</span>
              <span>{contest.broker}</span>
            </div>
            <div className="px-4 pb-1.5 pt-[18px] text-center">
              <b className="block font-mono text-[46px] font-bold leading-none tracking-[-0.02em] text-gold md:text-[56px]">
                ${pool}
              </b>
              <span className="mt-2 block text-[12.5px] text-bk-muted">{t.poolNote}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-px border-t border-bk-line bg-bk-line">
              {prizes.slice(0, 3).map((p, i) => (
                <div key={i} className="bg-bk-surface px-1.5 py-3 text-center">
                  <span className={`flex items-center justify-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] ${i === 0 ? "text-gold" : "text-bk-muted"}`}>
                    <Medal /> {p.place === 1 ? "1st" : p.place === 2 ? "2nd" : "3rd"}
                  </span>
                  <b className={`mt-1.5 block font-mono text-[20px] font-bold ${i === 0 ? "text-gold-ink" : ""}`}>
                    {typeof p.amount === "number" ? `$${p.amount}` : loc(p.label, lang)}
                  </b>
                </div>
              ))}
            </div>
            {cd && (
              <div className="grid grid-cols-4 border-t border-bk-line">
                {([[cd.d, t.days], [cd.h, t.hours], [cd.m, t.minutes], [cd.s, t.seconds]] as const).map(([v, unit], i) => (
                  <div key={unit} className={`px-1 py-3 text-center ${i ? "border-l border-bk-line" : ""}`}>
                    <b className="block font-mono text-[21px] font-medium tabular-nums">{pad(v as number)}</b>
                    <span className="text-[10px] tracking-[0.04em] text-bk-muted">{unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-8">
        {!!contest.perks?.length && (
          <section className="py-6">
            <div className="flex items-center gap-3 rounded-bk border border-gold-line bg-gold-soft px-4 py-3.5 text-[13px] text-gold-ink">
              <span className="text-[19px] text-gold"><Gift /></span>
              <span>
                {loc(contest.perks[0].text, lang)}
                {contest.status === "register" && perks > 0 && (
                  <> · <b className="text-white">{t.spotsLeft} {perksLeft}</b></>
                )}
              </span>
            </div>
          </section>
        )}

        <section className="border-t border-bk-line py-6">
          <div className="mb-3.5 flex items-baseline justify-between gap-3">
            <h2 className="text-[16px] font-bold tracking-[-0.01em]">{t.requirements}</h2>
            <span className="text-[11.5px] text-bk-muted">{t.sameForAll}</span>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-bk border border-bk-line bg-bk-line md:grid-cols-4">
            {([
              [t.broker, contest.broker ?? "—", false],
              ["Account", `${contest.accountType ?? "—"} · ${t.demo}`, false],
              [t.startingBalance, money(contest.startBalance, contest.currency), true],
              ["Symbol", contest.symbol ?? "—", true],
            ] as Array<[string, string, boolean]>).map(([k, v, mono]) => (
              <div key={k} className="bg-bk-surface px-3.5 py-3">
                <dt className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-bk-muted">{k}</dt>
                <dd className={`m-0 text-[14px] font-semibold ${mono ? "font-mono" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-t border-bk-line py-6">
          <div className="mb-3.5 flex items-baseline justify-between gap-3">
            <h2 className="text-[16px] font-bold tracking-[-0.01em]">{t.schedule}</h2>
            <span className="text-[11.5px] text-bk-muted">{t.serverTime}</span>
          </div>
          <div className="grid md:grid-cols-4">
            {schedule.map((s, i) => (
              <div
                key={s.title}
                className={`relative border-l py-3.5 pl-6 md:border-l-0 md:border-t md:py-0 md:pl-0 md:pr-4 md:pt-6 ${
                  i === 0 ? "border-l-transparent" : s.on ? "border-l-ok" : "border-l-bk-line"
                } ${s.on ? "md:border-t-ok" : "md:border-t-bk-line"}`}
              >
                <span
                  className={`absolute left-[-5px] top-[17px] h-[9px] w-[9px] rounded-full md:left-0 md:top-[-5px] ${
                    s.on ? "bg-ok shadow-[0_0_0_4px_rgba(46,203,148,0.15)]" : "bg-bk-line"
                  }`}
                />
                <span className={`font-mono text-[11.5px] font-medium ${s.on ? "text-ok" : "text-bk-muted"}`}>{s.when}</span>
                <strong className="mb-0.5 mt-1 block text-[13.5px] font-semibold">{s.title}</strong>
                <small className="block text-[12px] leading-[1.5] text-bk-muted">{s.note}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-bk-line py-6">
          <div className="mb-3.5 flex items-baseline justify-between gap-3">
            <h2 className="text-[16px] font-bold tracking-[-0.01em]">{t.leaderboard}</h2>
            <span className="text-[11.5px] text-bk-muted">{entries} {t.trader}</span>
          </div>
          <Board rows={board} t={t} slug={contest.slug} />
          <p className="mt-3 flex items-center gap-2 text-[11.5px] text-bk-muted">
            <Info /> {t.unverified}
          </p>
        </section>

        {contest.status === "done" && !!contest.winners?.length && (
          <section className="border-t border-bk-line py-6">
            <h2 className="mb-3 text-[16px] font-bold">{t.winners}</h2>
            <ul className="flex flex-col gap-2">
              {contest.winners.map((w, i) => (
                <li key={i} className="flex items-baseline gap-2.5 text-[13px]">
                  <span className={w.place === 1 ? "text-gold" : "text-bk-muted"}><Medal /></span>
                  <span className="font-bold">{w.entry?.displayName ?? "—"}</span>
                  <span className="font-mono text-[12px] text-ok">{round0(w.verifiedProfit)}</span>
                  <span className="text-[11px] text-bk-muted">{t.verified}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {children}

        {archive.length > 1 && (
          <section className="flex flex-wrap items-center gap-2 border-t border-bk-line py-5">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-bk-muted">{t.archive}</span>
            {archive.filter(a => a.slug !== contest.slug).map(a => (
              <Link key={a.slug} href={`/contest/${a.slug}`}
                className="rounded-bk border border-bk-line bg-bk-sunken px-2.5 py-1 text-[11.5px] hover:border-accent">
                {a.title}
              </Link>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
