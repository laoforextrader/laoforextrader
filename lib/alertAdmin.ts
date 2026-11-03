// One Telegram sender for every admin-facing notice (live-chat handoff,
// pipeline alarms). It lived inline in app/api/chat/contact-admin/route.ts;
// pulling it out keeps a second copy from drifting when the bot or env
// changes — the same drift that broke scripts/preview-broadcast.ts.
//
// Bot: @Laoft_support_bot (TELEGRAM_BOT_TOKEN) → ADMIN_TELEGRAM_CHAT_ID.

/** Escape the three characters Telegram's HTML parse_mode treats as markup. */
export function escapeHtml(s: string): string {
  return s.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))
}

/**
 * Best-effort push to the admin chat. Returns the sent message_id — the
 * live-chat path maps admin replies back to a thread by it — or null when
 * the bot is unconfigured or Telegram fails. Never throws: no alarm path
 * may take down the thing it is reporting on.
 */
export async function sendAdminTelegram(text: string): Promise<number | null> {
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
