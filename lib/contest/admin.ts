import { sanityWrite } from "@/lib/sanityWrite"
import { decryptPII } from "@/lib/pii"
import { codeOf, investorOf, type Contest } from "@/lib/contest/store"
import { waRepair } from "@/lib/contest/phone"

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
  cancelReason?: string
  cancelledAt?: string
  remindedAt?: string
  remindCount?: number
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
       cancelReason, cancelledAt, remindedAt, remindCount,
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
// Entries registered before lib/contest/phone existed hold whatever the old
// form built, which could carry the 20 prefix twice. Repaired on the way out
// so the owner's button works on every entry, old and new, without having to
// rewrite what is stored.
const wa = (number: string, lines: string[]) =>
  `https://wa.me/${waRepair(number)}?text=${encodeURIComponent(lines.join("\n"))}`

/**
 * Message one, sent as soon as somebody registers.
 *
 * Carries the entry code and the install link, because that is what they
 * need before anything else can happen — and the VPS line when they are one
 * of the first few, since that is decided by registration order and nothing
 * else.
 */
export function waLinkWelcome(e: AdminEntry, contest: Contest, base: string, earlyBird: boolean): string {
  const start = contest.startAt ? new Date(contest.startAt).toISOString().slice(0, 10) : ""
  return wa(e.whatsapp, [
    `ສະບາຍດີ ${e.displayName} 👋`,
    ``,
    `ໄດ້ຮັບໃບສະໝັກ "${contest.title}" ຂອງທ່ານແລ້ວ`,
    ``,
    `🔑 ລະຫັດຜູ້ແຂ່ງ: ${e.entryCode}`,
    `   (ໃສ່ໃນຊ່ອງ ContestCode ຂອງ EA)`,
    ``,
    ...(earlyBird ? [`🎁 ທ່ານຢູ່ໃນກຸ່ມທຳອິດ ຈຶ່ງໄດ້ VPS ຟຣີ — ຈະສົ່ງລາຍລະອຽດໃຫ້ທາງນີ້`, ``] : []),
    `📥 ວິທີຕິດຕັ້ງ EA: ${base}/contest/install`,
    `🔖 ເປີດເບິ່ງລະຫັດຄືນໄດ້ທຸກເວລາ: ${base}/contest/me`,
    ``,
    `ຕິດຕັ້ງແລ້ວບອກມາ ຫຼື ລໍໃຫ້ລະບົບເຫັນ EA ຂອງທ່ານ`,
    `ພວກເຮົາຈະກວດບັນຊີ ແລ້ວແຈ້ງຜົນອະນຸມັດກັບມາ`,
    ``,
    `📅 ເລີ່ມແຂ່ງ: ${start}`,
  ])
}

/** Message two, after the account has been checked and approved. */
export function waLinkApproved(e: AdminEntry, contest: Contest, base: string): string {
  const start = contest.startAt ? new Date(contest.startAt).toISOString().slice(0, 10) : ""
  return wa(e.whatsapp, [
    `ສະບາຍດີ ${e.displayName} 👋`,
    ``,
    `✅ ບັນຊີ MT5 ${e.mtLogin} ຜ່ານການກວດສອບແລ້ວ — ທ່ານເຂົ້າຮ່ວມ "${contest.title}" ຢ່າງເປັນທາງການ`,
    ``,
    `📅 ເລີ່ມແຂ່ງ: ${start}`,
    `📊 ເບິ່ງອັນດັບສົດ: ${base}/contest`,
    ``,
    `ເປີດ EA ໄວ້ຕໍ່ເນື່ອງຈົນຈົບການແຂ່ງຂັນ`,
    `ຖ້າມີຄຳຖາມ ຕອບກັບຂໍ້ຄວາມນີ້ໄດ້ເລີຍ`,
  ])
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
/** True when this entry is inside the round's early-bird window. */
export const isEarlyBird = (e: AdminEntry, contest: Contest) =>
  !!e.entryNo && e.entryNo <= (contest.earlyBirdCount ?? 0)

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

// ─────────────────────────────────────────────────────────────────────────────
// Cancelling, chasing and blocking.
//
// Three different things, deliberately not one control:
//
//   cancel  — the entry was filled in wrong (MT5 number, server, password).
//             It leaves the round, the person is told why, and they may
//             register again with the same email and phone. Nobody is accused
//             of anything.
//   reject  — disqualified. The entry stays in the way: the seat is spent.
//   block   — this person may never register again, in this round or a later
//             one. A separate document, because it outlives the round.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Take an entry out of the round without holding it against the person.
 *
 * The seat and the email, phone and MT5 login are all released — the
 * duplicate checks in registerEntry skip cancelled entries — so the same
 * person can fill the form in again with corrected details.
 */
export async function cancelEntry(entryId: string, by: string, reason: string): Promise<void> {
  await sanityWrite
    .patch(entryId)
    .set({
      status: "cancelled",
      cancelReason: reason.slice(0, 300),
      cancelledAt: new Date().toISOString(),
      approvedBy: by,
    })
    .commit({ visibility: "sync" })
}

/** Record that the "connect your EA" reminder went out to this entry. */
export async function markReminded(entryId: string): Promise<void> {
  await sanityWrite
    .patch(entryId)
    .setIfMissing({ remindCount: 0 })
    .inc({ remindCount: 1 })
    .set({ remindedAt: new Date().toISOString() })
    .commit({ visibility: "sync" })
}

export interface BlockRow {
  _id: string
  displayName?: string
  mtLogin?: string
  reason?: string
  at?: string
  by?: string
}

/**
 * Block the person behind an entry, for good.
 *
 * Their entry is disqualified at the same time, because a block that left
 * them on the board would be a block in name only. What is written to the
 * block list is three one-way indexes — never the phone number or the
 * address — plus the name and login that the board shows anyway.
 */
export async function blockEntry(entryId: string, by: string, reason: string): Promise<void> {
  const e = await sanityWrite.fetch<any>(
    `*[_type == "contestEntry" && _id == $id][0]{
       _id, displayName, mtLogin, contactHash, ownerEmailHash, ipHash
     }`,
    { id: entryId },
  )
  if (!e) throw new Error("entry not found")

  await sanityWrite.create({
    _type: "contestBlock",
    displayName: e.displayName,
    mtLogin: e.mtLogin,
    contactHash: e.contactHash,
    ownerEmailHash: e.ownerEmailHash,
    ipHash: e.ipHash,
    reason: reason.slice(0, 300),
    by,
    at: new Date().toISOString(),
    entry: { _type: "reference", _ref: entryId },
  } as any)

  await sanityWrite
    .patch(entryId)
    .set({ status: "disqualified", adminNote: `blocked: ${reason}`.slice(0, 300), approvedBy: by })
    .commit({ visibility: "sync" })
}

/** Everyone on the block list, newest first. */
export async function blockList(): Promise<BlockRow[]> {
  return sanityWrite.fetch<BlockRow[]>(
    `*[_type == "contestBlock"] | order(at desc){ _id, displayName, mtLogin, reason, at, by }`
  )
}

/** Lift a block. The entry it came from stays disqualified. */
export async function unblock(blockId: string): Promise<void> {
  await sanityWrite.delete(blockId)
}

/** True when a block already covers this entry — the button says so. */
export async function blockedLogins(): Promise<Set<string>> {
  const rows = await sanityWrite.fetch<Array<{ mtLogin?: string }>>(
    `*[_type == "contestBlock"]{ mtLogin }`
  )
  return new Set(rows.map(r => r.mtLogin ?? "").filter(Boolean))
}

/**
 * Message three: the entry was filled in wrong and has been cancelled.
 *
 * It has to carry the reason and the way back in, or it reads as a rejection.
 * Registering again is possible with the same email and the same number —
 * that is what cancelling means, and the message says so plainly.
 */
export function waLinkCancelled(e: AdminEntry, contest: Contest, base: string, reasons: string[]): string {
  return wa(e.whatsapp, [
    `ສະບາຍດີ ${e.displayName} \u{1f44b}`,
    ``,
    `ໃບສະໝັກ "${contest.title}" ຂອງທ່ານຖືກຍົກເລີກກ່ອນ ເພາະຂໍ້ມູນຍັງບໍ່ຖືກຕ້ອງ`,
    ``,
    `❌ ສິ່ງທີ່ຕ້ອງແກ້:`,
    ...reasons.map(r => `• ${r}`),
    ``,
    `\u{1f504} ທ່ານ *ສະໝັກໃໝ່ໄດ້ເລີຍ* ດ້ວຍອີເມວ ແລະ ເບີເກົ່າ ບໍ່ຕ້ອງລໍໃໝ່`,
    `   ${base}/contest/register`,
    ``,
    `ຂໍໃຫ້ກວດຂໍ້ມູນເຫຼົ່ານີ້ໃຫ້ຖືກກ່ອນສົ່ງ:`,
    `• ເລກບັນຊີ MT5 (ເບິ່ງໃນແອັບ MT5 ບ່ອນ Accounts)`,
    `• ຊື່ເຊີບເວີ ເຊັ່ນ Exness-MT5Trial17`,
    `• Investor password ທີ່ໃຊ້ເຂົ້າໄດ້ຈິງ`,
    ``,
    `ຖ້າບໍ່ແນ່ໃຈ ຖ່າຍໜ້າຈໍ MT5 ສົ່ງມາທາງນີ້ໄດ້ເລີຍ`,
  ])
}

/**
 * Message four: the round starts soon and this EA has never reported.
 *
 * The one number that matters is how many days are left, so it is computed
 * here rather than typed — the owner sends this to a dozen people at once and
 * a wrong day in one of them is worse than not sending it.
 */
export function waLinkRemind(e: AdminEntry, contest: Contest, base: string): string {
  const ms = contest.startAt ? Date.parse(contest.startAt) - Date.now() : NaN
  const days = Number.isFinite(ms) ? Math.max(0, Math.ceil(ms / 86_400_000)) : 0
  const when = contest.startAt ? new Date(contest.startAt).toISOString().slice(0, 10) : ""
  const seen = !!e.lastSeen

  return wa(e.whatsapp, [
    `ສະບາຍດີ ${e.displayName} \u{1f44b}`,
    ``,
    days > 0
      ? `⏳ ອີກ ${days} ມື້ "${contest.title}" ຈະເລີ່ມແລ້ວ (${when})`
      : `\u{1f3c1} "${contest.title}" ເລີ່ມແລ້ວ (${when})`,
    ``,
    ...(seen ? [
      `✅ ລະບົບເຫັນ EA ຂອງທ່ານແລ້ວ — ຂໍໃຫ້ເປີດໄວ້ຕໍ່ເນື່ອງຈົນຈົບການແຂ່ງຂັນ`,
    ] : [
      `⚠️ ລະບົບ *ຍັງບໍ່ເຫັນ EA* ຂອງທ່ານເທື່ອ`,
      `ຖ້າບໍ່ໄດ້ເຊື່ອມຕໍ່ກ່ອນເວລາເລີ່ມ ຈະບໍ່ມີຕົວເລກຂຶ້ນກະດານ ແລະ ແຂ່ງບໍ່ໄດ້`,
      ``,
      `\u{1f511} ລະຫັດຜູ້ແຂ່ງຂອງທ່ານ: ${e.entryCode}`,
      `\u{1f4e5} ວິທີຕິດຕັ້ງ: ${base}/contest/install`,
      ``,
      `ສາມຢ່າງທີ່ມັກລືມ:`,
      `• ເປີດປຸ່ມ Algo Trading ໃຫ້ເປັນສີຂຽວ`,
      `• ອະນຸຍາດ WebRequest ໃສ່ https://www.laoforextrader.com`,
      `• ໃສ່ ContestCode ໃນຊ່ອງຕັ້ງຄ່າຂອງ EA`,
    ]),
    ``,
    `\u{1f4ca} ກະດານອັນດັບ: ${base}/contest`,
    `ຕິດບ່ອນໃດ ຕອບກັບຂໍ້ຄວາມນີ້ໄດ້ເລີຍ`,
  ])
}
