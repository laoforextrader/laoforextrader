// Visitor-side polling endpoint for the live chat.
//
// The widget polls this every few seconds while waiting on the admin. It
// returns only ADMIN messages newer than `after` (an ISO timestamp), so the
// client just tracks the last one it has seen. Read-only, no-store.

import { NextRequest, NextResponse } from "next/server"
// Use the TOKENED write client for this read. Anonymous reads (sanityClient,
// no token) are served from Sanity's cached/eventually-consistent layer and
// do NOT immediately see freshly-written admin replies — so the poll would
// miss them. The authenticated client gives strongly-consistent reads.
import { sanityWrite } from "@/lib/sanityWrite"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const url      = new URL(req.url)
  const threadId = (url.searchParams.get("threadId") ?? "").trim().slice(0, 80)
  const after    = url.searchParams.get("after") ?? ""

  if (!threadId) {
    return NextResponse.json({ messages: [], status: "none" })
  }

  const docId = `supportThread.${threadId.replace(/[^a-zA-Z0-9._-]/g, "")}`

  try {
    const doc = await sanityWrite.fetch(
      `*[_id == $id][0]{
        status,
        "messages": messages[role == "admin" && createdAt > $after]{ content, createdAt }
      }`,
      { id: docId, after },
      { cache: "no-store" },
    )
    return NextResponse.json({
      messages: doc?.messages ?? [],
      status: doc?.status ?? "none",
    })
  } catch (err) {
    console.error("[chat/thread] read failed", err)
    return NextResponse.json({ messages: [], status: "error" })
  }
}
