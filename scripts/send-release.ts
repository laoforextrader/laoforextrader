/**
 * Tell members about a new EA build.
 *
 *   npx tsx scripts/send-release.ts --list              what is unsent
 *   npx tsx scripts/send-release.ts <id> --preview      write the HTML, send nothing
 *   npx tsx scripts/send-release.ts <id> --dry          list recipients, send nothing
 *   npx tsx scripts/send-release.ts <id> --test me@x.com
 *   npx tsx scripts/send-release.ts <id>                send it
 *
 * The release itself is written in Sanity (eaRelease), not here: what changed
 * is the owner's sentence, and a script is a bad place to keep prose that has
 * to be edited. This only addresses the envelope.
 *
 * Sending is recorded on the release document, so a crash halfway through
 * cannot mail the same version twice. --force overrides, for the case where a
 * send genuinely has to be repeated.
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

const SITE = "https://www.laoforextrader.com"

const NAMES: Record<string, string> = {
  sgrid: "TheRocket SGrid",
  sgridpro: "TheRocket SGrid Pro",
  megihedge: "TheRocket MegiHedge",
  hostgrid: "TheRocket HostGrid",
  semi: "TheRocket MegiSemi",
  contest: "Contest build",
}
const DL: Record<string, string> = {
  sgrid: "/ea-system/sgrid-download",
  sgridpro: "/ea-system/sgridpro-download",
  megihedge: "/ea-system/megihedge-download",
  semi: "/ea-system/semi-download",
}

const argv = process.argv.slice(2)
const flag = (f: string) => argv.includes(f)
const valueOf = (f: string) => {
  const i = argv.indexOf(f)
  return i >= 0 ? argv[i + 1] : ""
}
const id = argv.find(a => !a.startsWith("--") && argv[argv.indexOf(a) - 1]?.startsWith("--") !== true) ?? ""

const LIST = flag("--list")
const DRY = flag("--dry")
const PREVIEW = flag("--preview")
const FORCE = flag("--force")
const TEST = valueOf("--test")

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const mask = (e: string) => {
  const [u, d] = e.split("@")
  return `${u.slice(0, 2)}***@${d ?? ""}`
}

interface Rel {
  _id: string; eaId: string; version: string; releasedAt: string
  headline: string; added?: string[]; changed?: string[]; breaking?: string[]
  mailedAt?: string
}

/** The mail. Short on purpose: the full notes live on the site. */
function content(r: Rel): BroadcastContent {
  const name = NAMES[r.eaId] ?? r.eaId
  const url = SITE + (DL[r.eaId] ?? "/ea-system/updates")
  const lines: string[] = []
  //  Warnings first. Somebody skimming on a phone reads two lines, and if
  //  one of them has to be "your old setting is gone", it goes at the top.
  if (r.breaking?.length) lines.push("ຕ້ອງລະວັງ: " + r.breaking.join(" · "))
  if (r.added?.length) lines.push("ເພີ່ມໃໝ່: " + r.added.join(" · "))
  if (r.changed?.length) lines.push("ປ່ຽນແປງ: " + r.changed.join(" · "))

  return {
    subject: `${name} v${r.version} — ${r.headline}`,
    preheader: r.headline,
    heading: `${name} v${r.version}`,
    paragraphs: [r.headline, ...lines],
    feature: {
      kicker: "ອັບເດດ EA",
      title: `${name} v${r.version}`,
      paragraphs: [
        "ດາວໂຫຼດເວີຊັນໃໝ່ໄດ້ທີ່ໜ້າ EA — ຕ້ອງເຂົ້າສູ່ລະບົບ ແລະ ຍອມຮັບເງື່ອນໄຂກ່ອນ",
      ],
      stats: [
        { label: "ເວີຊັນ", value: "v" + r.version },
        { label: "ວັນທີ", value: String(r.releasedAt).slice(0, 10) },
      ],
      statsNote:
        "EA ນີ້ເປັນລະບົບ grid ທີ່ບໍ່ມີ Stop Loss ຕໍ່ໄມ້ ແລະ ສາມາດເສຍເງິນທັງບັນຊີໄດ້ — ໃຊ້ພຽງເງິນທີ່ຍອມເສຍໄດ້",
      cta: { label: "ເບິ່ງ ແລະ ດາວໂຫຼດ", url },
    },
  }
}

async function main() {
  if (!process.env.SANITY_API_TOKEN) throw new Error("SANITY_API_TOKEN missing")

  if (LIST || !id) {
    const rows = await sanity.fetch<Rel[]>(
      `*[_type == "eaRelease"] | order(releasedAt desc)[0...30]{
         _id, eaId, version, releasedAt, headline, mailedAt }`)
    console.log("\nid                                eaId        ver     mailed")
    for (const r of rows) {
      console.log(`${r._id.padEnd(33)} ${r.eaId.padEnd(11)} ${String(r.version).padEnd(7)} ${r.mailedAt ? r.mailedAt.slice(0, 10) : "— ຍັງບໍ່ສົ່ງ"}`)
    }
    console.log("\nใช้: npx tsx scripts/send-release.ts <id> [--dry|--preview|--test me@x.com]\n")
    return
  }

  const r = await sanity.fetch<Rel | null>(
    `*[_type == "eaRelease" && _id == $id][0]{
       _id, eaId, version, releasedAt, headline, added, changed, breaking, mailedAt }`,
    { id })
  if (!r) throw new Error("ไม่พบ release id นี้")
  if (r.mailedAt && !FORCE) {
    console.log(`release นี้ส่งไปแล้วเมื่อ ${r.mailedAt} — ใช้ --force ถ้าจะส่งซ้ำ`)
    return
  }

  const c = content(r)
  console.log(`release   : ${NAMES[r.eaId] ?? r.eaId} v${r.version}`)
  console.log(`subject   : ${c.subject}\n`)

  if (PREVIEW) {
    const out = "release-preview.html"
    writeFileSync(out, buildHtml(c, unsubscribeUrl("preview")), "utf8")
    console.log(`เขียน ${out} แล้ว — ไม่ได้ส่งอะไร`)
    return
  }

  if (TEST) {
    const res = await sendEmail({
      to: TEST, subject: c.subject,
      html: buildHtml(c, unsubscribeUrl("test")),
      text: buildText(c, unsubscribeUrl("test")),
      emailHash: "test",
    })
    console.log(res.ok ? `ส่งทดสอบไปที่ ${mask(TEST)} แล้ว` : `ล้มเหลว: ${res.error}`)
    return
  }

  //  Only people who asked for mail. A subscriber doc means somebody signed
  //  in once; emailOptIn is the only thing that means they want this.
  const rows = await sanity.fetch<any[]>(
    `*[_type == "subscriber" && emailOptIn == true && unsubscribed != true]{ _id, emailHash, emailEnc }`)
  const recipients = rows
    .map(x => { try { return { ...x, email: decryptPII(x.emailEnc) } } catch { return null } })
    .filter(Boolean) as { _id: string; emailHash: string; email: string }[]

  console.log(`ผู้รับ    : ${recipients.length}`)
  if (DRY) {
    for (const x of recipients) console.log("  " + mask(x.email))
    console.log("\n--dry: ไม่ได้ส่งอะไร")
    return
  }
  if (!recipients.length) { console.log("ไม่มีผู้รับ"); return }

  let sent = 0, failed = 0
  for (const x of recipients) {
    const res = await sendEmail({
      to: x.email, subject: c.subject,
      html: buildHtml(c, unsubscribeUrl(x.emailHash)),
      text: buildText(c, unsubscribeUrl(x.emailHash)),
      emailHash: x.emailHash,
    })
    if (res.ok) { sent++ } else { failed++; console.log(`  ล้ม ${mask(x.email)}: ${res.error}`) }
    //  Resend's free tier allows two a second.
    await new Promise(r2 => setTimeout(r2, 600))
  }

  await sanity.patch(r._id)
    .set({ mailedAt: new Date().toISOString(), mailedCount: sent })
    .commit()

  console.log(`\nส่งสำเร็จ ${sent} · ล้มเหลว ${failed}`)
}

main().catch(e => { console.error(e); process.exit(1) })
