// User-initiated message to the admin from the chat widget — the visitor side
// of a two-way live chat.
//
// Appends the message to the visitor's `supportThread` doc (one per browser
// threadId), then pushes a Telegram alert to the admin. The Telegram
// message_id is stored on the thread so that when the admin *replies* to that
// message, /api/telegram/webhook can route the reply back to the right thread.
// The widget then surfaces the reply by polling /api/chat/thread.

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sanityWrite } from "@/lib/sanityWrite"
import { encryptPII } from "@/lib/pii"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface Body {
  message?: string
  threadId?: string
  name?: string
  email?: string
  path?: string
}

function key(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function esc(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))
}

// Returns the sent message_id (so we can map replies back), or null.
async function notifyAdminTelegram(text: string): Promise<number | null> {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID
  if (!token || !chatId) return null
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    })
    const data = await res.json().catch(() => null)
    const mid = data?.result?.message_id
    return typeof mid === "number" ? mid : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  let body: Body
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const message  = (body.message ?? "").trim().slice(0, 2000)
  const threadId = (body.threadId ?? "").trim().slice(0, 80)
  if (!message)  return NextResponse.json({ error: "message required" },  { status: 400 })
  if (!threadId) return NextResponse.json({ error: "threadId required" }, { status: 400 })

  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id as string | undefined
  const name    = (body.name  ?? session?.user?.name  ?? "").slice(0, 80)  || undefined
  const email   = (body.email ?? session?.user?.email ?? "").slice(0, 200) || undefined
  const path    = (body.path ?? "").slice(0, 200) || undefined
  const now     = new Date().toISOString()

  // Sanity _id must be alphanumeric/dash/dot/underscore — a UUID threadId is fine.
  const docId = `supportThread.${threadId.replace(/[^a-zA-Z0-9._-]/g, "")}`

  try {
    await sanityWrite.createIfNotExists({
      _id: docId,
      _type: "supportThread",
      threadId,
      status: "open",
      createdAt: now,
      messages: [],
      telegramMsgIds: [],
    })

    // The dataset is public, so the thread carries only what answering the
    // visitor actually needs. IP and User-Agent were stored and never read by
    // anything — dropped. Name and email are needed (the admin replies to a
    // person, and /admin lists who is waiting) so they are sealed instead.
    const meta: Record<string, unknown> = { status: "open", lastUserAt: now }
    if (path) meta.path = path

    const setIfMissing: Record<string, unknown> = {}
    if (name)   setIfMissing.nameEnc  = encryptPII(name)
    if (email)  setIfMissing.emailEnc = encryptPII(email)
    if (userId) setIfMissing.userId = userId

    await sanityWrite
      .patch(docId)
      .setIfMissing({ messages: [], telegramMsgIds: [], ...setIfMissing })
      .set(meta)
      .append("messages", [{ _key: key(), role: "user", content: message, createdAt: now }])
      .commit()
  } catch (err: any) {
    const detail = err?.message ?? String(err)
    console.error("[contact-admin] sanity write failed", {
      status: err?.statusCode,
      message: detail,
      hint: !process.env.SANITY_API_TOKEN
        ? "SANITY_API_TOKEN not set in .env.local"
        : undefined,
    })
    return NextResponse.json(
      { error: "save_failed", detail: detail.slice(0, 200) },
      { status: 500 },
    )
  }

  // Best-effort admin notification. The HTML "Reply" hint matters: the admin
  // must reply TO this message in Telegram for the webhook to route it back.
  const who = name ? `<b>${esc(name)}</b>` : "<b>(guest)</b>"
  const summary =
    `<b>💬 ຂໍ້ຄວາມໃໝ່ຈາກເວັບ</b>\n` +
    `${who}${email ? ` &lt;${esc(email)}&gt;` : ""}\n` +
    `${path ? `<b>ໜ້າ:</b> ${esc(path)}\n` : ""}` +
    `\n<i>${esc(message)}</i>\n` +
    `\n↩️ <b>ຕອບ:</b> Reply ໃສ່ຂໍ້ຄວາມນີ້ ແລ້ວພິມຄຳຕອບ — ລະບົບຈະສົ່ງກັບໃຫ້ລູກຄ້າໃນເວັບ.`

  const mid = await notifyAdminTelegram(summary)
  if (mid !== null) {
    // Keep the id so the inbound webhook can match the admin's reply.
    sanityWrite
      .patch(docId)
      .setIfMissing({ telegramMsgIds: [] })
      .append("telegramMsgIds", [mid])
      .commit()
      .catch(() => null)
  }

  return NextResponse.json({ ok: true })
}
