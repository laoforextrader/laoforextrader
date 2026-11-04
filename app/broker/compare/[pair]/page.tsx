// /broker/compare/<a>-vs-<b>
//
// Two brokers get the full width here, which is the comparison a phone-sized
// directory list cannot give. Every pair of brokers produces a page from the
// same records, so the set grows on its own as brokers are added — and
// "X ດີກວ່າ Y ບໍ" is the search a reader runs when they have already decided
// to open an account.

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { JsonLd, breadcrumbLd } from "@/lib/structuredData"
import type { Broker } from "@/types"
import {
  SCORE_ROWS,
  gradeColor,
  laoDepositState,
  LAO_DEPOSIT_LABEL,
  licensesOf,
  minDepositLabel,
  minDepositUsd,
  registerHref,
  scoreWord,
  spreadLabel,
} from "@/lib/broker"
import {
  ArrowIcon,
  CheckIcon,
  Flag,
  LicenseChips,
  MetaPill,
  Stars,
  btnSolid,
} from "@/components/broker/review/BrokerBits"

interface Props {
  params: Promise<{ pair: string }>
}

export const revalidate = 3600

function splitPair(pair: string): [string, string] | null {
  const parts = pair.split("-vs-")
  if (parts.length !== 2 || !parts[0] || !parts[1] || parts[0] === parts[1]) return null
  return [parts[0], parts[1]]
}

async function loadPair(pair: string) {
  const split = splitPair(pair)
  if (!split) return null
  const [slugA, slugB] = split
  const docs = await sanityClient.fetch<Broker[]>(
    QUERIES.brokersBySlugs(slugA, slugB),
    {},
    { next: { revalidate: 3600 } },
  )
  const a = docs?.find((d) => d.slug?.current === slugA)
  const b = docs?.find((d) => d.slug?.current === slugB)
  if (!a || !b) return null
  return { a, b }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params
  const found = await loadPair(pair)
  if (!found) return { title: "ບໍ່ພົບໜ້າທຽບ" }
  const { a, b } = found
  return {
    title: `${a.name} ທຽບກັບ ${b.name} — ອັນໃດດີກວ່າສຳລັບຄົນລາວ`,
    description: `ທຽບ ${a.name} ກັບ ${b.name}: ຝາກຂັ້ນຕ່ຳ Leverage Spread ໃບອະນຸຍາດ ແລະ ການຝາກ-ຖອນຜ່ານທະນາຄານລາວ`,
    alternates: { canonical: `/broker/compare/${pair}` },
  }
}

/* ── row model ───────────────────────────────────────────────────────────── */

type Row = { label: string; a: string | null; b: string | null; win: "a" | "b" | null }

/** Leverage arrives as "1:1000"; compare the part after the colon. */
function leverageValue(s?: string): number | null {
  if (!s) return null
  const n = Number(s.split(":").pop()?.replace(/[^0-9.]/g, ""))
  return Number.isFinite(n) && n > 0 ? n : null
}

function verifiedLicenses(b: Broker): number {
  return licensesOf(b).filter((l) => l.licenseNo && !l.isRepresentative).length
}

/** Null on either side means no winner: a gap is not a loss. */
function pick(
  av: number | null,
  bv: number | null,
  better: "high" | "low",
): "a" | "b" | null {
  if (av === null || bv === null || av === bv) return null
  const aWins = better === "high" ? av > bv : av < bv
  return aWins ? "a" : "b"
}

function buildRows(a: Broker, b: Broker): Row[] {
  const laoRank = { full: 2, partial: 1, none: 0 }
  const laoA = laoDepositState(a)
  const laoB = laoDepositState(b)

  return [
    {
      label: "ຄະແນນລວມ",
      a: `${(a.rating ?? 0).toFixed(1)} / 5`,
      b: `${(b.rating ?? 0).toFixed(1)} / 5`,
      win: pick(a.rating ?? null, b.rating ?? null, "high"),
    },
    {
      label: "ຝາກຂັ້ນຕ່ຳ",
      a: minDepositLabel(a),
      b: minDepositLabel(b),
      win: pick(minDepositUsd(a), minDepositUsd(b), "low"),
    },
    {
      label: "Leverage ສູງສຸດ",
      a: a.maxLeverage ?? null,
      b: b.maxLeverage ?? null,
      win: pick(leverageValue(a.maxLeverage), leverageValue(b.maxLeverage), "high"),
    },
    {
      label: "Spread ເລີ່ມຕົ້ນ",
      a: spreadLabel(a),
      b: spreadLabel(b),
      win: pick(a.spreadFrom ?? null, b.spreadFrom ?? null, "low"),
    },
    {
      label: "ຄວາມໄວໃນການຖອນ",
      a: a.withdrawalSpeed ?? null,
      b: b.withdrawalSpeed ?? null,
      win: null,
    },
    {
      label: "ຝາກຜ່ານທະນາຄານລາວ",
      a: LAO_DEPOSIT_LABEL[laoA],
      b: LAO_DEPOSIT_LABEL[laoB],
      win: pick(laoRank[laoA], laoRank[laoB], "high"),
    },
    {
      label: "ໃບອະນຸຍາດທີ່ກວດສອບໄດ້",
      a: `${verifiedLicenses(a)} ໃບ`,
      b: `${verifiedLicenses(b)} ໃບ`,
      win: pick(verifiedLicenses(a), verifiedLicenses(b), "high"),
    },
    {
      label: "ບັນຊີ Swap-free",
      a: a.swapFree ? "ມີ" : "ບໍ່ມີ",
      b: b.swapFree ? "ມີ" : "ບໍ່ມີ",
      win: pick(a.swapFree ? 1 : 0, b.swapFree ? 1 : 0, "high"),
    },
    {
      label: "ເປີດໃຫ້ບໍລິການມາ",
      a: a.founded ? `ຕັ້ງແຕ່ ${a.founded}` : null,
      b: b.founded ? `ຕັ້ງແຕ່ ${b.founded}` : null,
      win: pick(a.founded ?? null, b.founded ?? null, "low"),
    },
  ]
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default async function ComparePage({ params }: Props) {
  const { pair } = await params
  const found = await loadPair(pair)
  if (!found) notFound()
  const { a, b } = found

  const rows = buildRows(a, b)
  const winsA = rows.filter((r) => r.win === "a").length
  const winsB = rows.filter((r) => r.win === "b").length
  const path = `/broker/compare/${pair}`

  const others = await sanityClient.fetch<Broker[]>(QUERIES.allBrokers, {}, { next: { revalidate: 3600 } })
  const otherPairs = (others ?? [])
    .filter((o) => o.slug?.current && ![a.slug?.current, b.slug?.current].includes(o.slug?.current))
    .slice(0, 3)
    .map((o) => ({ left: a, right: o }))

  return (
    <div className="min-h-screen bg-bk-page">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "ໜ້າຫຼັກ", url: "/" },
            { name: "ໂບຣກເກີ", url: "/broker" },
            { name: `${a.name} ທຽບກັບ ${b.name}`, url: path },
          ]),
        ]}
      />

      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-8 sm:px-6">
        <nav aria-label="ເສັ້ນທາງ" className="mb-6 text-[15px] text-bk-muted">
          <Link href="/broker" className="text-bk-muted underline">
            ໂບຣກເກີ
          </Link>
          <span className="mx-2">›</span>
          <span className="text-bk-ink">
            {a.name} ທຽບກັບ {b.name}
          </span>
        </nav>

        <h1 className="m-0 max-w-[820px] text-[30px] font-bold leading-[1.14] tracking-[-0.03em] text-bk-ink sm:text-[40px] lg:text-[44px]">
          {a.name} ທຽບກັບ {b.name} — ອັນໃດດີກວ່າສຳລັບຄົນລາວ
        </h1>

        <div className="mt-5 flex flex-wrap gap-2">
          <MetaPill>
            <CheckIcon />
            ເປີດບັນຊີຈິງທັງສອງໂບຣກ
          </MetaPill>
          <MetaPill>ທຽບ {rows.length} ຫົວຂໍ້</MetaPill>
        </div>

        {/* ── head cards ──────────────────────────────────────────────── */}
        <div className="mt-8 grid items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-0">
          <HeadCard broker={a} wins={winsA} total={rows.length} />
          <div className="flex items-center justify-center md:px-5">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-bk border border-bk-line bg-bk-surface font-mono text-[15px] font-bold text-bk-muted">
              VS
            </span>
          </div>
          <HeadCard broker={b} wins={winsB} total={rows.length} />
        </div>

        {/* ── head to head ────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="m-0 text-[26px] font-bold leading-tight tracking-[-0.025em] text-bk-ink sm:text-[30px]">
            ທຽບແຕ່ລະຫົວຂໍ້
          </h2>
          <p className="mt-2 text-[15px] text-bk-muted">ຊ່ອງພື້ນສີຂຽວຄືຝ່າຍທີ່ດີກວ່າໃນຫົວຂໍ້ນັ້ນ</p>

          <div className="mt-4 overflow-hidden rounded-bk border border-bk-line">
            {/* header: desktop only — on a phone each row carries its own labels */}
            <div className="hidden border-b border-bk-line md:grid md:grid-cols-[minmax(0,240px)_minmax(0,1fr)_minmax(0,1fr)]">
              <span className="px-5 py-4 text-sm font-semibold text-bk-muted">ຫົວຂໍ້</span>
              <HeadName broker={a} />
              <HeadName broker={b} />
            </div>

            <ul className="m-0 list-none divide-y divide-bk-line p-0">
              {rows.map((r) => (
                <li
                  key={r.label}
                  className="px-5 py-4 md:grid md:grid-cols-[minmax(0,240px)_minmax(0,1fr)_minmax(0,1fr)] md:items-stretch md:gap-0 md:px-0 md:py-0"
                >
                  <span className="block text-sm text-bk-muted md:px-5 md:py-4 md:text-[15px]">
                    {r.label}
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-3 md:mt-0 md:contents">
                    <Cell value={r.a} win={r.win === "a"} name={a.name} />
                    <Cell value={r.b} win={r.win === "b"} name={b.name} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-t border-bk-line bg-bk-sunken px-5 py-5 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)_minmax(0,1fr)] md:gap-0 md:px-0">
              <span className="text-base font-bold text-bk-ink md:px-5">ຊະນະລວມ</span>
              <span className="font-mono text-[28px] font-bold tracking-[-0.04em] text-bk-ink md:px-5">
                {winsA}
              </span>
              <span className="font-mono text-[28px] font-bold tracking-[-0.04em] text-bk-ink md:px-5">
                {winsB}
              </span>
            </div>
          </div>
        </section>

        {/* ── category scores ─────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="m-0 mb-4 text-[26px] font-bold leading-tight tracking-[-0.025em] text-bk-ink sm:text-[30px]">
            ຄະແນນລາຍດ້ານ
          </h2>
          <div className="rounded-bk border border-bk-line p-5 sm:p-7">
            {SCORE_ROWS.map((row) => {
              const av = a.ratingBreakdown?.[row.key]
              const bv = b.ratingBreakdown?.[row.key]
              return (
                <div key={row.key} className="mb-5 last:mb-0">
                  <div className="mb-2 text-[15px] text-bk-ink">{row.label}</div>
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-5">
                    <MiniBar name={a.name} value={av} />
                    <MiniBar name={b.name} value={bv} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── dual CTA ────────────────────────────────────────────────── */}
        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <CtaCard broker={a} />
          <CtaCard broker={b} />
        </section>

        {/* ── other pairs ─────────────────────────────────────────────── */}
        {otherPairs.length > 0 && (
          <section className="mt-12">
            <h2 className="m-0 mb-4 text-[22px] font-bold leading-tight tracking-[-0.02em] text-bk-ink sm:text-[26px]">
              ຄູ່ອື່ນທີ່ຄົນທຽບເລື້ອຍ
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherPairs.map(({ left, right }) => (
                <Link
                  key={right._id}
                  href={`/broker/compare/${left.slug?.current}-vs-${right.slug?.current}`}
                  className="flex items-center gap-3 rounded-bk border border-bk-line p-5 no-underline transition-colors hover:border-bk-ink"
                >
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-bk-ink">
                    {left.name} ທຽບກັບ {right.name}
                  </span>
                  <span className="text-bk-muted">
                    <ArrowIcon />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 border-t border-bk-line pt-6">
          <p className="m-0 text-sm leading-[1.75] text-bk-muted">
            ພວກເຮົາໄດ້ຮັບຄ່າຕອບແທນເມື່ອທ່ານເປີດບັນຊີຜ່ານລິ້ງຂອງພວກເຮົາ ແຕ່ຜົນການທຽບມາຈາກຂໍ້ມູນທີ່ທົດສອບຈິງ ·
            ການລົງທຶນມີຄວາມສ່ຽງ
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── pieces ──────────────────────────────────────────────────────────────── */

function HeadCard({ broker, wins, total }: { broker: Broker; wins: number; total: number }) {
  const rating = broker.rating ?? 0
  const logo = broker.logo?.asset?.url as string | undefined
  return (
    <div className="rounded-bk border border-bk-line p-6 sm:p-7">
      <div className="mb-4 flex items-center gap-3.5">
        {logo && (
          <Image
            src={logo}
            alt={broker.name}
            width={52}
            height={52}
            data-no-dim
            className="shrink-0 rounded-bk border border-bk-line object-cover"
            style={{ width: 52, height: 52 }}
          />
        )}
        <span className="flex min-w-0 flex-col gap-1">
          <Link
            href={`/broker/${broker.slug?.current ?? ""}`}
            className="truncate text-xl font-bold leading-tight tracking-[-0.02em] text-bk-ink no-underline hover:underline"
          >
            {broker.name}
          </Link>
          <LicenseChips licenses={licensesOf(broker)} max={3} />
        </span>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <div className="font-mono text-[56px] font-bold leading-[0.95] tracking-[-0.05em] text-bk-ink sm:text-[64px]">
            {rating.toFixed(1)}
          </div>
          <div className="mt-1.5 text-[17px] font-bold tracking-[-0.02em] text-bk-ink">
            {scoreWord(rating)}
          </div>
        </div>
        <div className="flex flex-col gap-2.5 pb-1.5">
          <Stars rating={rating} size={20} />
          <span
            className={`inline-block rounded-bk border px-3 py-1.5 text-sm font-semibold ${
              wins > total / 2
                ? "border-ok-line bg-ok-soft text-ok-ink"
                : "border-bk-line text-bk-muted"
            }`}
          >
            ຊະນະ {wins} ຈາກ {total} ຫົວຂໍ້
          </span>
        </div>
      </div>
    </div>
  )
}

function HeadName({ broker }: { broker: Broker }) {
  const logo = broker.logo?.asset?.url as string | undefined
  return (
    <span className="flex items-center gap-2.5 px-5 py-4">
      {logo && (
        <Image
          src={logo}
          alt=""
          width={30}
          height={30}
          data-no-dim
          className="shrink-0 rounded-bk border border-bk-line object-cover"
          style={{ width: 30, height: 30 }}
        />
      )}
      <span className="truncate text-base font-bold tracking-[-0.02em] text-bk-ink">
        {broker.name}
      </span>
    </span>
  )
}

function Cell({ value, win, name }: { value: string | null; win: boolean; name: string }) {
  return (
    <div
      className={`rounded-bk px-3 py-3 md:rounded-none md:px-5 md:py-4 ${
        win ? "bg-ok-soft md:shadow-[inset_3px_0_0_var(--success)]" : "bg-bk-sunken md:bg-transparent"
      }`}
    >
      <div className="mb-1 truncate text-xs text-bk-muted md:hidden">{name}</div>
      <div
        className={`text-[15px] leading-snug md:text-base ${
          win ? "font-bold text-ok-ink" : "font-normal text-bk-muted"
        }`}
      >
        {value ?? "ຍັງບໍ່ມີຂໍ້ມູນ"}
      </div>
    </div>
  )
}

function MiniBar({ name, value }: { name: string; value?: number }) {
  const pct = typeof value === "number" ? (value / 5) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 truncate text-xs text-bk-muted sm:hidden">{name}</span>
      <span className="block h-4 flex-1 overflow-hidden rounded-[3px] bg-bk-track">
        {typeof value === "number" && (
          <span
            className="bk-bar block h-full rounded-[3px]"
            style={{ "--bk-w": `${pct}%`, background: gradeColor(value) } as React.CSSProperties}
          />
        )}
      </span>
      <span className="w-8 shrink-0 text-right font-mono text-[13px] font-semibold text-bk-ink">
        {typeof value === "number" ? value.toFixed(1) : "—"}
      </span>
    </div>
  )
}

function CtaCard({ broker }: { broker: Broker }) {
  const href = registerHref(broker)
  const logo = broker.logo?.asset?.url as string | undefined
  const lao = laoDepositState(broker)
  return (
    <div className="rounded-bk border border-bk-line p-6 text-center sm:p-7">
      {logo && (
        <Image
          src={logo}
          alt=""
          width={48}
          height={48}
          data-no-dim
          className="mx-auto mb-3.5 rounded-bk border border-bk-line object-cover"
          style={{ width: 48, height: 48 }}
        />
      )}
      <div className="mb-1.5 text-lg font-bold tracking-[-0.02em] text-bk-ink">
        ເປີດບັນຊີ {broker.name}
      </div>
      <div className="mb-5 flex items-center justify-center gap-2 text-sm text-bk-muted">
        <Flag src={null} alt="" />
        {lao === "full" ? "ຝາກເງິນກີບໄດ້" : broker.withdrawalSpeed || "ສະໝັກຟຣີ"}
      </div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`${btnSolid} w-full min-h-[52px] text-base`}
        >
          ສະໝັກ {broker.name.split(" ")[0]}
        </a>
      )}
    </div>
  )
}
