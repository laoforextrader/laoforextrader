// Inbound Telegram webhook — the admin side of the two-way live chat.
//
// The admin replies (in Telegram) TO one of the notification messages that
// /api/chat/contact-admin sent. Telegram delivers that here with
// `message.reply_to_message.message_id`. We match that id against the
// `telegramMsgIds` we stored on each supportThread, append the admin's text as
// a {role:"admin"} message, and the visitor's widget picks it up by polling
// /api/chat/thread.
//
// Set up once (see scripts/set-telegram-webhook.mjs):
//   setWebhook url=https://laoforextrader.com/api/telegram/webhook
//              secret_token=$TELEGRAM_WEBHOOK_SECRET
// Telegram then sends that secret in the X-Telegram-Bot-Api-Secret-Token header.

import { NextRequest, NextResponse } from "next/server"
import { sanityWrite } from "@/lib/sanityWrite"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ok = () => NextResponse.json({ ok: true })

function key(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

async function sendTelegram(chatId: number | string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  }).catch(() => null)
}

export async function POST(req: NextRequest) {
  // Verify the secret token Telegram echoes back. Always answer 200 so
  // Telegram doesn't retry — silent drop on mismatch.
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET
  if (expected) {
    const got = req.headers.get("x-telegram-bot-api-secret-token")
    if (got !== expected) return ok()
  }

  const update = await req.json().catch(() => null)
  const msg = update?.message ?? update?.edited_message
  const text = (msg?.text ?? "").trim()
  const fromChat = msg?.chat?.id
  const replyToId = msg?.reply_to_message?.message_id

  // Only the admin's own chat may drive this. If ADMIN_TELEGRAM_CHAT_ID is set,
  // ignore anything from other chats.
  const adminChat = process.env.ADMIN_TELEGRAM_CHAT_ID
  if (adminChat && String(fromChat) !== String(adminChat)) return ok()

  if (!text) return ok()

  if (!replyToId) {
    await sendTelegram(
      fromChat,
      "↩️ ກະລຸນາ Reply ໃສ່ຂໍ້ຄວາມຂອງລູກຄ້າ ແລ້ວພິມຄຳຕອບ — ລະບົບຈຶ່ງຮູ້ວ່າຈະສົ່ງໃຫ້ໃຜ.",
    )
    return ok()
  }

  let thread: { _id: string; name?: string } | null = null
  try {
    thread = await sanityWrite.fetch(
      `*[_type == "supportThread" && $mid in telegramMsgIds][0]{ _id, name }`,
      { mid: replyToId },
    )
  } catch (err) {
    console.error("[telegram-webhook] thread lookup failed", err)
    return ok()
  }

  if (!thread?._id) {
    await sendTelegram(
      fromChat,
      "⚠️ ບໍ່ພົບຫ້ອງສົນທະນາສຳລັບຂໍ້ຄວາມນີ້. ລອງ Reply ໃສ່ຂໍ້ຄວາມຫຼ້າສຸດຂອງລູກຄ້າ.",
    )
    return ok()
  }

  const now = new Date().toISOString()
  try {
    await sanityWrite
      .patch(thread._id)
      .setIfMissing({ messages: [] })
      .set({ lastAdminAt: now, status: "open" })
      .append("messages", [{ _key: key(), role: "admin", content: text.slice(0, 2000), createdAt: now }])
      .commit()
  } catch (err) {
    console.error("[telegram-webhook] append failed", err)
    await sendTelegram(fromChat, "⚠️ ບັນທຶກຄຳຕອບບໍ່ສຳເລັດ — ລອງໃໝ່.")
    return ok()
  }

  await sendTelegram(fromChat, `✓ ສົ່ງໃຫ້${thread.name ? ` ${thread.name}` : "ລູກຄ້າ"}ແລ້ວ`)
  return ok()
}
