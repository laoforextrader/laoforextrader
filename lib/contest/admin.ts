import { sanityWrite } from "@/lib/sanityWrite"
import { decryptPII } from "@/lib/pii"
import { codeOf, investorOf, type Contest } from "@/lib/contest/store"

// Admin-side reads of a contest round.
//
// This is the only place the sealed fields are opened, and only for someone
// the site has already checked is an admin. Nothing here is reachable from a
// public page: the leaderboard queries select their own columns.

export interface AdminEntry {
  _id: string
  entryNo?: number
  displayName: string
  mtLogin: string
  mtServer?: string
  country?: string
  status: string
  createdAt: string
  approvedAt?: string
  lastSeen?: string
  profit?: number
  equity?: number
  startBalance?: number
  symbol?: string
  isDemo?: boolean
  leverage?: number
  trades?: number
  openPositions?: number
  contactHash?: string
  ipHash?: string
  holderHash?: string
  /** Display names of other entries that share a signal with this one. */
  twins?: string[]
  flags?: Array<{ kind?: string; note?: string; at?: string }>
  /** Unsealed for the admin screen only. */
  email: string
  whatsapp: string
  entryCode: string
  investor: string
}

const open = (blob: string | undefined, fallback = "") => {
  if (!blob) return fallback
  try { return decryptPII(blob) } catch { return fallback }
}

/** Everyone in this round, newest registration first. */
export async function adminEntries(contestId: string): Promise<AdminEntry[]> {
  const rows = await sanityWrite.fetch<any[]>(
    `*[_type == "contestEntry" && contest._ref == $id] | order(_createdAt desc){
       _id, entryNo, displayName, mtLogin, mtServer, country, status,
       "createdAt": _createdAt, approvedAt, lastSeen, profit, equity, startBalance,
       symbol, isDemo, leverage, trades, openPositions,
       contactHash, ipHash, holderHash,
       flags, ownerEmailEnc, contactEnc, entryCodeEnc, investorEnc
     }`,
    { id: contestId }
  )
  const mapped = rows.map(r => ({
    ...r,
    email: open(r.ownerEmailEnc),
    whatsapp: open(r.contactEnc),
    entryCode: codeOf(r),
    investor: investorOf(r),
  }))

  // Same phone, same registration IP or same account holder as someone else
  // in this round. None of these is proof on its own — a family shares an
  // address, two people can share a phone in a village — so they are shown to
  // the owner rather than acted on. Two of them together rarely lie.
  for (const e of mapped) {
    const twins = new Set<string>()
    for (const other of mapped) {
      if (other._id === e._id) continue
      const same =
        (e.contactHash && other.contactHash === e.contactHash && "same WhatsApp") ||
        (e.holderHash && other.holderHash === e.holderHash && "same account holder") ||
        (e.ipHash && other.ipHash === e.ipHash && "same IP at signup")
      if (same) twins.add(`${other.displayName} (#${other.mtLogin}) — ${same}`)
    }
    e.twins = [...twins]
  }
  return mapped
}

/**
 * The WhatsApp message the owner sends after approving someone.
 *
 * Built here rather than typed each time: it carries the three things a
 * contestant needs and will otherwise ask for — that they are in, their entry
 * code, and where to watch — and it goes out in the language of the site the
 * contest is run in.
 */
export function waLink(e: AdminEntry, contest: Contest, base: string): string {
  const start = contest.startAt ? new Date(contest.startAt).toISOString().slice(0, 10) : ""
  const text = [
    `ສະບາຍດີ ${e.displayName} 👋`,
    ``,
    `✅ ບັນຊີ MT5 ${e.mtLogin} ຂອງທ່ານຜ່ານການກວດສອບແລ້ວ ແລະ ເຂົ້າຮ່ວມ "${contest.title}" ໄດ້`,
    ``,
    `🔑 ລະຫັດຜູ້ແຂ່ງຂອງທ່ານ: ${e.entryCode}`,
    `   (ໃສ່ໃນຊ່ອງ ContestCode ຂອງ EA)`,
    ``,
    `📅 ເລີ່ມແຂ່ງ: ${start}`,
    `📊 ເບິ່ງອັນດັບສົດ: ${base}/contest`,
    ``,
    `ຖ້າມີຄຳຖາມ ຕອບກັບຂໍ້ຄວາມນີ້ໄດ້ເລີຍ`,
  ].join("\n")
  return `https://wa.me/${e.whatsapp}?text=${encodeURIComponent(text)}`
}

/**
 * Is this entry ready to be approved?
 *
 * Every item is something the EA has already reported, so the screen can say
 * it instead of the owner having to remember it. The rule the owner set is
 * the first one: nothing is approved until the EA has actually connected,
 * because an entry that cannot report is an entry that cannot be scored.
 *
 * `blocking` is what should stop an approval; the rest is advice.
 */
export interface Readiness {
  label: string
  ok: boolean
  blocking: boolean
  detail?: string
}

export function readiness(e: AdminEntry, contest: Contest): Readiness[] {
  const seen = !!e.lastSeen
  const expected = contest.startBalance ?? 0
  const balOk = typeof e.startBalance === "number" && expected > 0 &&
    Math.abs(e.startBalance - expected) / expected <= 0.01
  const wantSymbol = (contest.symbol ?? "").toUpperCase()
  const gotSymbol = (e.symbol ?? "").toUpperCase()

  return [
    {
      label: "EA connected",
      ok: seen,
      blocking: true,
      detail: seen ? `last seen ${new Date(e.lastSeen!).toLocaleString()}` : "no heartbeat yet",
    },
    {
      label: "Demo account",
      ok: e.isDemo === true,
      blocking: true,
      detail: e.isDemo === false ? "LIVE account — not allowed" : undefined,
    },
    {
      label: `Starting balance ${expected.toLocaleString()}`,
      ok: balOk,
      blocking: true,
      detail: typeof e.startBalance === "number" ? e.startBalance.toLocaleString() : "unknown",
    },
    {
      label: `Symbol ${wantSymbol || "—"}`,
      ok: !wantSymbol || gotSymbol === wantSymbol,
      blocking: false,
      detail: gotSymbol || "unknown",
    },
    {
      label: "No open positions",
      ok: (e.openPositions ?? 0) === 0,
      blocking: false,
      detail: e.openPositions ? `${e.openPositions} open` : undefined,
    },
    {
      label: "No trades before the start",
      ok: (e.trades ?? 0) === 0,
      blocking: false,
      detail: e.trades ? `${e.trades} already closed` : undefined,
    },
  ]
}

/** Mark an entry approved. Idempotent. */
export async function approveEntry(entryId: string, by: string): Promise<void> {
  await sanityWrite
    .patch(entryId)
    .set({ status: "approved", approvedAt: new Date().toISOString(), approvedBy: by })
    .commit({ visibility: "sync" })
}

/** Take an entry out of the contest, with a reason kept for the record. */
export async function rejectEntry(entryId: string, by: string, note: string): Promise<void> {
  await sanityWrite
    .patch(entryId)
    .set({ status: "disqualified", adminNote: note, approvedBy: by })
    .commit({ visibility: "sync" })
}
