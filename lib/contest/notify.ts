import { sanityWrite } from "@/lib/sanityWrite"
import { sendAdminTelegram, escapeHtml } from "@/lib/alertAdmin"
import { readiness, type AdminEntry } from "@/lib/contest/admin"
import type { Contest } from "@/lib/contest/store"
import type { EaPayload } from "@/lib/contest/ea"

// Telegram to the owner the first time a contestant's EA reports in.
//
// Registration already sends one message, and it ends with "approve once the
// EA connects" — but nothing told the owner that it had. The approval screen
// had to be opened on a hunch. This closes that loop: one message per entry,
// the first time it is seen, carrying the same six checks the approval screen
// runs so the owner can tell from the phone whether it is a straight approve
// or something to look at.
//
// Sent once, never repeated: `firstSeen` on the entry is what the heartbeat
// route gates this on, and it is written in the same patch as the beat.

/**
 * The checks are run against the payload in hand, not a re-read of the entry.
 *
 * applyHeartbeat commits with `visibility: "async"`, so a read straight after
 * it can still return the document as it was before the beat — the message
 * would then say "no heartbeat yet" about the very beat that triggered it.
 */
function entryFromBeat(p: EaPayload, login: string, row: EntryRow): AdminEntry {
  return {
    _id: row._id,
    entryNo: row.entryNo,
    displayName: row.displayName ?? "—",
    mtLogin: login,
    mtServer: p.acct?.server ?? row.mtServer,
    status: row.status,
    createdAt: row.createdAt,
    lastSeen: new Date().toISOString(),
    startBalance: p.contest?.startBalance ?? 0,
    symbol: p.acct?.symbol,
    isDemo: p.acct?.demo,
    leverage: p.acct?.leverage,
    trades: p.contest?.trades ?? 0,
    openPositions: p.positions?.count ?? 0,
    equity: p.money?.equity,
    // Sealed fields: this path never opens them, and the message never
    // carries them. The registration message already gave the owner the
    // contact details, and this one only has to say "they are connected".
    email: "",
    whatsapp: "",
    entryCode: "",
    investor: "",
  }
}

interface EntryRow {
  _id: string
  entryNo?: number
  displayName?: string
  mtServer?: string
  status: string
  createdAt: string
}

export async function notifyEaConnected(
  contest: Contest,
  entryId: string,
  login: string,
  payload: EaPayload,
): Promise<number | null> {
  const row = await sanityWrite.fetch<EntryRow | null>(
    `*[_type == "contestEntry" && _id == $id][0]{
       _id, entryNo, displayName, mtServer, status, "createdAt": _createdAt
     }`,
    { id: entryId },
  )
  if (!row) return null

  const checks = readiness(entryFromBeat(payload, login, row), contest)
  // "EA connected" is the headline of the message; repeating it in the list
  // below would be noise.
  const rest = checks.filter(c => c.label !== "EA connected")
  const blocking = rest.filter(c => !c.ok && c.blocking).length
  const soft = rest.filter(c => !c.ok && !c.blocking).length

  const head =
    blocking > 0 ? "⛔ <b>EA connected — needs a look</b>" :
    soft > 0     ? "⚠️ <b>EA connected — one thing to check</b>" :
                   "✅ <b>EA connected — ready to approve</b>"

  const lines = rest.map(c => {
    const mark = c.ok ? "✅" : c.blocking ? "⛔" : "⚠️"
    const detail = !c.ok && c.detail ? ` — ${escapeHtml(c.detail)}` : ""
    return `${mark} ${escapeHtml(c.label)}${detail}`
  })

  const base = process.env.PUBLIC_BASE_URL ?? "https://www.laoforextrader.com"
  const who = `#${row.entryNo ?? "-"} ${escapeHtml(row.displayName ?? "—")}`
  const where = escapeHtml(payload.acct?.server ?? row.mtServer ?? "—")

  const id = await sendAdminTelegram(
    `${head}\n` +
    `${who} · MT5 <code>${escapeHtml(login)}</code> · ${where}\n\n` +
    `${lines.join("\n")}\n\n` +
    (row.status === "pending"
      ? `\u{1f449} <a href="${base}/admin/contest">approve this entry</a>`
      : `status: ${escapeHtml(row.status)} · <a href="${base}/admin/contest">admin</a>`)
  )
  // Worth a line in the function log: this notice is the only thing telling
  // the owner that someone is waiting, and it is sent exactly once per entry.
  // A silent failure here leaves an entry pending with nobody aware of it.
  if (id === null) console.warn(`[contest] EA-connected notice not delivered for MT5 ${login}`)
  return id
}
