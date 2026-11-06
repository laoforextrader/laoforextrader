"use client"

// The /broker list: filter, sort, and optionally pick brokers to compare.
//
// One row per broker, ~92px tall on a phone. The first build stacked the
// desktop card — stats block, two full-width buttons, a checkbox — and came
// out near 800px per broker, so six brokers took eight screens to scroll
// past. Everything a reader scans by now sits on three lines, and the row
// itself is the link; the buttons live on the review page, which is where
// someone decides anyway.
//
// Comparing is a mode, not a permanent column: checkboxes appear only after
// the reader asks for them, so the default list carries no controls it has
// not been asked for.

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
  LAO_DEPOSIT_SHORT,
  registerHref,
  sortBrokers,
  gradeColor,
  gradeInk,
} from "@/lib/broker"
import { Flag, btnSolid, ArrowIcon } from "./BrokerBits"

type SortKey = "rank" | "rating" | "minDep"

const FILTERS: { id: string; label: string; test: (b: Broker) => boolean }[] = [
  { id: "lao", label: "ຝາກຜ່ານທະນາຄານລາວ", test: (b) => laoDepositState(b) === "full" },
  {
    id: "small",
    label: "ທຶນ ≤ $20",
    // Unknown fails the filter rather than passing it: "we have not recorded
    // this" must never be read as "cheap".
    test: (b) => {
      const n = minDepositUsd(b)
      return n !== null && n <= 20
    },
  },
  { id: "swap", label: "Swap-free", test: (b) => Boolean(b.swapFree) },
  {
    id: "lic",
    label: "ມີເລກໃບອະນຸຍາດ",
    test: (b) => licensesOf(b).some((l) => l.licenseNo && !l.isRepresentative),
  },
]

const MAX_COMPARE = 3

export default function BrokerDirectory({ brokers }: { brokers: Broker[] }) {
  const [active, setActive] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>("rank")
  const [compareMode, setCompareMode] = useState(false)
  const [picked, setPicked] = useState<string[]>([])

  const rows = useMemo(() => {
    const filtered = brokers.filter((b) =>
      active.every((id) => FILTERS.find((f) => f.id === id)?.test(b) ?? true),
    )
    return sortBrokers(filtered, sort)
  }, [brokers, active, sort])

  const pickedBrokers = brokers.filter((b) => picked.includes(b.slug?.current ?? ""))

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
      {/* ── filters: one row that scrolls sideways, so they cost no height ── */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {FILTERS.map((f) => {
            const on = active.includes(f.id)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  setActive((xs) => (xs.includes(f.id) ? xs.filter((x) => x !== f.id) : [...xs, f.id]))
                }
                aria-pressed={on}
                className={`min-h-[40px] whitespace-nowrap rounded-bk border px-4 py-2 text-sm font-medium transition-[transform,background-color,border-color] duration-150 hover:scale-[1.03] active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none ${
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
      </div>

      {/* ── sort + compare ────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-bk-ink">
          <span className="shrink-0 text-bk-muted">ຮຽງ:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="min-h-[40px] rounded-bk border border-bk-line bg-bk-surface px-3 py-2 text-sm font-semibold text-bk-ink"
          >
            <option value="rank">ອັນດັບແນະນຳ</option>
            <option value="rating">ຄະແນນສູງສຸດ</option>
            <option value="minDep">ຝາກຂັ້ນຕ່ຳນ້ອຍສຸດ</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            setCompareMode((v) => !v)
            if (compareMode) setPicked([])
          }}
          aria-pressed={compareMode}
          className={`inline-flex min-h-[40px] items-center gap-2 rounded-bk border px-4 py-2 text-sm font-semibold transition-[transform,background-color,border-color] duration-150 hover:scale-[1.03] active:scale-[0.97] motion-reduce:transform-none ${
            compareMode
              ? "border-bk-ink bg-bk-ink text-bk-page"
              : "border-bk-line bg-bk-surface text-bk-ink hover:border-bk-ink"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h7M4 17h7M17 4v7M17 13v7" />
            <path d="m14 7 3-3 3 3M8 17l3 3 3-3" />
          </svg>
          ທຽບ
        </button>
      </div>

      {/* ── list ──────────────────────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="mt-4 rounded-bk border border-bk-line px-6 py-14 text-center text-base text-bk-muted">
          ບໍ່ມີໂບຣກເກີທີ່ກົງກັບເງື່ອນໄຂ — ລອງປິດຕົວກັ່ນຕອງບາງອັນ
        </div>
      ) : (
        <ul className="m-0 mt-4 list-none divide-y divide-bk-line overflow-hidden rounded-bk border border-bk-line p-0">
          {rows.map((b) => (
            <BrokerRow
              key={b._id}
              broker={b}
              compareMode={compareMode}
              picked={picked.includes(b.slug?.current ?? "")}
              onToggle={() => togglePick(b.slug?.current ?? "")}
              disabled={picked.length >= MAX_COMPARE && !picked.includes(b.slug?.current ?? "")}
            />
          ))}
        </ul>
      )}

      <p className="mt-4 text-sm leading-relaxed text-bk-muted">
        ຊ່ອງທີ່ຂຽນວ່າ “ຍັງບໍ່ມີຂໍ້ມູນ” ແມ່ນພວກເຮົາຍັງບໍ່ທັນໄດ້ທົດສອບ — ບໍ່ໄດ້ເຕີມຕົວເລກທີ່ບໍ່ແນ່ໃຈ
      </p>

      {/* ── compare bar ───────────────────────────────────────────────── */}
      {compareMode && picked.length > 0 && (
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
  compareMode,
  picked,
  onToggle,
  disabled,
}: {
  broker: Broker
  compareMode: boolean
  picked: boolean
  onToggle: () => void
  disabled: boolean
}) {
  const slug = broker.slug?.current ?? ""
  const licenses = licensesOf(broker)
  const lao = laoDepositState(broker)
  const register = registerHref(broker)
  const logo = broker.logo?.asset?.url as string | undefined
  const rating = broker.rating ?? 0
  const top = broker.rank === 1

  const dep = minDepositLabel(broker)
  const spread = spreadLabel(broker)
  const regLabel = licenses
    .slice(0, 3)
    .map((l) => l.regulator)
    .join(" · ")
  const extra = licenses.length - Math.min(3, licenses.length)

  return (
    <li className={`relative ${picked ? "bg-bk-sunken" : top ? "bg-bk-sunken/60" : ""}`}>
      {/* The whole row is the link. It sits behind the content as a stretched
          overlay so the compare checkbox stays a real, separate control
          instead of an interactive element nested inside an anchor. */}
      <Link
        href={`/broker/${slug}`}
        aria-label={`ອ່ານລີວິວ ${broker.name}`}
        className="absolute inset-0 z-0"
      />

      {top && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-bk-ink" />}

      <div className="pointer-events-none relative flex items-center gap-3 py-3 pl-4 pr-3 sm:gap-3.5 sm:py-3.5 sm:pl-5 sm:pr-4 lg:gap-5 lg:py-4">
        <span
          className={`w-4 shrink-0 text-center font-mono text-[15px] font-bold ${
            top ? "text-bk-ink" : "text-bk-muted"
          }`}
        >
          {broker.rank ?? "—"}
        </span>

        {logo && (
          <Image
            src={logo}
            alt=""
            width={46}
            height={46}
            data-no-dim
            className="shrink-0 rounded-bk border border-bk-line object-cover"
            style={{ width: 46, height: 46 }}
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[16px] font-bold leading-snug tracking-[-0.02em] text-bk-ink">
              {broker.name}
            </span>
            {top && (
              <span className="shrink-0 whitespace-nowrap rounded-md border border-bk-ink px-1.5 py-px text-[10px] font-bold text-bk-ink">
                ອັນດັບ 1
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5">
            {licenses.slice(0, 3).map((l, i) => (
              <Flag key={`${l.regulator}-${i}`} src={l.flag} alt={l.country ?? ""} w={17} h={12} />
            ))}
            <span className="truncate text-xs text-bk-muted">
              {regLabel || "ຍັງບໍ່ໄດ້ບັນທຶກ"}
              {extra > 0 ? ` +${extra}` : ""}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-xs text-bk-muted">
            <span className="font-mono font-bold text-bk-ink">{dep ?? "—"}</span>
            <span>·</span>
            <span className="font-mono">{broker.maxLeverage ?? "—"}</span>
            <span>·</span>
            <span className={lao === "full" ? "font-semibold text-ok-ink dark:text-ok" : ""}>
              {LAO_DEPOSIT_SHORT[lao]}
            </span>
            {/* Spread only earns a slot once there is a tested number for it */}
            {spread && (
              <>
                <span className="hidden sm:inline">·</span>
                <span className="hidden font-mono sm:inline">{spread}</span>
              </>
            )}
          </div>
        </div>

        {/* Desktop gets the room for a direct CTA; a phone does not, and the
            review page is one tap away. */}
        {register && (
          <a
            href={register}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => {
              event({ action: "broker_click", category: "Broker", label: broker.name })
              trackClick({ target: brokerTarget(slug || broker.name), label: broker.name, group: "broker" })
            }}
            className={`${btnSolid} pointer-events-auto z-10 hidden shrink-0 px-5 text-sm lg:inline-flex`}
          >
            ເປີດບັນຊີ
            <ArrowIcon size={15} />
          </a>
        )}

        <span
          className="inline-flex min-w-[44px] shrink-0 items-center justify-center rounded-bk px-2.5 py-1.5 font-mono text-[15px] font-bold tracking-[-0.02em]"
          style={{ background: gradeColor(rating), color: gradeInk(rating) }}
        >
          {rating.toFixed(1)}
        </span>

        {compareMode ? (
          <label
            className={`pointer-events-auto z-10 inline-flex h-11 w-7 shrink-0 items-center justify-center ${
              disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
            }`}
          >
            <span className="sr-only">ເລືອກ {broker.name} ເພື່ອທຽບ</span>
            <input
              type="checkbox"
              checked={picked}
              disabled={disabled}
              onChange={onToggle}
              className="h-[18px] w-[18px] accent-accent"
            />
          </label>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 text-bk-muted lg:hidden"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        )}
      </div>
    </li>
  )
}
