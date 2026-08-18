// Resend over plain fetch rather than the SDK. The API is one POST, and this
// repo already fights its Vercel bundle budget hard enough that the OG image
// routes had to be moved to build time — a dependency that buys nothing here
// isn't worth the weight.

import { unsubscribeUrl } from "@/lib/newsletter/tokens"

const ENDPOINT = "https://api.resend.com/emails"

/** Sender lives on a subdomain so a bad send never bruises the root domain's reputation. */
export const FROM = "LaoForexTrader <news@mail.laoforextrader.com>"

/** The domain cannot receive mail, so replies are pointed at a mailbox that can. */
export const REPLY_TO = "laoforextrader@gmail.com"

export interface SendResult {
  ok: boolean
  id?: string
  error?: string
}

export async function sendEmail(args: {
  to: string
  subject: string
  html: string
  text: string
  /** Blind index of the recipient — becomes their personal unsubscribe link. */
  emailHash: string
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY missing" }

  const unsub = unsubscribeUrl(args.emailHash)

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [args.to],
        reply_to: REPLY_TO,
        subject: args.subject,
        html: args.html,
        // A text part is not optional in practice: HTML-only mail scores worse
        // with every filter, and some Lao users read on clients that prefer it.
        text: args.text,
        headers: {
          // Gmail renders its own unsubscribe control from these two, and since
          // February 2024 expects them from anyone sending in volume. The POST
          // variant is what makes it one click with no page visit.
          "List-Unsubscribe": `<${unsub}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: body?.message ?? `HTTP ${res.status}` }
    return { ok: true, id: body?.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" }
  }
}
