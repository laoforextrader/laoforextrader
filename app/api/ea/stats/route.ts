import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

interface Payload {
  eaId: string
  secret: string
  account?: string
  server?: string
  broker?: string
  currency?: string
  balance?: number
  equity?: number
  startBalance?: number
  profitTotal?: number
  profitTotalPct?: number
  monthlyReturns?: Array<{ month: string; profitPct: number }>
  dailyReturns?: Array<{ date: string; profitPct: number }>
}

export async function POST(req: Request) {
  if (!process.env.SANITY_API_TOKEN || !process.env.EA_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 })
  }

  let body: Payload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  if (!body?.eaId || !body?.secret) {
    return NextResponse.json({ error: "missing eaId or secret" }, { status: 400 })
  }
  if (body.secret !== process.env.EA_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 })
  }

  try {
    const doc = await client.fetch<{
      _id: string
      updateMode?: string
      lastUpdate?: string
    } | null>(
      `*[_type == "eaStats" && eaId == $eaId][0]{ _id, updateMode, lastUpdate }`,
      { eaId: body.eaId }
    )
    if (!doc?._id) {
      return NextResponse.json({ error: "eaStats doc not found — create it in Sanity Studio first" }, { status: 404 })
    }

    const mode = doc.updateMode ?? "off"
    if (mode === "off") {
      return NextResponse.json({ ok: true, skipped: "off" })
    }
    // "daily" used to be once-per-24h, but that locked today's row to the
    // first push of the day (which lands ~04:00 ICT, before forex opens),
    // making the 21:00 ICT broadcast read 0% even after a full trading day.
    // Now throttle to 60 min — MT5 can push hourly, today's row keeps
    // refreshing, and Sanity write quota stays modest (~24 writes/day/EA).
    if (mode === "daily" && doc.lastUpdate) {
      const last = new Date(doc.lastUpdate).getTime()
      if (Date.now() - last < 60 * 60 * 1000) {
        return NextResponse.json({ ok: true, skipped: "daily-throttled" })
      }
    }

    // Build patch with only present fields, plus _key for arrays
    const patch: Record<string, any> = { lastUpdate: new Date().toISOString() }
    const passthrough: Array<keyof Payload> = [
      "account", "server", "broker", "currency",
      "balance", "equity", "startBalance",
      "profitTotal", "profitTotalPct",
    ]
    for (const k of passthrough) {
      if (body[k] !== undefined && body[k] !== null) patch[k as string] = body[k]
    }
    if (Array.isArray(body.monthlyReturns)) {
      patch.monthlyReturns = body.monthlyReturns.map((m, i) => ({
        _key: `m${i}`,
        _type: "monthlyReturn",
        month: m.month,
        profitPct: Number(m.profitPct) || 0,
      }))
    }
    if (Array.isArray(body.dailyReturns)) {
      patch.dailyReturns = body.dailyReturns.map((d, i) => ({
        _key: `d${i}`,
        _type: "dailyReturn",
        date: d.date,
        profitPct: Number(d.profitPct) || 0,
      }))
    }

    await client.patch(doc._id).set(patch).commit({ visibility: "async" })
    return NextResponse.json({ ok: true, mode })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 })
  }
}
