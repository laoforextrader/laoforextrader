import { NextResponse } from "next/server"
import { getGoldSnapshot } from "@/lib/gold"

export const revalidate = 60

export async function GET() {
  const snap = await getGoldSnapshot()
  if (!snap) {
    return NextResponse.json({ error: "gold price unavailable" }, { status: 503 })
  }
  return NextResponse.json(snap)
}
