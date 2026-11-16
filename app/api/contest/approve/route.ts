import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin/auth"
import { approveEntry, rejectEntry } from "@/lib/contest/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Approve or reject one entry. Admin only — the same ADMIN_EMAILS check the
// rest of /admin uses, so there is one list to maintain and no second secret
// to leak.
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

  if (body.action === "reject") {
    await rejectEntry(id, email!, String(body.note ?? "").slice(0, 200))
    return NextResponse.json({ ok: true, status: "disqualified" })
  }

  await approveEntry(id, email!)
  return NextResponse.json({ ok: true, status: "approved" })
}
