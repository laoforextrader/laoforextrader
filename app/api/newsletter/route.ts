import { NextRequest, NextResponse } from "next/server"
import { upsertSubscriber } from "@/lib/subscribers"

export const runtime = "nodejs"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email: string | undefined = body?.email
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }
    const ok = await upsertSubscriber({
      email,
      name: body?.name,
      source: "newsletter",
      verified: false,
      // Unlike a Google sign-in, this form exists for exactly one purpose, so
      // submitting it is the request itself.
      optIn: true,
    })
    if (!ok) {
      return NextResponse.json({ error: "Could not save subscription" }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: "Subscribed!" })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
