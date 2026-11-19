import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin/auth"
import {
  approveEntry, rejectEntry, cancelEntry, blockEntry, markReminded, unblock,
} from "@/lib/contest/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Everything the owner can do to one entry. Admin only — the same
// ADMIN_EMAILS check the rest of /admin uses, so there is one list to
// maintain and no second secret to leak.
//
// The verdicts are deliberately separate, and only one of them is about the
// person rather than the entry:
//
//   approve / reject — the entry is in the round, or out of it.
//   cancel           — the entry was filled in wrong. It leaves the round and
//                      the same person may register again with the same email
//                      and phone; nothing is held against them.
//   block            — this person may never register again, in any round.
//
// `remind` writes nothing but a timestamp: it is how the reminder list knows
// who has already been chased, and the browser sends it as the owner opens
// the WhatsApp link.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!isAdminEmail(email)) return NextResponse.json({ error: "not allowed" }, { status: 403 })

  let body: { id?: string; action?: string; note?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const id = String(body.id ?? "")
  if (!id.startsWith("contestEntry") && !/^[A-Za-z0-9._-]{8,}$/.test(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 })
  }
  const note = String(body.note ?? "").slice(0, 300)

  switch (body.action) {
    case "reject":
      await rejectEntry(id, email!, note)
      return NextResponse.json({ ok: true, status: "disqualified" })

    case "cancel":
      // A reason is required: it is the whole content of the message the
      // contestant gets, and "your entry was cancelled" on its own reads as
      // a rejection.
      if (note.length < 2) return NextResponse.json({ error: "reason required" }, { status: 400 })
      await cancelEntry(id, email!, note)
      return NextResponse.json({ ok: true, status: "cancelled" })

    case "block":
      if (note.length < 2) return NextResponse.json({ error: "reason required" }, { status: 400 })
      await blockEntry(id, email!, note)
      return NextResponse.json({ ok: true, status: "disqualified", blocked: true })

    // Here `id` is the block document, not an entry.
    case "unblock":
      await unblock(id)
      return NextResponse.json({ ok: true, unblocked: true })

    case "remind":
      await markReminded(id)
      return NextResponse.json({ ok: true, reminded: true })

    default:
      await approveEntry(id, email!)
      return NextResponse.json({ ok: true, status: "approved" })
  }
}
