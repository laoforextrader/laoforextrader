import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { currentContest, registerEntry, entryCount } from "@/lib/contest/store"
import { sendAdminTelegram, escapeHtml } from "@/lib/alertAdmin"
import { waRepair, waLooksValid } from "@/lib/contest/phone"

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
  // Normalised again here, not just in the form: this is the number every
  // later message is sent to, and the form is not the only possible caller.
  const contact     = waRepair(clean(body.contact, 64))
  const country     = clean(body.country, 40)
  const mtLogin     = clean(body.mtLogin, 16)
  const mtServer    = clean(body.mtServer, 64)
  // Read-only password. Checked for length only — whether it actually works
  // is for the admin to find out by logging in, which is the point of it.
  const investor    = clean(body.investor, 64)

  if (displayName.length < 2) return NextResponse.json({ error: "name is too short" }, { status: 400 })
  // Digits only, international form. 8 is the shortest real mobile number.
  if (!waLooksValid(contact)) {
    return NextResponse.json({ error: "WhatsApp number must be digits, with country code" }, { status: 400 })
  }
  if (!/^\d{5,12}$/.test(mtLogin)) {
    return NextResponse.json({ error: "MT5 account number must be digits only" }, { status: 400 })
  }
  if (investor.length < 4) {
    return NextResponse.json({ error: "investor password is required" }, { status: 400 })
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
    investor,
    // Behind Vercel this is the real client address. It is hashed before it
    // is stored and never read back — only compared with other entries.
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "",
  })

  if (!res.ok) return NextResponse.json({ error: res.reason, reason: res.reason }, { status: 409 })

  // Best-effort: a Telegram outage must not cost someone their registration,
  // which is already committed by this point.
  const total = await entryCount(contest._id).catch(() => res.entryNo)
  const base = process.env.PUBLIC_BASE_URL ?? "https://www.laoforextrader.com"
  void sendAdminTelegram(
    `🏁 <b>Contest registration #${res.entryNo}</b>\n` +
    `${escapeHtml(displayName)} · ${escapeHtml(country || "—")}\n` +
    `MT5 <code>${escapeHtml(mtLogin)}</code> · ${escapeHtml(mtServer || "—")}\n` +
    `WhatsApp +${escapeHtml(contact)}\n` +
    `${escapeHtml(contest.title)} · total ${total}` +
    (res.earlyBird ? `\n🎁 early bird — send them a VPS` : "") +
    `\n\n👉 <a href="${base}/admin/contest">send the code, then approve once the EA connects</a>`
  )

  return NextResponse.json({
    ok: true,
    code: res.code,
    entryNo: res.entryNo,
    earlyBird: res.earlyBird,
  })
}
