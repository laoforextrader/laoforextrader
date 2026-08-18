/**
 * Send one campaign to everyone who asked for mail.
 *
 * Who gets it: `emailOptIn == true && unsubscribed != true`. Nothing else.
 * Having a subscriber doc is not consent — most of them exist because someone
 * signed in with Google to leave a comment.
 *
 *   npx tsx scripts/send-newsletter.ts --preview          write the HTML to a file, send nothing
 *   npx tsx scripts/send-newsletter.ts --dry              list recipients, send nothing
 *   npx tsx scripts/send-newsletter.ts --test me@x.com    send one real message anywhere
 *   npx tsx scripts/send-newsletter.ts --only me@x.com    send to one address from the list
 *   npx tsx scripts/send-newsletter.ts                    send to the whole opted-in list
 *
 * Re-running is safe: anyone already marked with this campaign is skipped, so a
 * crash halfway through resumes rather than double-sending. --force overrides.
 */
import { createClient } from "@sanity/client"
import { readFileSync, writeFileSync } from "node:fs"

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z_0-9]+)=(.*)$/.exec(line.trim())
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

import { blindIndex, decryptPII } from "../lib/pii"
import { unsubscribeUrl } from "../lib/newsletter/tokens"
import { buildHtml, buildText, type BroadcastContent } from "../lib/newsletter/templates/broadcast"
import { sendEmail } from "../lib/newsletter/send"

// ── the campaign ──────────────────────────────────────────────────────────
// `id` is what makes a re-run idempotent — change it for a genuinely new send,
// keep it to resume an interrupted one.
const CAMPAIGN_ID = "sgrid-free-2026-08"

const DOWNLOAD_URL = "https://www.laoforextrader.com/ea-system/sgrid-download"

/**
 * Numbers come from the live EA doc rather than being typed in, so the mail
 * cannot quietly drift from what the site shows on the same day.
 */
function buildContent(ea: EaSnapshot): BroadcastContent {
  return {
    subject: "ຂອບໃຈທີ່ເປັນສະມາຊິກ — ຮັບ TheRocket EA SGrid ຟຣີ",
    preheader: `EA ທີ່ Trade ຈິງມາ ${ea.monthCount} ເດືອນ ບວກທຸກເດືອນ — ດຽວນີ້ເປີດໃຫ້ທຸກຄົນແລ້ວ`,

    heading: "ຂອບໃຈທີ່ເປັນສະມາຊິກຂອງພວກເຮົາ 🙏",
    paragraphs: [
      "ສະບາຍດີ! ຂອບໃຈທີ່ເປັນສະມາຊິກ LaoForexTrader ແລະ ຕິດຕາມພວກເຮົາມາຕະຫຼອດ.",
      "ພວກເຮົາຕັ້ງໃຈເຮັດຂ່າວ, ບົດວິເຄາະ ແລະ ເຄື່ອງມືເປັນພາສາລາວ ເພື່ອໃຫ້ Trader ລາວມີຂໍ້ມູນທີ່ດີເທົ່າກັບຄົນອື່ນ.",
      "ມື້ນີ້ພວກເຮົາມີຂອງດີມາຝາກທ່ານ.",
    ],

    feature: {
      kicker: "EA ທີ່ດີທີ່ສຸດຂອງພວກເຮົາ",
      title: "TheRocket EA SGrid",
      paragraphs: [
        `Grid EA ທີ່ພວກເຮົາຮັນຢູ່ໃນບັນຊີຈິງທີ່ ${ea.broker} ບໍ່ແມ່ນ Backtest.`,
        `${ea.monthCount} ເດືອນທີ່ຜ່ານມາ ບວກທຸກເດືອນ ບໍ່ມີເດືອນໃດຕິດລົບ.`,
        "ດຽວນີ້ພວກເຮົາເປີດໃຫ້ທຸກຄົນເອົາໄປທົດສອບ ແລະ ໃຊ້ຈິງແລ້ວ ຕາມເງື່ອນໄຂຂອງພວກເຮົາ.",
      ],
      stats: [
        { label: "ກຳໄລລວມ", value: ea.totalPct },
        { label: "ເດືອນທີ່ບວກ", value: `${ea.positiveMonths}/${ea.monthCount}` },
        { label: "ເດືອນດີສຸດ", value: ea.bestMonth },
        { label: "ເດືອນຕ່ຳສຸດ", value: ea.worstMonth },
      ],
      statsNote: "ຕົວເລກດຶງມາຈາກບັນຊີຈິງໂດຍກົງ ອັບເດດອັດຕະໂນມັດ · ຜົນທີ່ຜ່ານມາບໍ່ໄດ້ຮັບປະກັນຜົນໃນອະນາຄົດ",
      cta: { label: "ເບິ່ງລາຍລະອຽດ ແລະ ຮັບ EA ຟຣີ", url: DOWNLOAD_URL },
    },

    signoff: "ຖ້າມີຄຳຖາມ ຕອບກັບອີເມວນີ້ໄດ້ເລີຍ ພວກເຮົາອ່ານທຸກສະບັບ — ທີມງານ LaoForexTrader",
  }
}
// ──────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const has = (f: string) => args.includes(f)
const valueOf = (f: string) => {
  const i = args.indexOf(f)
  return i >= 0 ? args[i + 1] : undefined
}

const PREVIEW = has("--preview")
const DRY = has("--dry")
const FORCE = has("--force")
const ONLY = valueOf("--only")
const TEST = valueOf("--test")
const LIMIT = Number(valueOf("--limit") ?? 0)

// Resend's free tier allows 2 requests a second.
const GAP_MS = 600
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const mask = (e: string) => {
  const [u, d] = e.split("@")
  return `${u.slice(0, 2)}***@${d}`
}

const sanity = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

interface EaSnapshot {
  broker: string
  totalPct: string
  monthCount: number
  positiveMonths: number
  bestMonth: string
  worstMonth: string
}

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`

/** Falls back to the figures published on the site if the doc is unreachable. */
async function eaSnapshot(): Promise<EaSnapshot> {
  const fallback: EaSnapshot = {
    broker: "Markets4you",
    totalPct: "+633%",
    monthCount: 12,
    positiveMonths: 12,
    bestMonth: "+143%",
    worstMonth: "+4.5%",
  }
  try {
    const ea = await sanity.fetch<any>(
      `*[_type == "eaStats" && eaId == "sgride"][0]{ broker, profitTotalPct, monthlyReturns[]{ profitPct } }`,
    )
    const values: number[] = (ea?.monthlyReturns ?? [])
      .map((m: any) => m?.profitPct)
      .filter((v: any) => typeof v === "number")
    if (!ea || !values.length || typeof ea.profitTotalPct !== "number") return fallback

    return {
      broker: ea.broker ?? fallback.broker,
      totalPct: pct(ea.profitTotalPct),
      monthCount: values.length,
      positiveMonths: values.filter((v) => v > 0).length,
      bestMonth: pct(Math.max(...values)),
      worstMonth: pct(Math.min(...values)),
    }
  } catch {
    return fallback
  }
}

async function main() {
  const ea = await eaSnapshot()
  const CONTENT = buildContent(ea)

  console.log(`EA figures      : ${CONTENT.feature?.stats.map((s) => `${s.label} ${s.value}`).join(" · ")}\n`)

  if (PREVIEW) {
    const url = unsubscribeUrl("0".repeat(32))
    writeFileSync("newsletter-preview.html", buildHtml(CONTENT, url), "utf8")
    console.log("📄 newsletter-preview.html — open it in a browser\n")
    console.log("── plain text part ──\n")
    console.log(buildText(CONTENT, url))
    return
  }

  if (!DRY && !process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY missing")

  // --test goes to an address that need not be a subscriber at all: proving the
  // domain is authenticated, and feeding mail-tester.com its throwaway address,
  // both have to happen before anyone has opted in.
  if (TEST) {
    const hash = blindIndex(TEST.trim().toLowerCase(), "subscriber")
    const unsub = unsubscribeUrl(hash)
    const res = await sendEmail({
      to: TEST,
      subject: CONTENT.subject,
      html: buildHtml(CONTENT, unsub),
      text: buildText(CONTENT, unsub),
      emailHash: hash,
    })
    console.log(res.ok ? `✅ test sent to ${mask(TEST)} — id ${res.id}` : `❌ ${res.error}`)
    if (!res.ok) process.exit(1)
    return
  }

  if (!process.env.SANITY_API_TOKEN) throw new Error("SANITY_API_TOKEN missing")

  const rows = await sanity.fetch<any[]>(
    `*[_type == "subscriber" && emailOptIn == true && unsubscribed != true]{ _id, emailHash, emailEnc, lastEmailCampaign }`,
  )

  let recipients = rows
    .map((r) => {
      try {
        return { ...r, email: decryptPII(r.emailEnc) }
      } catch {
        return null
      }
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

  if (!recipients.length) {
    console.log("nothing to send.")
    return
  }
  if (DRY) {
    for (const r of recipients) console.log(`  ${mask(r.email)}`)
    console.log("\n— dry run, nothing sent —")
    return
  }

  let sent = 0
  let failed = 0
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
      await sanity
        .patch(r._id)
        .set({ lastEmailAt: new Date().toISOString(), lastEmailCampaign: CAMPAIGN_ID })
        .commit()
        .catch(() => null)
      console.log(`✅ ${mask(r.email)}`)
    } else {
      failed++
      console.log(`❌ ${mask(r.email)} — ${res.error}`)
    }

    if (i < recipients.length - 1) await sleep(GAP_MS)
  }

  console.log(`\nsent ${sent} · failed ${failed}`)
}

main().catch((e) => {
  console.error("❌", e.message)
  process.exit(1)
})
