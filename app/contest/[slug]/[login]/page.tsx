import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { sanityWrite } from "@/lib/sanityWrite"
import { contestBySlug, leaderboard } from "@/lib/contest/store"
import { ContestAvatar, resolveAvatar } from "@/components/contest/avatars"
import Flag from "@/components/contest/Flag"
import { countryName } from "@/lib/contest/countries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Contestant — Demo Trading Contest",
  robots: { index: false, follow: true },
}

/**
 * One contestant's page.
 *
 * Public, so it carries only what the leaderboard already shows plus the
 * detail behind it. The equity curve lands here in phase 3; until the EA is
 * pushing there is nothing to draw, and a chart of one point is worse than no
 * chart.
 */
export default async function ContestantPage(
  { params }: { params: Promise<{ slug: string; login: string }> }
) {
  const { slug, login } = await params
  const contest = await contestBySlug(slug)
  if (!contest) notFound()

  const entry = await sanityWrite.fetch<any>(
    `*[_type == "contestEntry" && contest._ref == $id && mtLogin == $login][0]{
       displayName, mtLogin, mtServer, country, avatar, entryNo, status,
       equity, balance, profit, profitPct, maxDDPct, trades, lots,
       openPositions, deposits, withdrawals, firstSeen, lastSeen
     }`,
    { id: contest._id, login }
  )
  if (!entry) notFound()

  const board = await leaderboard(contest._id)
  const rank = board.findIndex(r => r.mtLogin === login) + 1

  const cell = (label: string, value: string, tone?: "ok" | "bad") => (
    <div key={label} className="rounded-bk border border-bk-line bg-bk-sunken px-3 py-2">
      <div className="text-[10.5px] uppercase tracking-wide text-bk-muted">{label}</div>
      <div className={`font-mono text-[14px] font-bold ${tone === "ok" ? "text-ok" : tone === "bad" ? "text-bad" : ""}`}>
        {value}
      </div>
    </div>
  )
  const num = (v: unknown, d = 2) => (typeof v === "number" ? v.toFixed(d) : "—")
  const profitTone = (entry.profit ?? 0) >= 0 ? "ok" : "bad"

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-4 px-4 py-6">
      <div>
        <Link href={`/contest/${slug}`} className="text-[12px] text-bk-muted hover:text-accent">← {contest.title}</Link>
        <div className="mt-1 flex items-center gap-3">
          {/* The same mark and flag the board gave them, so a reader who
              followed a row here can see they landed on the right person. */}
          <ContestAvatar def={resolveAvatar(entry.avatar, entry.mtLogin ?? entry.displayName)} size={40} />
          <div>
            <h1 className="text-[20px] font-extrabold tracking-tight">{entry.displayName}</h1>
            <p className="flex items-center gap-1.5 text-[12.5px] text-bk-muted">
              <Flag value={entry.country} size={14} />
              #{entry.mtLogin}
              {entry.country ? ` · ${countryName(entry.country, "en")}` : ""}
              {rank ? ` · rank ${rank}` : ""}
            </p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cell("Profit", num(entry.profit), profitTone)}
        {cell("Profit %", typeof entry.profitPct === "number" ? `${entry.profitPct.toFixed(1)}%` : "—", profitTone)}
        {cell("Max drawdown", typeof entry.maxDDPct === "number" ? `${entry.maxDDPct.toFixed(1)}%` : "—")}
        {cell("Equity", num(entry.equity))}
        {cell("Balance", num(entry.balance))}
        {cell("Trades", String(entry.trades ?? 0))}
        {cell("Lots", num(entry.lots))}
        {cell("Open positions", String(entry.openPositions ?? 0))}
        {cell("Deposits after start", num(entry.deposits ?? 0))}
      </section>

      <p className="text-[11.5px] text-bk-muted">
        {entry.lastSeen
          ? `Last update ${new Date(entry.lastSeen).toLocaleString()}`
          : "The EA has not sent anything yet."}
      </p>
    </div>
  )
}
