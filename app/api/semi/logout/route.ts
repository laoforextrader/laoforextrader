import { NextResponse } from "next/server"
import { closeDashSession } from "@/lib/semi/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Leaves the control panel, not the website. The Google session is untouched;
// only the cookie that says "this browser has entered the dashboard key" goes.
export async function POST() {
  await closeDashSession()
  return NextResponse.json({ ok: true })
}
