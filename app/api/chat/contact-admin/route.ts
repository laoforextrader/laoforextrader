// User-initiated "send message to admin" handoff from the chat widget.
//
// Saves the message to Sanity (`adminMessage` doc) so the admin can
// see and triage in Studio. Optionally also pushes a Telegram alert
// to the admin's personal chat if ADMIN_TELEGRAM_CHAT_ID is set —
// admin then replies via LINE or Telegram directly to the visitor.

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sanityWrite } from "@/lib/sanityWrite"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Channel = "line" | "telegram" | "email" | "any"

interface Body {
  message?: string
  name?: string
  email?: string
  channel?: Channel
  contactHandle?: string
  path?: string
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim()
  return req.headers.get("x-real-ip") ?? "unknown"
}

async function notifyAdminTelegram(text: string): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  }).catch(() => null)
}

export async function POST(req: NextRequest) {
  let body: Body
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const message = (body.message ?? "").trim().slice(0, 2000)
  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id as string | undefined
  const sName   = session?.user?.name  ?? null
  const sEmail  = session?.user?.email ?? null
  const ip      = getClientIp(req)
  const ua      = req.headers.get("user-agent") ?? ""
  const now     = new Date().toISOString()

  const name          = (body.name  ?? sName  ?? "").slice(0, 80) || undefined
  const email         = (body.email ?? sEmail ?? "").slice(0, 200) || undefined
  const channel       = (body.channel ?? "any") as Channel
  const contactHandle = (body.contactHandle ?? "").slice(0, 200) || undefined
  const path          = (body.path ?? "").slice(0, 200) || undefined

  try {
    await sanityWrite.create({
      _type: "adminMessage",
      message,
      name,
      email,
      userId,
      channel,
      contactHandle,
      path,
      userAgent: ua,
      ip,
      status: "pending",
      createdAt: now,
    })
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

  // Best-effort admin notification — never block the user on failure
  const summary =
    `<b>📨 ຂໍ້ຄວາມໃໝ່ຈາກເວັບ</b>\n` +
    `${name ? `<b>${name}</b>` : "(guest)"}` +
    `${email ? ` &lt;${email}&gt;` : ""}\n` +
    `${contactHandle ? `<b>Reply via:</b> ${channel} — ${contactHandle}\n` : ""}` +
    `${path ? `<b>Page:</b> ${path}\n` : ""}` +
    `\n<i>${message.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))}</i>`
  notifyAdminTelegram(summary).catch(() => null)

  return NextResponse.json({ ok: true })
}
