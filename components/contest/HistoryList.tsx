"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DICT, LANGS, LANG_LABEL, loc, pickLang, shortDay, type Lang } from "@/lib/contest/i18n"
import { Trophy, Medal, Chart, Users } from "@/components/contest/icons"
import { ContestAvatar, resolveAvatar } from "@/components/contest/avatars"
import Flag from "@/components/contest/Flag"
import type { LocaleText, ContestSponsor } from "@/lib/contest/store"

// Every round the site has ever run, newest first.
//
// It exists because a contest that leaves nothing behind is a contest nobody
// believes the second time. The card carries what a stranger asks six months
// later: when it ran, how much was at stake, who won, and who paid for it.
//
// The numbers come from the entries themselves, which stop moving when the
// EA stops reporting at the end of the round — so this page is a record, not
// a snapshot that has to be written at closing time and can be forgotten.

export interface HistoryRound {
  slug: string
  title: string
  status: string
  broker?: string
  symbol?: string
  startAt?: string
  endAt?: string
  startBalance?: number
  currency?: string
  pool: number
  entries: number
  recap?: LocaleText
  sponsors?: ContestSponsor[]
  sponsorNames: string[]
  podium: Array<{
    place: number
    displayName: string
    mtLogin?: string
    country?: string
    avatar?: string
    profit?: number
    verified: boolean
  }>
}

const money = (v?: number, currency?: string) => {
  if (typeof v !== "number") return "—"
  const n = v.toLocaleString("en-US", { maximumFractionDigits: 0 })
  return currency === "USD" ? `$${n}` : currency === "cent" ? `${n}¢` : n
}
const signed0 = (v?: number) =>
  typeof v === "number"
    ? (v >= 0 ? "+" : "") + v.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : "—"

export default function HistoryList({ rounds }: { rounds: HistoryRound[] }) {
  // Read after mount, like every other page here: localStorage does not exist
  // on the server and a stored choice would cost the page its hydration.
  const [lang, setLang] = useState<Lang>("lo")
  useEffect(() => {
    try { setLang(pickLang(localStorage.getItem("semi.lang"))) } catch {}
  }, [])
  const t = DICT[lang]

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.01em] md:text-[30px]">{t.historyTitle}</h1>
          <p className="mt-1.5 max-w-[56ch] text-[13.5px] leading-[1.7] text-bk-muted">{t.historyLede}</p>
        </div>
        <div className="flex shrink-0 gap-0.5 rounded-bk border border-bk-line bg-bk-sunken p-0.5">
          {LANGS.map(l => (
            <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("semi.lang", l) } catch {} }}
              className={`rounded-bk px-2 py-1 text-[11px] font-bold ${lang === l ? "bg-accent text-white" : "text-bk-muted"}`}>
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {rounds.length === 0 && (
          <p className="rounded-bk border border-dashed border-bk-line bg-bk-sunken p-4 text-[13px] text-bk-muted">
            {t.historyEmpty}
          </p>
        )}

        {rounds.map(r => {
          const live = r.status === "live" || r.status === "register" || r.status === "judging"
          const taken = new Set<string>()
          return (
            <article key={r.slug} className="overflow-hidden rounded-bk border border-bk-line bg-bk-surface">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-bk-line px-4 py-3">
                <div className="flex items-baseline gap-2.5">
                  <Link href={`/contest/${r.slug}`} className="text-[15px] font-bold hover:text-accent">
                    {r.title}
                  </Link>
                  <span className={`text-[10.5px] font-bold uppercase tracking-[0.07em] ${
                    r.status === "live" ? "text-ok" : r.status === "done" ? "text-bk-muted" : "text-accent"
                  }`}>
                    {r.status === "done" ? t.finished : r.status === "live" ? t.live : r.status === "judging" ? t.judging : t.registerOpen}
                  </span>
                </div>
                <span className="font-mono text-[11.5px] text-bk-muted">
                  {shortDay(r.startAt, lang)} – {shortDay(r.endAt, lang)}
                </span>
              </div>

              <div className="grid gap-4 px-4 py-3.5 md:grid-cols-[1fr_320px]">
                <div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-bk-muted">
                    <span className="flex items-center gap-1.5">
                      <Chart /> {r.broker ?? "—"} · <b className="font-mono font-medium text-bk-ink">{r.symbol ?? "—"}</b>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users /> {r.entries} {t.trader}
                    </span>
                    <span>
                      {t.startingBalance}: <b className="font-mono font-medium text-bk-ink">
                        {money(r.startBalance, r.currency)}
                      </b>
                    </span>
                    <span className="flex items-center gap-1.5 text-gold-ink">
                      <Trophy /> <b className="font-mono">${r.pool}</b>
                    </span>
                  </div>

                  {loc(r.recap, lang) && (
                    <p className="mt-2 max-w-[60ch] text-[13px] leading-[1.7] text-bk-muted">{loc(r.recap, lang)}</p>
                  )}

                  {r.sponsorNames.length > 0 && (
                    <p className="mt-2 text-[11.5px] text-bk-muted">
                      {t.sponsoredBy}: <span className="text-bk-ink">{r.sponsorNames.join(" · ")}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-bk-muted">
                    {live ? t.leaderboard : t.winners}
                    {r.podium.length > 0 && !r.podium[0].verified && live && ` · ${t.liveNow}`}
                  </span>
                  {r.podium.length === 0 && (
                    <span className="text-[12.5px] text-bk-muted">{t.noEntries}</span>
                  )}
                  {r.podium.map(p => {
                    const def = resolveAvatar(p.avatar, p.mtLogin ?? p.displayName, taken)
                    taken.add(def.id)
                    return (
                      <div key={p.place} className="flex items-center gap-2">
                        <span className={`inline-flex w-4 justify-center text-[14px] ${
                          p.place === 1 ? "text-gold" : p.place === 2 ? "text-bk-muted" : "text-[#c08a52]"
                        }`}>
                          {p.place === 1 ? <Trophy /> : <Medal />}
                        </span>
                        <ContestAvatar def={def} size={22} />
                        <Flag value={p.country} size={14} />
                        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{p.displayName}</span>
                        <span className={`font-mono text-[12.5px] font-bold tabular-nums ${
                          (p.profit ?? 0) >= 0 ? "text-ok" : "text-bad"
                        }`}>
                          {signed0(p.profit)}
                        </span>
                      </div>
                    )
                  })}
                  {r.podium.length > 0 && (
                    <span className="text-[10.5px] text-bk-muted">
                      {r.podium[0].verified ? t.verified : t.unverified}
                    </span>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
