"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CandleBand, Arrow, Trophy } from "@/components/contest/icons"

// The contest promo that sits under the homepage hero.
//
// The homepage is deliberately flat — one radius, hairline borders, no
// shadow — so a second flat card would simply disappear into the article
// grid below it. This one is allowed to be the exception: it keeps the 8px
// radius and the 1100px column, and buys its prominence with a dark panel
// and motion instead of a louder typeface. Gold stays where it is on
// /contest: prize money only.
//
// The panel paints the same dark surface in both themes. That is not an
// oversight — it is the prize pool, and the figure is more legible on a
// fixed dark field than on a sheet that flips with the reader's theme.
//
// Nothing here is rendered on the server that the browser could disagree
// with. The countdown starts at null and fills in after mount: a clock
// rendered on the server is already stale when it arrives, and React treats
// one differing digit as a hydration failure — which is exactly what used to
// knock /contest out of dark mode.

export interface HomeContest {
  title: string
  slug: string
  status: "register" | "live" | "judging" | "done"
  startAt?: string
  endAt?: string
  announceAt?: string
  pool: number
  startBalance?: number
  currency?: string
  symbol?: string
  seats: number
  entries: number
}

const T = {
  register: "ເປີດຮັບລົງທະບຽນ",
  live: "ກຳລັງແຂ່ງຂັນ",
  judging: "ກຳລັງກວດຜົນ",
  done: "ຈົບການແຂ່ງຂັນແລ້ວ",
  startsIn: "ເລີ່ມໃນອີກ",
  endsIn: "ເຫຼືອອີກ",
  resultsIn: "ປະກາດຜົນໃນອີກ",
  prizePool: "ເງິນລາງວັນລວມ",
  seatsLeft: "ບ່ອນນັ່ງເຫຼືອ",
  seatsFull: "ຮອບນີ້ເຕັມແລ້ວ",
  register_: "ລົງທະບຽນ",
  details: "ເບິ່ງລາຍລະອຽດ",
  board: "ເບິ່ງກະດານອັນດັບ",
  head: "ແຂ່ງຂັນເທຣດ Demo",
  headGold: "ທອງຄຳ",
  headB: "ດ້ວຍ TheRocket EA",
  lede: "ທຸກຄົນເລີ່ມທີ່ {bal} ດ້ວຍ EA ໂຕດຽວກັນ ໃຜກຳໄລສູງສຸດຕອນປິດຕະຫຼາດມື້ສຸດທ້າຍ ຄືຜູ້ຊະນະ",
  free: "ເຂົ້າຮ່ວມຟຣີ · ບັນຊີ Demo ບໍ່ໄດ້ໃຊ້ເງິນຈິງ",
  d: "ມື້", h: "ຊມ", m: "ນາທີ", s: "ວິ",
}

const pad = (n: number) => String(n).padStart(2, "0")

const money = (v?: number, currency?: string) => {
  if (typeof v !== "number") return "—"
  const n = v.toLocaleString("en-US", { maximumFractionDigits: 0 })
  return currency === "USD" ? `$${n}` : currency === "cent" ? `${n}¢` : n
}

/** Client-only, for the reason in the file header. */
function useCountdown(to?: string) {
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

export default function HomeContestBanner({ contest }: { contest: HomeContest }) {
  const { status, seats, entries } = contest
  const seatsLeft = seats > 0 ? Math.max(0, seats - entries) : null
  const full = seatsLeft === 0
  const canRegister = status === "register" && !full

  const target =
    status === "register" ? contest.startAt :
    status === "live" ? contest.endAt :
    status === "judging" ? contest.announceAt :
    undefined
  const cd = useCountdown(target)
  const cdLabel =
    status === "register" ? T.startsIn :
    status === "live" ? T.endsIn : T.resultsIn

  const statusText = T[status]
  const statusTone = status === "live" ? "text-[#2ecb94]" : status === "register" ? "text-[#8fb4ff]" : "text-white/60"
  const dotTone = status === "live" ? "bg-[#2ecb94]" : status === "register" ? "bg-[#4d7cfe]" : "bg-white/40"

  return (
    <section className="border-b border-bk-line bg-bk-page">
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="ct-card relative isolate overflow-hidden rounded-bk border border-[#232834] bg-[#0b0e15] text-white">
          {/* the sweep of light, and the candles it travels over */}
          <CandleBand className="ct-candles pointer-events-none absolute inset-x-0 bottom-0 h-[128px] text-white opacity-[0.07]" />
          <span aria-hidden className="ct-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/3" />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.16] blur-3xl"
            style={{ background: "radial-gradient(circle, #d9a441 0%, transparent 70%)" }}
          />

          <div className="relative grid gap-6 p-5 sm:p-7 md:grid-cols-[1.08fr_0.92fr] md:items-center md:gap-9">
            {/* ── left: what it is, and the way in ── */}
            <div>
              <span className="ct-rise inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                <span className={`ct-dot relative h-[7px] w-[7px] rounded-full ${dotTone}`} />
                <span className={statusTone}>{statusText}</span>
                <span className="text-white/35">·</span>
                <span className="text-white/55 normal-case tracking-normal">{contest.title}</span>
              </span>

              {/* `!text-white`: globals.css sets `h1..h6 { color: var(--fg) !important }`,
                  which beats an inherited text-white and painted this headline
                  near-black on the dark panel for every reader in light mode. */}
              <h2 className="ct-rise ct-rise-1 lao-head m-0 mt-3 text-[25px] font-bold leading-[1.32] tracking-[-0.02em] !text-white sm:text-[31px]">
                {T.head} <span className="ct-gold whitespace-nowrap text-[#e3b561]">{T.headGold}</span>
                <br className="hidden sm:block" />{" "}
                <span className="text-white/90">{T.headB}</span>
              </h2>

              <p className="ct-rise ct-rise-2 m-0 mt-3 max-w-[48ch] text-[13.5px] leading-[1.75] text-white/60">
                {T.lede.replace("{bal}", money(contest.startBalance, contest.currency))}
              </p>

              <div className="ct-rise ct-rise-3 mt-5 flex flex-wrap items-center gap-3">
                {canRegister ? (
                  <Link
                    href="/contest/register"
                    className="ct-cta group inline-flex min-h-[46px] items-center gap-2 rounded-bk bg-[#4d7cfe] px-5 text-[14.5px] font-semibold text-white no-underline"
                  >
                    {T.register_}
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      <Arrow />
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/contest"
                    className="group inline-flex min-h-[46px] items-center gap-2 rounded-bk bg-white px-5 text-[14.5px] font-semibold text-[#0b0e15] no-underline"
                  >
                    {status === "register" ? T.seatsFull : T.board}
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      <Arrow />
                    </span>
                  </Link>
                )}
                <Link
                  href="/contest"
                  className="inline-flex min-h-[46px] items-center rounded-bk border border-white/20 px-4 text-[13.5px] font-semibold text-white/85 no-underline hover:border-white/45 hover:text-white"
                >
                  {T.details}
                </Link>
              </div>

              <p className="ct-rise ct-rise-3 m-0 mt-3 text-[11.5px] text-white/40">{T.free}</p>

              {seatsLeft !== null && status === "register" && (
                <div className="ct-rise ct-rise-4 mt-4 max-w-[230px]">
                  <div className="flex items-baseline justify-between text-[11.5px] text-white/55">
                    <span>{T.seatsLeft}</span>
                    <span className="font-mono tabular-nums text-white/80">
                      {seatsLeft} / {seats}
                    </span>
                  </div>
                  <span className="mt-1.5 block h-1 overflow-hidden rounded-sm bg-white/12">
                    <span
                      className="ct-bar block h-full rounded-sm bg-[#4d7cfe]"
                      style={{ width: `${Math.round((seatsLeft / seats) * 100)}%` }}
                    />
                  </span>
                </div>
              )}
            </div>

            {/* ── right: the money, and the clock ── */}
            <div className="ct-rise ct-rise-2 overflow-hidden rounded-[12px] border border-white/12 bg-white/[0.035]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/45">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[13px] text-[#e3b561]"><Trophy /></span>
                  {T.prizePool}
                </span>
                <span className="font-mono normal-case tracking-normal">{contest.symbol ?? "XAUUSD"}</span>
              </div>

              <div className="px-4 pb-3 pt-[18px] text-center">
                <b className="ct-gold block font-mono text-[42px] font-bold leading-none tracking-[-0.03em] text-[#e3b561] sm:text-[50px]">
                  {money(contest.pool, "USD")}
                </b>
              </div>

              {cd ? (
                <>
                  <p className="m-0 border-t border-white/10 px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
                    {cdLabel}
                  </p>
                  <div className="grid grid-cols-4 border-t border-white/10">
                    {([[cd.d, T.d], [cd.h, T.h], [cd.m, T.m], [cd.s, T.s]] as const).map(([v, unit], i) => (
                      <div key={unit} className={`px-1 py-3 text-center ${i ? "border-l border-white/10" : ""}`}>
                        <b className="block font-mono text-[20px] font-medium tabular-nums">{pad(v as number)}</b>
                        <span className="text-[10px] text-white/40">{unit}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                // Reserves the clock's height, so nothing jumps when it arrives.
                <div className="border-t border-white/10 px-4 py-[31px] text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  {cdLabel}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
