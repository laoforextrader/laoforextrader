// Two callers, two shapes:
//
//   POST  Gmail's one-click unsubscribe button. Triggered by the
//         `List-Unsubscribe-Post: List-Unsubscribe=One-Click` header, fired by
//         the mail client with nobody watching. It must succeed without a
//         session, without a confirmation step, and return 2xx.
//   GET   the link in the body of the message, clicked by a human. Same work,
//         then a redirect to a page that says so in Lao.
//
// Google requires the opt-out to take effect within two days; this is
// immediate. Never require a login here — the whole point is that it works for
// someone who has forgotten they ever had an account.

import { NextRequest, NextResponse } from "next/server"
import { sanityWrite } from "@/lib/sanityWrite"
import { verifyUnsubscribeToken } from "@/lib/newsletter/tokens"

export const runtime = "nodejs"

type Outcome = "ok" | "already" | "notfound" | "badtoken" | "error"

async function unsubscribe(token: string | null): Promise<Outcome> {
  const emailHash = token ? verifyUnsubscribeToken(token) : null
  if (!emailHash) return "badtoken"

  try {
    const doc = await sanityWrite.fetch<{ _id: string; unsubscribed?: boolean } | null>(
      `*[_type == "subscriber" && emailHash == $emailHash][0]{ _id, unsubscribed }`,
      { emailHash },
    )
    if (!doc?._id) return "notfound"
    if (doc.unsubscribed) return "already"

    await sanityWrite
      .patch(doc._id)
      .set({ unsubscribed: true, unsubscribedAt: new Date().toISOString(), emailOptIn: false })
      .commit()
    return "ok"
  } catch {
    return "error"
  }
}

export async function POST(req: NextRequest) {
  const outcome = await unsubscribe(req.nextUrl.searchParams.get("t"))
  // A mail client cannot act on a failure, and a non-2xx makes Gmail treat the
  // one-click button as broken. Only a genuine server fault is worth a 500.
  return NextResponse.json({ outcome }, { status: outcome === "error" ? 500 : 200 })
}

export async function GET(req: NextRequest) {
  const outcome = await unsubscribe(req.nextUrl.searchParams.get("t"))
  return NextResponse.redirect(new URL(`/unsubscribe?s=${outcome}`, req.nextUrl.origin))
}
