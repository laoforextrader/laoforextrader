import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { linkAccount, accountsOf } from "@/lib/semi/store"
import { openDashSession } from "@/lib/semi/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Link an MT5 account to the signed-in Google user.
//
// This is the only moment the dashboard key travels: the owner reads it off
// the EA panel and types it here, over an authenticated HTTPS session. After
// this the EA proves itself with a signature and the key never moves again.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "sign in first" }, { status: 401 })

  let body: { account?: string; key?: string; remember?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const account = String(body.account ?? "").trim()
  const key = String(body.key ?? "").trim().toUpperCase()

  if (!/^\d{5,12}$/.test(account)) {
    return NextResponse.json({ error: "account must be the MT5 login number" }, { status: 400 })
  }
  // The EA writes the key as XXXX-XXXX-XXXX-XXXX; accept it with or without
  // the dashes so retyping from the panel is forgiving.
  const compact = key.replace(/-/g, "")
  if (!/^[A-Z0-9]{12,32}$/.test(compact)) {
    return NextResponse.json({ error: "key does not look right" }, { status: 400 })
  }

  const res = await linkAccount(account, key, email, session?.user?.name ?? undefined)
  if (!res.ok) {
    const msg = res.reason === "already-linked"
      ? "this account is already linked to another user"
      : "the key does not match the one already stored for this account"
    return NextResponse.json({ error: msg, reason: res.reason }, { status: 409 })
  }

  // The key was right, so this browser may now drive this account.
  await openDashSession(account, body.remember === true)
  return NextResponse.json({ ok: true, account })
}

/** Accounts the signed-in user has linked — used by the dashboard picker. */
export async function GET() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "sign in first" }, { status: 401 })
  return NextResponse.json({ accounts: await accountsOf(email) })
}
