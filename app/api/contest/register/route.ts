import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { currentContest, registerEntry, entryCount } from "@/lib/contest/store"
import { sendAdminTelegram, escapeHtml } from "@/lib/alertAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Registering for the current round.
//
// The entry code is generated here and shown to the contestant once, on the
// page that follows. After that it only ever travels as a signature from
// their EA — the same arrangement as the Semi dashboard key, and for the same
// reason: a code that keeps moving is a code that leaks.

const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max)

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "sign in first" }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const displayName = clean(body.displayName, 40)
  const contact     = clean(body.contact, 64)
  const country     = clean(body.country, 40)
  const mtLogin     = clean(body.mtLogin, 16)
  const mtServer    = clean(body.mtServer, 64)

  if (displayName.length < 2) return NextResponse.json({ error: "name is too short" }, { status: 400 })
  if (contact.length < 3)     return NextResponse.json({ error: "contact is required" }, { status: 400 })
  if (!/^\d{5,12}$/.test(mtLogin)) {
    return NextResponse.json({ error: "MT5 account number must be digits only" }, { status: 400 })
  }

  const contest = await currentContest()
  if (!contest || contest.status !== "register") {
    return NextResponse.json({ error: "closed", reason: "closed" }, { status: 409 })
  }

  const res = await registerEntry({
    contestId: contest._id,
    email,
    displayName,
    contact,
    country,
    mtLogin,
    mtServer,
    startBalance: contest.startBalance ?? 0,
  })

  if (!res.ok) return NextResponse.json({ error: res.reason, reason: res.reason }, { status: 409 })

  // Best-effort: a Telegram outage must not cost someone their registration,
  // which is already committed by this point.
  const total = await entryCount(contest._id).catch(() => res.entryNo)
  void sendAdminTelegram(
    `🏁 <b>Contest registration #${res.entryNo}</b>\n` +
    `${escapeHtml(displayName)} · ${escapeHtml(country || "—")}\n` +
    `MT5 <code>${escapeHtml(mtLogin)}</code> · ${escapeHtml(mtServer || "—")}\n` +
    `${escapeHtml(contact)}\n` +
    `${escapeHtml(contest.title)} · total ${total}` +
    (res.earlyBird ? `\n🎁 early bird — VPS perk` : "")
  )

  return NextResponse.json({
    ok: true,
    code: res.code,
    entryNo: res.entryNo,
    earlyBird: res.earlyBird,
  })
}
