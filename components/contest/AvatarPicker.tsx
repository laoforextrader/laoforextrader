"use client"

import { AVATARS, ContestAvatar, resolveAvatar } from "@/components/contest/avatars"

// Choose the mark that stands beside your name on the board.
//
// Optional by design: leaving it alone is normal, and the board derives one
// from the MT5 login instead — spread so that no two contestants end up with
// the same animal. The picker exists because people like choosing, and
// because "that fox is me" is how someone finds their own row on a phone.

export default function AvatarPicker({
  value, onChange, seed, label, hint,
}: {
  value: string
  onChange: (id: string) => void
  /** What the automatic pick is derived from — the MT5 login, once typed. */
  seed: string
  label: string
  hint: string
}) {
  const auto = resolveAvatar(undefined, seed || "x")

  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-baseline justify-between text-[12px] text-bk-muted">
        {label}
        {!value && (
          <span className="flex items-center gap-1.5 text-[11px]">
            auto <ContestAvatar def={auto} size={18} />
          </span>
        )}
      </span>
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12">
        {AVATARS.map(a => (
          <button
            key={a.id} type="button"
            onClick={() => onChange(value === a.id ? "" : a.id)}
            title={a.label}
            aria-label={a.label}
            aria-pressed={value === a.id}
            className={`rounded-bk p-0.5 ${
              value === a.id ? "ring-2 ring-accent" : "opacity-80 hover:opacity-100"
            }`}
          >
            <ContestAvatar def={a} size={30} className="block h-auto w-full" />
          </button>
        ))}
      </div>
      <span className="text-[11px] leading-relaxed text-bk-muted">{hint}</span>
    </div>
  )
}
