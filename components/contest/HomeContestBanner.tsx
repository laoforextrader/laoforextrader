"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CandleBand, Arrow } from "@/components/contest/icons"

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
  lede: "ທຸກຄົນເລີ່ມທີ່ {bal} ດ້ວຍ EA ໂຕດຽວກັນ · ໃຜກຳໄລສູງສຸດ ຄືຜູ້ຊະນະ",
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

  // The clock as one line rather than four tiles. A strip has room for
  // "2d 04:11:38" and not for a grid of boxes, and the figure people read
  // off it is the first number anyway.
  const clock = cd
    ? (cd.d > 0 ? `${cd.d}${T.d} ` : "") + `${pad(cd.h)}:${pad(cd.m)}:${pad(cd.s)}`
    : null

  return (
    <section className="border-b border-bk-line bg-bk-page">
      <div className="mx-auto max-w-[1100px] px-4 py-3 sm:px-6 sm:py-4">
        <div className="ct-card relative isolate overflow-hidden rounded-bk border border-[#232834] bg-[#0b0e15] text-white">
          <CandleBand className="ct-candles pointer-events-none absolute inset-x-0 bottom-0 h-[72px] text-white opacity-[0.06]" />
          <span aria-hidden className="ct-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/3" />

          <div className="relative flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-5 sm:py-3.5">
            {/* what it is */}
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em]">
                <span className={`ct-dot relative h-[6px] w-[6px] rounded-full ${dotTone}`} />
                <span className={statusTone}>{statusText}</span>
                <span className="text-white/30">·</span>
                <span className="normal-case tracking-normal text-white/50">{contest.title}</span>
              </span>

              {/* `!text-white`: globals.css sets `h1..h6 { color: var(--fg) !important }`,
                  which beats an inherited text-white and painted this headline
                  near-black on the dark panel for every reader in light mode. */}
              <h2 className="lao-head m-0 mt-1 text-[17px] font-bold leading-[1.35] tracking-[-0.01em] !text-white sm:text-[19px]">
                {T.head} <span className="ct-gold text-[#e3b561]">{T.headGold}</span>{" "}
                <span className="text-white/85">{T.headB}</span>
              </h2>

              <p className="m-0 mt-0.5 truncate text-[12px] text-white/50">
                {T.lede.replace("{bal}", money(contest.startBalance, contest.currency))}
              </p>
            </div>

            {/* the money and the clock, side by side rather than stacked */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="text-left sm:text-right">
                <span className="block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  {T.prizePool}
                </span>
                <b className="ct-gold block font-mono text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#e3b561] sm:text-[27px]">
                  {money(contest.pool, "USD")}
                </b>
              </div>

              <div className="text-left sm:text-right">
                <span className="block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  {cdLabel}
                </span>
                {/* min-width holds the row still while the clock fills in
                    after mount — see the file header on hydration. */}
                <b className="block min-w-[104px] font-mono text-[18px] font-medium tabular-nums leading-tight text-white/90 sm:text-[20px]">
                  {clock ?? "\u2014"}
                </b>
              </div>
            </div>

            {/* the way in */}
            <div className="flex shrink-0 items-center gap-2">
              {canRegister ? (
                <Link
                  href="/contest/register"
                  className="ct-cta group inline-flex min-h-[38px] items-center gap-1.5 rounded-bk bg-[#4d7cfe] px-4 text-[13.5px] font-semibold text-white no-underline"
                >
                  {T.register_}
                  <span className="transition-transform duration-200 group-hover:translate-x-1"><Arrow /></span>
                </Link>
              ) : (
                <Link
                  href="/contest"
                  className="group inline-flex min-h-[38px] items-center gap-1.5 rounded-bk bg-white px-4 text-[13.5px] font-semibold text-[#0b0e15] no-underline"
                >
                  {status === "register" ? T.seatsFull : T.board}
                  <span className="transition-transform duration-200 group-hover:translate-x-1"><Arrow /></span>
                </Link>
              )}
              <Link
                href="/contest"
                className="inline-flex min-h-[38px] items-center rounded-bk border border-white/18 px-3 text-[12.5px] font-semibold text-white/80 no-underline hover:border-white/45 hover:text-white"
              >
                {T.details}
              </Link>
            </div>
          </div>

          {/* seats, as a hairline across the bottom instead of a block of its
              own: it is a detail, and it was taking a fifth of the panel. */}
          {seatsLeft !== null && status === "register" && (
            <div className="relative flex items-center gap-2 border-t border-white/8 px-4 py-1.5 text-[10.5px] text-white/45">
              <span>{T.seatsLeft}</span>
              <span className="font-mono tabular-nums text-white/75">{seatsLeft} / {seats}</span>
              <span className="ml-1 block h-[3px] w-[90px] overflow-hidden rounded-sm bg-white/12">
                <span className="ct-bar block h-full rounded-sm bg-[#4d7cfe]"
                  style={{ width: `${Math.round((seatsLeft / seats) * 100)}%` }} />
              </span>
              <span className="ml-auto hidden sm:block">{T.free}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
