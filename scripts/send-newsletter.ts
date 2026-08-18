/**
 * Send one campaign to everyone who asked for mail.
 *
 * Who gets it: `emailOptIn == true && unsubscribed != true`. Nothing else.
 * Having a subscriber doc is not consent — 49 of them exist because people
 * signed in with Google to leave a comment.
 *
 *   npx tsx scripts/send-newsletter.ts --preview          write the HTML to a file, send nothing
 *   npx tsx scripts/send-newsletter.ts --dry              list recipients, send nothing
 *   npx tsx scripts/send-newsletter.ts --only me@x.com    send one real message to yourself
 *   npx tsx scripts/send-newsletter.ts                    send to the whole opted-in list
 *
 * Re-running is safe: anyone already marked with this campaign is skipped, so
 * a crash halfway through resumes rather than double-sending. --force overrides.
 */
import { createClient } from "@sanity/client"
import { readFileSync, writeFileSync } from "node:fs"

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z_0-9]+)=(.*)$/.exec(line.trim())
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

import { decryptPII } from "../lib/pii"
import { unsubscribeUrl } from "../lib/newsletter/tokens"
import { buildHtml, buildText, type BroadcastContent } from "../lib/newsletter/templates/broadcast"
import { sendEmail } from "../lib/newsletter/send"

// ── the campaign ──────────────────────────────────────────────────────────
// Edit this block. `id` is what makes a re-run idempotent — change it for a
// genuinely new send, keep it to resume an interrupted one.
const CAMPAIGN_ID = "free-ea-2026-08"

const CONTENT: BroadcastContent = {
  subject: "EA ຟຣີ ສຳລັບສະມາຊິກ LaoForexTrader",
  preheader: "ດາວໂຫຼດ EA ພ້ອມ setfile ແລະ ຜົນ backtest ເຕັມ",
  heading: "EA ຟຣີ ສຳລັບທ່ານ",
  paragraphs: [
    "ສະບາຍດີ! ຂອບໃຈທີ່ເປັນສະມາຊິກຂອງ LaoForexTrader.",
    "ພວກເຮົາໄດ້ກຽມ EA ພ້ອມ setfile ແລະ ຜົນ backtest ເຕັມໆ ໃຫ້ທ່ານດາວໂຫຼດຟຣີ. ທຸກຢ່າງມີຄຳອະທິບາຍເປັນພາສາລາວ ພ້ອມວິທີຕິດຕັ້ງເທື່ອລະຂັ້ນຕອນ.",
    "ຖ້າມີຄຳຖາມ ຕອບກັບອີເມວນີ້ໄດ້ເລີຍ ພວກເຮົາອ່ານທຸກສະບັບ.",
  ],
  cta: { label: "ເບິ່ງ EA ແລະ ດາວໂຫຼດ", url: "https://www.laoforextrader.com/ea-system" },
  signoff: "ຂອບໃຈທີ່ຕິດຕາມ 🙏\nທີມງານ LaoForexTrader",
}
// ──────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const has = (f: string) => args.includes(f)
const valueOf = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined }

const PREVIEW = has("--preview")
const DRY     = has("--dry")
const FORCE   = has("--force")
const ONLY    = valueOf("--only")
const LIMIT   = Number(valueOf("--limit") ?? 0)

// Resend's free tier allows 2 requests a second.
const GAP_MS = 600
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const mask = (e: string) => { const [u, d] = e.split("@"); return `${u.slice(0, 2)}***@${d}` }

const sanity = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function main() {
  if (PREVIEW) {
    const url = unsubscribeUrl("0".repeat(32))
    writeFileSync("newsletter-preview.html", buildHtml(CONTENT, url), "utf8")
    console.log("📄 newsletter-preview.html — open it in a browser\n")
    console.log("── plain text part ──\n")
    console.log(buildText(CONTENT, url))
    return
  }

  if (!process.env.SANITY_API_TOKEN) throw new Error("SANITY_API_TOKEN missing")
  if (!DRY && !process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY missing")

  const rows = await sanity.fetch<any[]>(
    `*[_type == "subscriber" && emailOptIn == true && unsubscribed != true]{ _id, emailHash, emailEnc, lastEmailCampaign }`,
  )

  let recipients = rows
    .map((r) => {
      try { return { ...r, email: decryptPII(r.emailEnc) } } catch { return null }
    })
    .filter(Boolean) as { _id: string; emailHash: string; email: string; lastEmailCampaign?: string }[]

  const alreadySent = recipients.filter((r) => r.lastEmailCampaign === CAMPAIGN_ID).length
  if (!FORCE) recipients = recipients.filter((r) => r.lastEmailCampaign !== CAMPAIGN_ID)
  if (ONLY) recipients = recipients.filter((r) => r.email.toLowerCase() === ONLY.toLowerCase())
  if (LIMIT > 0) recipients = recipients.slice(0, LIMIT)

  console.log(`campaign        : ${CAMPAIGN_ID}`)
  console.log(`opted in        : ${rows.length}`)
  console.log(`already sent    : ${alreadySent}${FORCE ? " (ignored, --force)" : " (skipped)"}`)
  console.log(`will send to    : ${recipients.length}${ONLY ? `  (--only ${mask(ONLY)})` : ""}\n`)

  if (!recipients.length) { console.log("nothing to send."); return }
  if (DRY) {
    for (const r of recipients) console.log(`  ${mask(r.email)}`)
    console.log("\n— dry run, nothing sent —")
    return
  }

  let sent = 0, failed = 0
  for (const [i, r] of recipients.entries()) {
    const unsub = unsubscribeUrl(r.emailHash)
    const res = await sendEmail({
      to: r.email,
      subject: CONTENT.subject,
      html: buildHtml(CONTENT, unsub),
      text: buildText(CONTENT, unsub),
      emailHash: r.emailHash,
    })

    if (res.ok) {
      sent++
      await sanity.patch(r._id)
        .set({ lastEmailAt: new Date().toISOString(), lastEmailCampaign: CAMPAIGN_ID })
        .commit().catch(() => null)
      console.log(`✅ ${mask(r.email)}`)
    } else {
      failed++
      console.log(`❌ ${mask(r.email)} — ${res.error}`)
    }

    if (i < recipients.length - 1) await sleep(GAP_MS)
  }

  console.log(`\nsent ${sent} · failed ${failed}`)
}

main().catch((e) => { console.error("❌", e.message); process.exit(1) })
