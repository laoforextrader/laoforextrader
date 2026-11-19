"use client"

import { useState } from "react"
import type { AdminEntry, Readiness } from "@/lib/contest/admin"
import { CANCEL_REASONS, BLOCK_REASONS, reasonText, type Reason } from "@/lib/contest/reasons"

// One contestant in the admin list.
//
// The order of the controls follows the order of the work: look at the
// account with the investor password, approve, then message them.
//
// Three ways out, and they are not the same thing:
//
//   Cancel      — the form was filled in wrong. The entry leaves the round,
//                 the seat, the phone number and the MT5 login are released,
//                 and the person registers again with corrected details. The
//                 WhatsApp message says exactly what to fix.
//   Disqualify  — out of the round, seat spent, no way back in this round.
//   Block       — never again, in any round. Confirmed twice, because it is
//                 the only one of the three aimed at the person rather than
//                 the entry.

type Action = "approve" | "reject" | "cancel" | "block" | "remind"

/** The reason picker that Cancel and Block share. */
function ReasonPicker({
  list, pick, setPick, typed, setTyped,
}: {
  list: Reason[]
  pick: string
  setPick: (v: string) => void
  typed: string
  setTyped: (v: string) => void
}) {
  const chosen = list.find(r => r.id === pick)
  return (
    <div className="mt-2 flex flex-col gap-2 rounded-bk border border-bk-line bg-bk-sunken p-2.5">
      <div className="flex flex-wrap gap-1.5">
        {list.map(r => (
          <button
            key={r.id} type="button" onClick={() => setPick(r.id)}
            className={`rounded-bk border px-2 py-1 text-[11.5px] font-semibold ${
              pick === r.id ? "border-accent text-accent" : "border-bk-line text-bk-muted"
            }`}>
            {r.en}
          </button>
        ))}
      </div>
      {/* Lao is what the contestant reads, so it is shown here before it is
          sent: the owner should see the sentence, not just its English label. */}
      {chosen?.lo && <p className="m-0 text-[12px] text-bk-muted">{chosen.lo}</p>}
      <input
        value={typed} onChange={e => setTyped(e.target.value)}
        placeholder="รายละเอียดเพิ่ม (ไม่บังคับ) — ข้อความนี้จะถูกส่งให้ผู้สมัครด้วย"
        className="w-full rounded-bk border border-bk-line bg-bk-surface px-2.5 py-2 text-[12.5px] outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  )
}

export default function AdminEntryRow({
  e, waWelcome, waApproved, waCancelled, waRemind, earlyBird, checks, blocked,
}: {
  e: AdminEntry
  /** Code and install link — ready the moment they register. */
  waWelcome: string
  /** Sent once the account has been checked. */
  waApproved: string
  /** Carries `__REASON__` where the chosen reason goes. */
  waCancelled: string
  /** Days to the start, plus what to fix when the EA has never reported. */
  waRemind: string
  earlyBird: boolean
  checks: Readiness[]
  /** This person is already on the block list. */
  blocked: boolean
}) {
  const [status, setStatus] = useState(e.status)
  const [busy, setBusy] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [isBlocked, setIsBlocked] = useState(blocked)
  const [reminded, setReminded] = useState<string | null>(e.remindedAt ?? null)

  /** Which reason panel is open, if any. */
  const [panel, setPanel] = useState<"cancel" | "block" | null>(null)
  const [pick, setPick] = useState("")
  const [typed, setTyped] = useState("")
  /** Stored, sent and shown — one string in all three places. */
  const [sentReason, setSentReason] = useState(e.cancelReason ?? "")

  const list = panel === "block" ? BLOCK_REASONS : CANCEL_REASONS
  const reason = reasonText(list, pick, typed)

  async function send(action: Action, note?: string) {
    setBusy(true); setErr(null)
    try {
      const r = await fetch("/api/contest/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e._id, action, note }),
      })
      const j = await r.json()
      if (!r.ok) { setErr(j.error ?? "failed"); return false }
      if (j.status) setStatus(j.status)
      if (j.blocked) setIsBlocked(true)
      return true
    } catch {
      setErr("network error")
      return false
    } finally {
      setBusy(false)
    }
  }

  const tone =
    status === "approved" ? "text-ok" :
    status === "disqualified" ? "text-bad" :
    status === "cancelled" ? "text-bk-muted" :
    status === "flagged" || status === "blown" ? "text-warn" : "text-bk-muted"

  //  Approval is gated on the checks the EA can answer, not on memory. The
  //  blocking ones are the owner's own rule: nothing is approved until the
  //  EA has connected and the account is a demo funded correctly.
  const blockers = checks.filter(c => c.blocking && !c.ok)
  const warnings = checks.filter(c => !c.blocking && !c.ok)
  const done = status === "cancelled" || status === "disqualified"

  return (
    <div className={`rounded-bk border bg-bk-surface p-3 ${
      done ? "border-dashed border-bk-line opacity-70" : "border-bk-line"
    }`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11px] text-bk-muted">#{e.entryNo ?? "—"}</span>
          {earlyBird && (
            <span className="rounded-bk border border-gold-line bg-gold-soft px-1.5 py-0.5 text-[10px] font-bold text-gold-ink">
              VPS
            </span>
          )}
          <span className="text-[14px] font-bold">{e.displayName}</span>
          <span className="font-mono text-[12px] text-bk-muted">{e.mtLogin}</span>
          {e.country && <span className="text-[11.5px] text-bk-muted">· {e.country}</span>}
        </div>
        <span className={`text-[11.5px] font-bold uppercase ${isBlocked ? "text-bad" : tone}`}>
          {isBlocked ? "blocked" : status}
        </span>
      </div>

      <div className="mt-2 grid gap-x-4 gap-y-1 text-[12px] sm:grid-cols-2">
        <span className="text-bk-muted">WhatsApp: <span className="font-mono text-bk-ink">+{e.whatsapp}</span></span>
        <span className="text-bk-muted">Server: <span className="font-mono text-bk-ink">{e.mtServer || "—"}</span></span>
        <span className="text-bk-muted">Email: <span className="text-bk-ink">{e.email || "—"}</span></span>
        <span className="text-bk-muted">Leverage: <span className="font-mono text-bk-ink">{e.leverage ? "1:" + e.leverage : "—"}</span></span>
      </div>

      {/* The checklist, straight from what the EA reported. */}
      <ul className="mt-2 grid gap-x-4 gap-y-0.5 text-[12px] sm:grid-cols-2">
        {checks.map(c => (
          <li key={c.label} className={c.ok ? "text-ok" : c.blocking ? "text-bad" : "text-warn"}>
            {c.ok ? "✓" : c.blocking ? "✗" : "!"} {c.label}
            {c.detail && <span className="text-bk-muted"> · {c.detail}</span>}
          </li>
        ))}
      </ul>

      {!!e.twins?.length && (
        <ul className="mt-2 flex flex-col gap-0.5">
          {e.twins.map(t => (
            <li key={t} className="text-[11.5px] font-semibold text-warn">👥 {t}</li>
          ))}
        </ul>
      )}

      {!!e.flags?.length && (
        <ul className="mt-2 flex flex-col gap-0.5">
          {e.flags.map((f, i) => (
            <li key={i} className="text-[11.5px] text-warn">🚩 {f.kind}: {f.note}</li>
          ))}
        </ul>
      )}

      {status === "cancelled" && sentReason && (
        <p className="mt-2 rounded-bk bg-bk-sunken px-2.5 py-1.5 text-[11.5px] text-bk-muted">
          ↩ ยกเลิก: {sentReason} · สมัครใหม่ด้วยอีเมลและเบอร์เดิมได้
        </p>
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

      {/* Step one, always available: the code and the install link. Nothing
          can happen before this goes out, which is why it is not gated on
          approval any more. */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <a href={waWelcome} target="_blank" rel="noopener noreferrer"
          className="rounded-bk border border-bk-line bg-bk-sunken px-3 py-1.5 text-[12px] font-semibold text-bk-ink">
          WhatsApp: {earlyBird ? "code + VPS" : "send code"} →
        </a>

        {/* The chase. Opening WhatsApp has to stay inside the click the owner
            made — a popup opened after an await is blocked — so this is an
            anchor, and the "sent" mark is a fire-and-forget POST beside it. */}
        {!done && (
          <a
            href={waRemind} target="_blank" rel="noopener noreferrer"
            onClick={() => { setReminded(new Date().toISOString()); void send("remind") }}
            className={`rounded-bk border px-3 py-1.5 text-[12px] font-semibold ${
              e.lastSeen ? "border-bk-line bg-bk-sunken text-bk-ink" : "border-warn-line bg-warn-soft text-warn-ink"
            }`}>
            {e.lastSeen ? "WhatsApp: countdown →" : "WhatsApp: connect your EA →"}
          </a>
        )}
        {reminded && (
          <span className="text-[11px] text-bk-muted">
            reminded {new Date(reminded).toLocaleDateString()}
            {e.remindCount ? ` · ${e.remindCount}×` : ""}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {status !== "approved" && !done && (
          <button
            onClick={() => {
              if (blockers.length && !confirm(
                "Not ready:\n" + blockers.map(b => "· " + b.label + (b.detail ? " (" + b.detail + ")" : "")).join("\n") +
                "\n\nApprove anyway?"
              )) return
              if (!blockers.length && warnings.length && !confirm(
                "Worth a look:\n" + warnings.map(w => "· " + w.label + (w.detail ? " (" + w.detail + ")" : "")).join("\n") +
                "\n\nApprove?"
              )) return
              send("approve")
            }}
            disabled={busy}
            className={`rounded-bk px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-40 ${
              blockers.length ? "bg-bk-muted" : "bg-accent"
            }`}>
            {blockers.length ? `Approve (${blockers.length} not ready)` : "Approve"}
          </button>
        )}
        {/* Step two: the result. Only once the account has been checked —
            telling someone they are in before looking at their account is
            how a wrongly funded one ends up on the board. */}
        <a
          href={status === "approved" ? waApproved : undefined}
          target="_blank" rel="noopener noreferrer"
          aria-disabled={status !== "approved"}
          className={`rounded-bk px-3 py-1.5 text-[12px] font-bold ${
            status === "approved"
              ? "bg-ok text-white"
              : "pointer-events-none bg-bk-sunken text-bk-muted"
          }`}>
          WhatsApp: result →
        </a>

        {!done && (
          <button
            onClick={() => { setPanel(panel === "cancel" ? null : "cancel"); setPick(""); setTyped("") }}
            disabled={busy}
            className="rounded-bk border border-bk-line px-3 py-1.5 text-[12px] font-semibold text-bk-ink disabled:opacity-40">
            Cancel entry…
          </button>
        )}
        {!done && (
          <button onClick={() => {
            if (!confirm(`Disqualify ${e.displayName} (#${e.mtLogin})?\n\nThe seat is spent — they cannot register again this round.`)) return
            send("reject")
          }} disabled={busy}
            className="rounded-bk border border-bad-line px-3 py-1.5 text-[12px] font-semibold text-bad disabled:opacity-40">
            Disqualify
          </button>
        )}
        {!isBlocked ? (
          <button
            onClick={() => { setPanel(panel === "block" ? null : "block"); setPick(""); setTyped("") }}
            disabled={busy}
            className="rounded-bk border border-bad-line bg-bad-soft px-3 py-1.5 text-[12px] font-bold text-bad disabled:opacity-40">
            Block…
          </button>
        ) : (
          <span className="rounded-bk bg-bad-soft px-2.5 py-1.5 text-[11.5px] font-bold text-bad">
            ⛔ blocked — lift it in the block list below
          </span>
        )}
        {err && <span className="text-[11.5px] font-semibold text-bad">{err}</span>}
      </div>

      {panel && (
        <>
          <ReasonPicker list={list} pick={pick} setPick={setPick} typed={typed} setTyped={setTyped} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {panel === "cancel" ? (
              <button
                disabled={busy || reason.length < 2}
                onClick={async () => {
                  if (await send("cancel", reason)) { setSentReason(reason); setPanel(null) }
                }}
                className="rounded-bk bg-warn px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-40">
                Cancel this entry
              </button>
            ) : (
              <button
                disabled={busy || reason.length < 2}
                onClick={async () => {
                  if (!confirm(
                    `Block ${e.displayName} (#${e.mtLogin}) for good?\n\n${reason}\n\n` +
                    "They cannot register for this round or any later one."
                  )) return
                  if (await send("block", reason)) setPanel(null)
                }}
                className="rounded-bk bg-bad px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-40">
                Block this person for good
              </button>
            )}
            <button onClick={() => setPanel(null)} className="text-[12px] font-semibold text-bk-muted">
              back
            </button>
            {reason.length < 2 && <span className="text-[11.5px] text-bk-muted">เลือกเหตุผลก่อน</span>}
          </div>
        </>
      )}

      {/* Offered after the entry is cancelled, not before: the message tells
          them what to fix, and it must say the same thing as the record. */}
      {status === "cancelled" && sentReason && (
        <div className="mt-2">
          <a
            href={waCancelled.replace("__REASON__", encodeURIComponent(sentReason))}
            target="_blank" rel="noopener noreferrer"
            className="inline-block rounded-bk bg-warn px-3 py-1.5 text-[12px] font-bold text-white">
            WhatsApp: tell them what to fix →
          </a>
        </div>
      )}
    </div>
  )
}
