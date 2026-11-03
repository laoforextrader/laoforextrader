// Watchdog for pipeline 1 (daily news). It reads the day's dailyUpdate doc
// and pushes a Telegram alarm when the day did not complete.
//
// Why a separate route instead of alerting from inside the pipeline: the
// pipeline's worst failure mode is Vercel hard-killing the invocation, and a
// hard kill skips the route's own catch block — so nothing inside it can ever
// report that case. Only an outside observer can. The 2026-10-09 → 11-03
// outage ran 26 days unseen for exactly this reason: /news reads
// `order(date desc)[0]` with no date check, so a stale doc looks like a fresh
// page, and stage 1 still writes rawCalendar so the calendar table renders.
//
// Read-only by design. It must NEVER create the day's doc: an empty doc for
// today would win that `order(date desc)[0]` and turn the graceful fallback
// ("yesterday's news") into an empty /news page. Retrying is the job of the
// existing cron-job.org safety net that re-hits /api/cron/daily-update.
import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { todayInVientiane } from "@/lib/news/sources"
import { sendAdminTelegram, escapeHtml } from "@/lib/alertAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

function authorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET || process.env.BROADCAST_SECRET
  if (!expected) return true
  if (req.headers.get("authorization") === `Bearer ${expected}`) return true
  return new URL(req.url).searchParams.get("secret") === expected
}

// Tokened + useCdn:false so this is a strongly consistent read; the CDN
// client can serve a cached miss and invent an outage that isn't there.
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f8cr9afb",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   || "production",
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

type Doc = {
  pipelineComplete?: boolean
  lastError?: string
  dailySummary?: string
  lineSentAt?: string
  rawCalendar?: unknown[]
  alerted?: string
}

async function handle(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const url   = new URL(req.url)
  const force = url.searchParams.get("force") === "true"   // alert even if already alerted
  const test  = url.searchParams.get("test")  === "true"   // prove the bot works

  const date  = todayInVientiane()
  const docId = `daily-${date}`

  if (test) {
    const mid = await sendAdminTelegram(
      `🔔 <b>ทดสอบแจ้งเตือน</b>\nระบบเฝ้าระวังข่าวรายวันส่งข้อความได้ปกติ (${escapeHtml(date)})`,
    )
    return NextResponse.json({ ok: true, test: true, telegramMessageId: mid })
  }

  const doc = await sanity.fetch<Doc | null>(
    `*[_id == $id][0]{
      pipelineComplete, lastError, dailySummary, lineSentAt, rawCalendar,
      "alerted": watchdogAlertedAt
    }`,
    { id: docId },
  )

  if (doc?.pipelineComplete) {
    return NextResponse.json({
      ok: true, status: "healthy", date,
      lineSentAt: doc.lineSentAt ?? null,
    })
  }

  // Already alarmed on this date — stay quiet so an hourly schedule cannot
  // turn one bad morning into a stream of identical messages.
  if (doc?.alerted && !force) {
    return NextResponse.json({
      ok: true, status: "already-alerted", date, alertedAt: doc.alerted,
    })
  }

  // Name the state precisely, because each one points somewhere different.
  let what: string
  let hint: string
  if (!doc) {
    what = "ไม่มีเอกสารของวันนี้เลย"
    hint = "cron ไม่ได้ยิง หรือถูกฆ่าก่อนเขียน Sanity — เช็ก Vercel cron + runtime logs"
  } else if (doc.lastError) {
    what = "มี error ระหว่างรัน"
    hint = "ดูข้อความ error ด้านล่าง (เครดิต API หมด / feed ล่ม / JSON พัง)"
  } else if ((doc.rawCalendar?.length ?? 0) > 0 && !doc.dailySummary) {
    what = "ได้ปฏิทินแต่ไม่ได้บทสรุปลาว"
    hint = "ขั้นเรียก Claude ถูกตัดกลางทาง — เกือบแน่ว่าชน timeout (ไม่มี error ถูกบันทึก = Vercel hard kill)"
  } else {
    what = "รันไม่จบ"
    hint = "pipelineComplete ยังไม่เป็น true"
  }

  const lines = [
    "⚠️ <b>ข่าวรายวันไม่สำเร็จ</b>",
    `<b>วันที่:</b> ${escapeHtml(date)}`,
    `<b>อาการ:</b> ${escapeHtml(what)}`,
    `<b>น่าจะเพราะ:</b> ${escapeHtml(hint)}`,
    doc?.lastError ? `\n<b>error:</b>\n<code>${escapeHtml(String(doc.lastError).slice(0, 500))}</code>` : "",
    `\nรันซ้ำเอง: <code>/api/cron/daily-update?force=true</code>`,
    "หน้าเว็บ: https://www.laoforextrader.com/news",
  ].filter(Boolean)

  const mid = await sendAdminTelegram(lines.join("\n"))

  // Stamp only when the doc exists — see the no-create rule at the top of
  // this file. A missing doc therefore re-alerts on every run, which is
  // right: that is the most serious of the three states.
  if (doc) {
    await sanity.patch(docId)
      .set({ watchdogAlertedAt: new Date().toISOString() })
      .commit()
      .catch(() => {})
  }

  return NextResponse.json({
    ok: true,
    status: "alerted",
    date,
    symptom: what,
    telegramMessageId: mid,
    telegramConfigured: mid !== null,
  })
}

export async function GET(req: Request)  { return handle(req) }
export async function POST(req: Request) { return handle(req) }
