"use client"

import { useState } from "react"
import type { AdminEntry } from "@/lib/contest/admin"

// One contestant in the admin list.
//
// The order of the controls follows the order of the work: look at the
// account with the investor password, approve, then message them. The
// WhatsApp link only lights up once the entry is approved, because sending
// someone their entry code before their account has been checked is how a
// wrongly-funded account ends up on the board.

export default function AdminEntryRow({
  e, waHref, startBalance,
}: {
  e: AdminEntry
  waHref: string
  startBalance?: number
}) {
  const [status, setStatus] = useState(e.status)
  const [busy, setBusy] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function send(action: "approve" | "reject") {
    if (action === "reject" && !confirm(`Disqualify ${e.displayName} (#${e.mtLogin})?`)) return
    setBusy(true); setErr(null)
    try {
      const r = await fetch("/api/contest/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e._id, action }),
      })
      const j = await r.json()
      if (!r.ok) { setErr(j.error ?? "failed"); return }
      setStatus(j.status)
    } catch {
      setErr("network error")
    } finally {
      setBusy(false)
    }
  }

  const tone =
    status === "approved" ? "text-ok" :
    status === "disqualified" ? "text-bad" :
    status === "flagged" || status === "blown" ? "text-warn" : "text-bk-muted"

  const balanceOff =
    typeof startBalance === "number" && typeof e.startBalance === "number" &&
    e.startBalance > 0 && Math.abs(e.startBalance - startBalance) / startBalance > 0.01

  return (
    <div className="rounded-bk border border-bk-line bg-bk-surface p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11px] text-bk-muted">#{e.entryNo ?? "—"}</span>
          <span className="text-[14px] font-bold">{e.displayName}</span>
          <span className="font-mono text-[12px] text-bk-muted">{e.mtLogin}</span>
          {e.country && <span className="text-[11.5px] text-bk-muted">· {e.country}</span>}
        </div>
        <span className={`text-[11.5px] font-bold uppercase ${tone}`}>{status}</span>
      </div>

      <div className="mt-2 grid gap-x-4 gap-y-1 text-[12px] sm:grid-cols-2">
        <span className="text-bk-muted">WhatsApp: <span className="font-mono text-bk-ink">+{e.whatsapp}</span></span>
        <span className="text-bk-muted">Server: <span className="font-mono text-bk-ink">{e.mtServer || "—"}</span></span>
        <span className="text-bk-muted">Email: <span className="text-bk-ink">{e.email || "—"}</span></span>
        <span className="text-bk-muted">
          Start balance:{" "}
          <span className={`font-mono ${balanceOff ? "font-bold text-bad" : "text-bk-ink"}`}>
            {typeof e.startBalance === "number" ? e.startBalance.toLocaleString() : "not seen yet"}
          </span>
        </span>
      </div>

      {!!e.flags?.length && (
        <ul className="mt-2 flex flex-col gap-0.5">
          {e.flags.map((f, i) => (
            <li key={i} className="text-[11.5px] text-warn">🚩 {f.kind}: {f.note}</li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button onClick={() => setShowSecret(!showSecret)}
          className="rounded-bk border border-bk-line bg-bk-sunken px-2.5 py-1.5 text-[11.5px] font-semibold">
          {showSecret ? "hide" : "investor password"}
        </button>
        {showSecret && (
          <span className="rounded-bk bg-bk-sunken px-2 py-1 font-mono text-[12px]">
            {e.investor || "—"} <span className="text-bk-muted">· code {e.entryCode || "—"}</span>
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {status !== "approved" && status !== "disqualified" && (
          <button onClick={() => send("approve")} disabled={busy}
            className="rounded-bk bg-accent px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-40">
            Approve
          </button>
        )}
        <a
          href={status === "approved" ? waHref : undefined}
          target="_blank" rel="noopener noreferrer"
          aria-disabled={status !== "approved"}
          className={`rounded-bk px-3 py-1.5 text-[12px] font-bold ${
            status === "approved"
              ? "bg-ok text-white"
              : "pointer-events-none bg-bk-sunken text-bk-muted"
          }`}>
          WhatsApp →
        </a>
        {status !== "disqualified" && (
          <button onClick={() => send("reject")} disabled={busy}
            className="rounded-bk border border-bad-line px-3 py-1.5 text-[12px] font-semibold text-bad disabled:opacity-40">
            Disqualify
          </button>
        )}
        {err && <span className="text-[11.5px] font-semibold text-bad">{err}</span>}
      </div>
    </div>
  )
}
