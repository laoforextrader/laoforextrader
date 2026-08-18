// Consent, captured on the site rather than by email — the only way to build a
// mailable list out of people who signed in for something else entirely.
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { setEmailOptIn } from "@/lib/subscribers"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const optIn = body?.optIn === true

  const ok = await setEmailOptIn(email, optIn, "dashboard")
  if (!ok) return NextResponse.json({ error: "could_not_save" }, { status: 500 })
  return NextResponse.json({ optIn })
}
