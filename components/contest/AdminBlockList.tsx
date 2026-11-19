"use client"

import { useState } from "react"
import type { BlockRow } from "@/lib/contest/admin"

// The block list, and the only way to undo a block.
//
// It is shown on the same screen as the entries on purpose: a block is the
// one verdict here that outlives the round, so it should not be something the
// owner has to open the Studio to see — or to find out they made in anger
// three rounds ago.
//
// Lifting a block does not bring the entry back. It only means the person may
// register again.

export default function AdminBlockList({ rows }: { rows: BlockRow[] }) {
  const [gone, setGone] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<string | null>(null)

  if (!rows.length) {
    return (
      <p className="rounded-bk border border-dashed border-bk-line bg-bk-sunken p-3 text-[12.5px] text-bk-muted">
        Nobody is blocked.
      </p>
    )
  }

  async function lift(id: string, who: string) {
    if (!confirm(`Let ${who} register again?`)) return
    setBusy(id)
    try {
      const r = await fetch("/api/contest/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "unblock" }),
      })
      if (r.ok) setGone(g => ({ ...g, [id]: true }))
    } catch { /* the row stays; pressing again is safe */ }
    finally { setBusy(null) }
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map(b => (
        <div key={b._id}
          className={`flex flex-wrap items-center justify-between gap-2 rounded-bk border border-bad-line px-3 py-2 ${
            gone[b._id] ? "opacity-40" : "bg-bad-soft"
          }`}>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold">
              ⛔ {b.displayName ?? "—"}{" "}
              <span className="font-mono text-[11.5px] font-normal text-bk-muted">#{b.mtLogin ?? "—"}</span>
            </span>
            <span className="text-[11.5px] text-bk-muted">
              {b.reason ?? "—"}
              {b.at && ` · ${new Date(b.at).toLocaleDateString()}`}
              {b.by && ` · ${b.by}`}
            </span>
          </div>
          <button
            onClick={() => lift(b._id, b.displayName ?? b.mtLogin ?? "them")}
            disabled={busy === b._id || gone[b._id]}
            className="rounded-bk border border-bk-line bg-bk-surface px-3 py-1.5 text-[12px] font-semibold disabled:opacity-40">
            {gone[b._id] ? "lifted" : "Lift block"}
          </button>
        </div>
      ))}
    </div>
  )
}
