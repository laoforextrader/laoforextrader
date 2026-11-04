// Small shared pieces of the broker review surface.
//
// They are server components: nothing here needs state, and keeping them off
// the client bundle matters on the phones most Lao readers browse from.
//
// The design rule these all follow: a missing value is shown as a dashed
// "not recorded yet" slot, never hidden and never filled with a guess. A gap
// the reader can see is a reason to trust the numbers that are there.

import Image from "next/image"
import { gradeColor, type NormalisedLicense } from "@/lib/broker"

/* ── Missing value ───────────────────────────────────────────────────────── */

export function NotRecorded({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded-bk border border-dashed border-bk-dash px-2.5 py-1 text-[13px] text-bk-muted ${className}`}
    >
      ຍັງບໍ່ມີຂໍ້ມູນ
    </span>
  )
}

/* ── Flag ────────────────────────────────────────────────────────────────── */

export function Flag({
  src,
  alt,
  w = 18,
  h = 13,
}: {
  src: string | null
  alt: string
  w?: number
  h?: number
}) {
  if (!src) return null
  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      data-no-dim
      className="block shrink-0 rounded-[2px] object-cover"
      style={{ width: w, height: h }}
    />
  )
}

/* ── Licence chips ───────────────────────────────────────────────────────── */

/**
 * A chip per regulator. An Authorised Representative entry is drawn dashed:
 * being somebody else's representative is not the same as holding the licence,
 * and most sites blur that difference into a reassuring logo.
 */
export function LicenseChips({
  licenses,
  max,
  className = "",
}: {
  licenses: NormalisedLicense[]
  max?: number
  className?: string
}) {
  if (licenses.length === 0) {
    return <NotRecorded className={className} />
  }
  const shown = max ? licenses.slice(0, max) : licenses
  const extra = licenses.length - shown.length

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {shown.map((l, i) => (
        <span
          key={`${l.regulator}-${i}`}
          className={`inline-flex items-center gap-1.5 rounded-md border py-1 pl-1.5 pr-2 text-xs font-semibold text-bk-ink ${
            l.isRepresentative ? "border-dashed border-bk-dash" : "border-bk-line"
          }`}
          title={
            l.isRepresentative
              ? `${l.regulator} — ຜູ້ຕາງໜ້າທີ່ໄດ້ຮັບອະນຸຍາດ ບໍ່ແມ່ນຜູ້ຖືໃບ`
              : [l.regulator, l.country, l.licenseNo].filter(Boolean).join(" · ")
          }
        >
          <Flag src={l.flag} alt={l.country ?? ""} />
          {l.regulator}
        </span>
      ))}
      {extra > 0 && <span className="text-xs font-semibold text-bk-muted">+{extra}</span>}
    </div>
  )
}

/* ── Stars ───────────────────────────────────────────────────────────────── */

export function Stars({
  rating,
  size = 16,
  animate = false,
}: {
  rating: number
  size?: number
  animate?: boolean
}) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={rating >= i - 0.25 ? "var(--bk-ink)" : "var(--bk-line)"}
          className={animate ? "bk-pop" : undefined}
          style={animate ? { animationDelay: `${140 + i * 70}ms` } : undefined}
        >
          <path d="m12 2 3 6.5 7 .9-5 4.8 1.2 7L12 17.8 5.8 21.2 7 14.2 2 9.4l7-.9L12 2Z" />
        </svg>
      ))}
    </span>
  )
}

/* ── Score bars ──────────────────────────────────────────────────────────── */

/**
 * The review-distribution block from a ratings site, pointed at the five
 * categories this site actually has. There are no user reviews to distribute,
 * and borrowing the shape without the data would be a lie about volume.
 */
export function ScoreBars({
  rows,
  animate = true,
}: {
  rows: { label: string; value: number | undefined }[]
  animate?: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r, i) => {
        const v = r.value
        const pct = typeof v === "number" ? (v / 5) * 100 : 0
        return (
          <div
            key={r.label}
            className="grid grid-cols-[minmax(84px,112px)_minmax(0,1fr)_32px] items-center gap-3 sm:gap-4"
          >
            <span className="text-sm leading-normal text-bk-ink">{r.label}</span>
            <span className="block h-4 overflow-hidden rounded-[3px] bg-bk-track">
              {typeof v === "number" && (
                <span
                  className={animate ? "bk-bar block h-full rounded-[3px]" : "block h-full rounded-[3px]"}
                  style={
                    {
                      "--bk-w": `${pct}%`,
                      width: animate ? undefined : `${pct}%`,
                      background: gradeColor(v),
                      animationDelay: animate ? `${i * 70}ms` : undefined,
                    } as React.CSSProperties
                  }
                />
              )}
            </span>
            <span className="text-right font-mono text-[13px] text-bk-muted">
              {typeof v === "number" ? v.toFixed(1) : "—"}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-bk text-[15px] font-semibold no-underline " +
  "transition-[transform,background-color,border-color] duration-150 " +
  "hover:scale-[1.03] active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"

/** Minimum 48px tall everywhere: it is the thumb target on a phone. */
export const btnSolid = `${BTN_BASE} min-h-[48px] bg-bk-ink px-6 py-3 text-bk-page hover:bg-black dark:hover:bg-white`

export const btnOutline = `${BTN_BASE} min-h-[48px] border-2 border-bk-ink bg-bk-surface px-6 py-3 text-bk-ink hover:bg-bk-sunken`

export const btnQuiet = `${BTN_BASE} min-h-[44px] border border-bk-line bg-bk-surface px-4 py-2.5 text-bk-ink hover:bg-bk-sunken`

/* ── Meta pill ───────────────────────────────────────────────────────────── */

export function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-bk border border-bk-line px-3.5 py-2 text-sm leading-tight text-bk-ink">
      {children}
    </span>
  )
}

export function CheckIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5L15.5 10" />
    </svg>
  )
}

export function CrossIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  )
}

export function ArrowIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
