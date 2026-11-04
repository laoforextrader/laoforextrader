"use client"

// The /broker list: filter, sort, and pick two or three brokers to compare.
//
// Mobile shape first. The obvious build for "compare brokers" is a wide
// table, but a table on a 360px phone either scrolls sideways (readers miss
// columns and never know it) or shrinks type past legibility. So every broker
// is a card that reflows into a row at lg; the comparison that a table would
// have given is the job of the compare page, where two brokers get the width.

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { event } from "@/lib/gtag"
import { trackClick, brokerTarget } from "@/lib/trackClick"
import type { Broker } from "@/types"
import {
  licensesOf,
  minDepositUsd,
  minDepositLabel,
  spreadLabel,
  laoDepositState,
  LAO_DEPOSIT_LABEL,
  registerHref,
  sortBrokers,
} from "@/lib/broker"
import { LicenseChips, Stars, btnSolid, ArrowIcon } from "./BrokerBits"

type SortKey = "rank" | "rating" | "minDep"

const FILTERS: { id: string; label: string; test: (b: Broker) => boolean }[] = [
  {
    id: "lao",
    label: "ຝາກຜ່ານທະນາຄານລາວ",
    test: (b) => laoDepositState(b) === "full",
  },
  {
    id: "small",
    label: "ທຶນເລີ່ມຕົ້ນ ≤ $20",
    // A broker with no recorded minimum fails this filter instead of passing
    // it: "we don't know" must never read as "cheap".
    test: (b) => {
      const n = minDepositUsd(b)
      return n !== null && n <= 20
    },
  },
  { id: "swap", label: "ມີບັນຊີ Swap-free", test: (b) => Boolean(b.swapFree) },
  {
    id: "lic",
    label: "ມີເລກໃບອະນຸຍາດບັນທຶກໄວ້",
    test: (b) => licensesOf(b).some((l) => l.licenseNo && !l.isRepresentative),
  },
]

const MAX_COMPARE = 3

export default function BrokerDirectory({ brokers }: { brokers: Broker[] }) {
  const [active, setActive] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>("rank")
  const [picked, setPicked] = useState<string[]>([])

  const rows = useMemo(() => {
    const filtered = brokers.filter((b) =>
      active.every((id) => FILTERS.find((f) => f.id === id)?.test(b) ?? true),
    )
    return sortBrokers(filtered, sort)
  }, [brokers, active, sort])

  const pickedBrokers = brokers.filter((b) => picked.includes(b.slug?.current ?? ""))

  function toggleFilter(id: string) {
    setActive((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))
  }

  function togglePick(slug: string) {
    setPicked((xs) =>
      xs.includes(slug) ? xs.filter((x) => x !== slug) : xs.length < MAX_COMPARE ? [...xs, slug] : xs,
    )
  }

  const compareHref =
    pickedBrokers.length >= 2
      ? `/broker/compare/${pickedBrokers[0].slug?.current}-vs-${pickedBrokers[1].slug?.current}`
      : null

  return (
    <div>
      {/* ── controls ────────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="m-0 text-[26px] font-bold leading-tight tracking-[-0.025em] text-bk-ink sm:text-[30px]">
            ໂບຣກເກີທັງໝົດ
          </h2>
          <p className="mt-1.5 text-sm text-bk-muted">ເລືອກ 2–3 ໂບຣກເກີເພື່ອທຽບແບບລະອຽດ</p>
        </div>
        <label className="flex items-center gap-2.5 text-[15px] text-bk-ink">
          <span className="shrink-0">ຮຽງຕາມ</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="min-h-[48px] w-full rounded-bk border border-bk-line bg-bk-surface px-3 py-3 text-[15px] font-medium text-bk-ink sm:w-auto"
          >
            <option value="rank">ອັນດັບແນະນຳ</option>
            <option value="rating">ຄະແນນສູງສຸດ</option>
            <option value="minDep">ຝາກຂັ້ນຕ່ຳນ້ອຍສຸດ</option>
          </select>
        </label>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const on = active.includes(f.id)
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => toggleFilter(f.id)}
              aria-pressed={on}
              className={`min-h-[44px] rounded-bk border px-4 py-2.5 text-sm font-medium transition-[transform,background-color,border-color] duration-150 hover:scale-[1.03] active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none ${
                on
                  ? "border-bk-ink bg-bk-ink text-bk-page"
                  : "border-bk-line bg-bk-surface text-bk-ink hover:border-bk-ink"
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* ── list ────────────────────────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="rounded-bk border border-bk-line px-6 py-14 text-center text-base text-bk-muted">
          ບໍ່ມີໂບຣກເກີທີ່ກົງກັບເງື່ອນໄຂ — ລອງປິດຕົວກັ່ນຕອງບາງອັນ
        </div>
      ) : (
        <ul className="m-0 list-none divide-y divide-bk-line rounded-bk border border-bk-line p-0">
          {rows.map((b) => (
            <BrokerRow
              key={b._id}
              broker={b}
              picked={picked.includes(b.slug?.current ?? "")}
              onToggle={() => togglePick(b.slug?.current ?? "")}
              disabled={picked.length >= MAX_COMPARE && !picked.includes(b.slug?.current ?? "")}
            />
          ))}
        </ul>
      )}

      <p className="mt-4 text-sm leading-relaxed text-bk-muted">
        Spread ທີ່ສະແດງ “ຍັງບໍ່ມີຂໍ້ມູນ” ແມ່ນຍັງບໍ່ທັນໄດ້ບັນທຶກໄວ້ໃນລະບົບ — ພວກເຮົາບໍ່ເຕີມຕົວເລກທີ່ຍັງບໍ່ໄດ້ທົດສອບ
      </p>

      {/* ── compare bar ─────────────────────────────────────────────────── */}
      {picked.length > 0 && (
        <div className="sticky bottom-3 z-10 mt-6 sm:bottom-5">
          <div className="flex flex-col gap-3 rounded-bk bg-bk-ink p-4 text-bk-page sm:flex-row sm:items-center sm:gap-4">
            <span className="text-[15px] font-semibold">
              {picked.length >= 2 ? "ພ້ອມທຽບແລ້ວ" : `ເລືອກອີກ ${2 - picked.length} ໂບຣກເກີ`}
            </span>
            <div className="flex flex-1 flex-wrap gap-2">
              {pickedBrokers.map((b) => (
                <span
                  key={b._id}
                  className="inline-flex items-center gap-2 rounded-bk bg-white/15 py-1.5 pl-3 pr-1.5 text-sm"
                >
                  {b.name}
                  <button
                    type="button"
                    onClick={() => togglePick(b.slug?.current ?? "")}
                    aria-label={`ເອົາ ${b.name} ອອກ`}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            {compareHref ? (
              <Link
                href={compareHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-bk bg-bk-page px-5 py-3 text-[15px] font-semibold text-bk-ink no-underline transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] motion-reduce:transform-none"
              >
                ທຽບ {picked.length} ໂບຣກເກີ
              </Link>
            ) : (
              <span className="inline-flex min-h-[48px] cursor-not-allowed items-center justify-center rounded-bk bg-white/15 px-5 py-3 text-[15px] font-semibold text-white/55">
                ທຽບ {picked.length} ໂບຣກເກີ
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── one broker ──────────────────────────────────────────────────────────── */

function BrokerRow({
  broker,
  picked,
  onToggle,
  disabled,
}: {
  broker: Broker
  picked: boolean
  onToggle: () => void
  disabled: boolean
}) {
  const slug = broker.slug?.current ?? ""
  const href = `/broker/${slug}`
  const licenses = licensesOf(broker)
  const lao = laoDepositState(broker)
  const register = registerHref(broker)
  const logo = broker.logo?.asset?.url as string | undefined

  const stats: { label: string; value: string | null }[] = [
    { label: "ຝາກຂັ້ນຕ່ຳ", value: minDepositLabel(broker) },
    { label: "Leverage", value: broker.maxLeverage ?? null },
    { label: "Spread", value: spreadLabel(broker) },
  ]

  return (
    <li className={`p-5 sm:p-6 ${picked ? "bg-bk-sunken" : ""}`}>
      <div className="grid gap-5 lg:grid-cols-[2.2fr_1.1fr_minmax(170px,0.9fr)] lg:items-center lg:gap-6">
        {/* identity */}
        <div className="flex items-start gap-4">
          <span className="w-7 shrink-0 pt-1 text-center font-mono text-lg font-bold text-bk-muted">
            {broker.rank ?? "—"}
          </span>
          {logo && (
            <Image
              src={logo}
              alt={broker.name}
              width={56}
              height={56}
              data-no-dim
              className="h-14 w-14 shrink-0 rounded-bk border border-bk-line object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={href}
              className="text-lg font-bold leading-snug tracking-[-0.02em] text-bk-ink no-underline hover:underline sm:text-xl"
            >
              {broker.name}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Stars rating={broker.rating ?? 0} />
              <span className="font-mono text-[15px] font-bold text-bk-ink">
                {(broker.rating ?? 0).toFixed(1)}
              </span>
              {broker.verdict && (
                <span className="text-sm text-bk-muted">· {broker.verdict}</span>
              )}
            </div>
            <LicenseChips licenses={licenses} max={3} className="mt-2.5" />
          </div>
        </div>

        {/* stats — three across on a phone, so nothing scrolls sideways */}
        <div className="grid grid-cols-3 gap-3 border-t border-bk-line pt-4 lg:grid-cols-1 lg:gap-2 lg:border-0 lg:pt-0">
          {stats.map((s) => (
            <div key={s.label} className="lg:flex lg:items-baseline lg:justify-between lg:gap-3">
              <div className="text-xs text-bk-muted lg:text-sm">{s.label}</div>
              <div
                className={
                  s.value
                    ? "mt-0.5 font-mono text-[15px] font-semibold text-bk-ink lg:mt-0"
                    : "mt-0.5 text-xs italic text-bk-muted lg:mt-0"
                }
              >
                {s.value ?? "ຍັງບໍ່ມີຂໍ້ມູນ"}
              </div>
            </div>
          ))}
          <div className="col-span-3 lg:col-span-1 lg:flex lg:items-baseline lg:justify-between lg:gap-3">
            <div className="text-xs text-bk-muted lg:text-sm">ທະນາຄານລາວ</div>
            <div
              className={`mt-0.5 text-[13px] font-semibold lg:mt-0 ${
                lao === "full" ? "text-ok-ink dark:text-ok" : "text-bk-muted"
              }`}
            >
              {LAO_DEPOSIT_LABEL[lao]}
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="flex flex-col gap-2.5">
          {register && (
            <a
              href={register}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => {
                event({ action: "broker_click", category: "Broker", label: broker.name })
                trackClick({ target: brokerTarget(slug || broker.name), label: broker.name, group: "broker" })
              }}
              className={`${btnSolid} w-full`}
            >
              ເປີດບັນຊີ
              <ArrowIcon />
            </a>
          )}
          <Link
            href={href}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-bk border border-bk-line px-4 py-2.5 text-sm font-semibold text-bk-ink no-underline hover:bg-bk-sunken"
          >
            ອ່ານລີວິວ
          </Link>
          <label
            className={`flex min-h-[44px] items-center justify-center gap-2 text-sm ${
              disabled ? "cursor-not-allowed text-bk-muted/60" : "cursor-pointer text-bk-muted"
            }`}
          >
            <input
              type="checkbox"
              checked={picked}
              disabled={disabled}
              onChange={onToggle}
              className="h-[17px] w-[17px] accent-accent"
            />
            ເລືອກທຽບ
          </label>
        </div>
      </div>
    </li>
  )
}
