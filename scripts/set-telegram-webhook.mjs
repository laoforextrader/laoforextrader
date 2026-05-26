/**
 * Register (or clear) the Telegram inbound webhook for two-way live chat.
 *
 * Tells Telegram to POST every incoming message to /api/telegram/webhook and
 * to echo TELEGRAM_WEBHOOK_SECRET in the X-Telegram-Bot-Api-Secret-Token
 * header so the route can trust the call.
 *
 *   node scripts/set-telegram-webhook.mjs            # set webhook
 *   node scripts/set-telegram-webhook.mjs --info     # show current webhook
 *   node scripts/set-telegram-webhook.mjs --delete   # remove webhook
 *
 * Reads from .env.local (or the process env):
 *   TELEGRAM_BOT_TOKEN        (required)
 *   TELEGRAM_WEBHOOK_SECRET   (required for --set; any opaque string)
 *   PUBLIC_BASE_URL           (default https://laoforextrader.com)
 */
import { readFileSync } from "node:fs"

// Minimal .env.local loader — no dotenv dependency required.
function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
      }
    }
  } catch { /* no .env.local — rely on process env */ }
}
loadEnv()

const TOKEN   = process.env.TELEGRAM_BOT_TOKEN
const SECRET  = process.env.TELEGRAM_WEBHOOK_SECRET
const BASE    = (process.env.PUBLIC_BASE_URL ?? "https://laoforextrader.com").replace(/\/$/, "")
const WEBHOOK = `${BASE}/api/telegram/webhook`

if (!TOKEN) {
  console.error("✗ TELEGRAM_BOT_TOKEN is not set (.env.local or env).")
  process.exit(1)
}

const api = (method) => `https://api.telegram.org/bot${TOKEN}/${method}`

async function call(method, body) {
  const res = await fetch(api(method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  })
  return res.json()
}

const mode = process.argv[2]

if (mode === "--info") {
  console.log(JSON.stringify(await call("getWebhookInfo"), null, 2))
} else if (mode === "--delete") {
  const r = await call("deleteWebhook", { drop_pending_updates: true })
  console.log(r.ok ? "✓ Webhook deleted." : "✗ " + JSON.stringify(r))
} else {
  if (!SECRET) {
    console.error("✗ TELEGRAM_WEBHOOK_SECRET is not set — generate one, e.g.:")
    console.error('  node -e "console.log(require(\'crypto\').randomBytes(24).toString(\'hex\'))"')
    process.exit(1)
  }
  const r = await call("setWebhook", {
    url: WEBHOOK,
    secret_token: SECRET,
    allowed_updates: ["message", "edited_message"],
    drop_pending_updates: true,
  })
  if (r.ok) {
    console.log(`✓ Webhook set → ${WEBHOOK}`)
    console.log("  Telegram will echo your secret in X-Telegram-Bot-Api-Secret-Token.")
    console.log("  Make sure the SAME TELEGRAM_WEBHOOK_SECRET is set in your Vercel env.")
  } else {
    console.error("✗ setWebhook failed: " + JSON.stringify(r))
    process.exit(1)
  }
}
