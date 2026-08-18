// Email HTML is not web HTML. Tables for layout, inline styles only, no flex,
// no grid: Gmail strips <style> blocks and every webfont link, Outlook ignores
// half of CSS, and SVG does not render anywhere worth counting. So the logo and
// channel icons are PNGs served from the site, and Lao text falls back to
// whatever font the device has — the layout has to survive that.
//
// Text-first on purpose. An image-only mail is one of the oldest spam
// signatures there is, and this list is 100% Gmail.

export interface BroadcastStat {
  label: string
  value: string
}

export interface BroadcastContent {
  subject: string
  /** Grey text after the subject in the inbox list — wasted if left empty. */
  preheader: string
  heading: string
  paragraphs: string[]
  /** The product block below the greeting. Omit for a plain text-only send. */
  feature?: {
    kicker: string
    title: string
    paragraphs: string[]
    stats: BroadcastStat[]
    /** Small print under the numbers — where they come from, and the risk note. */
    statsNote?: string
    cta: { label: string; url: string }
  }
  signoff?: string
}

const BRAND = "#2563EB"
const SITE = "https://www.laoforextrader.com"
const FONT = "'Noto Sans Lao','Phetsarath OT','Saysettha OT',Arial,sans-serif"

// Absolute URLs: a mail client has no origin to resolve against.
const ASSET = `${SITE}/email`

const CHANNELS = [
  { name: "LINE", href: "https://line.me/R/ti/p/@499dvtuz", icon: `${ASSET}/line.png` },
  { name: "YouTube", href: "https://www.youtube.com/@MeeMuangsong", icon: `${ASSET}/youtube.png` },
  { name: "TikTok", href: "https://www.tiktok.com/@meemuangsong", icon: `${ASSET}/tiktok.png` },
  { name: "Facebook", href: "https://www.facebook.com/groups/Laoforextrader", icon: `${ASSET}/facebook.png` },
]

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const para = (text: string, color = "#374151", size = 15) =>
  `<p style="margin:0 0 14px;font-size:${size}px;line-height:1.85;color:${color};font-family:${FONT}">${esc(text)}</p>`

function statsTable(stats: BroadcastStat[]): string {
  // Two per row: four narrow columns collapse into unreadable slivers on a
  // phone, and email has no media queries worth trusting.
  const rows: string[] = []
  for (let i = 0; i < stats.length; i += 2) {
    const pair = stats.slice(i, i + 2)
    rows.push(
      `<tr>${pair
        .map(
          (s) => `<td width="50%" style="padding:6px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1730;border:1px solid #1E2A4F;border-radius:12px">
              <tr><td style="padding:12px 14px">
                <div style="font-size:11px;color:#8B95B5;font-family:${FONT};margin-bottom:5px">${esc(s.label)}</div>
                <div style="font-size:19px;font-weight:800;color:#4ADE80;font-family:Arial,sans-serif">${esc(s.value)}</div>
              </td></tr>
            </table>
          </td>`,
        )
        .join("")}</tr>`,
    )
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 14px">${rows.join("")}</table>`
}

function featureBlock(f: NonNullable<BroadcastContent["feature"]>): string {
  return `
  <tr><td style="padding:0 30px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B1020;border-radius:16px">
      <tr><td style="padding:24px 22px">
        <div style="font-size:11px;font-weight:700;color:#93C5FD;font-family:${FONT};letter-spacing:.06em;margin-bottom:8px">${esc(f.kicker)}</div>
        <div style="font-size:22px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;margin-bottom:12px">${esc(f.title)}</div>
        ${f.paragraphs.map((p) => para(p, "#A9B4D0", 14)).join("")}
        ${statsTable(f.stats)}
        ${f.statsNote ? `<p style="margin:0 0 18px;font-size:11px;line-height:1.7;color:#6B7699;font-family:${FONT}">${esc(f.statsNote)}</p>` : ""}
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:${BRAND}">
          <a href="${esc(f.cta.url)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:${FONT}">${esc(f.cta.label)}</a>
        </td></tr></table>
      </td></tr>
    </table>
  </td></tr>`
}

function channelRow(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr>${CHANNELS.map(
    (c) => `<td style="padding-right:10px">
      <a href="${c.href}"><img src="${c.icon}" width="34" height="34" alt="${c.name}" style="display:block;border:0;border-radius:10px"></a>
    </td>`,
  ).join("")}</tr></table>`
}

export function buildHtml(c: BroadcastContent, unsubUrl: string): string {
  return `<!doctype html>
<html lang="lo"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.subject)}</title></head>
<body style="margin:0;padding:0;background:#EDEEF2">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEEF2;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;border:1px solid #E2E6F0">

        <tr><td style="padding:28px 30px 0" align="center">
          <img src="${ASSET}/logo.png" width="54" height="54" alt="LaoForexTrader" style="display:block;border:0;border-radius:14px;margin-bottom:10px">
          <div style="font-size:15px;font-weight:800;color:${BRAND};font-family:Arial,sans-serif;letter-spacing:.4px">LaoForexTrader</div>
        </td></tr>

        <tr><td style="padding:24px 30px 0">
          <h1 style="margin:0 0 14px;font-size:21px;line-height:1.5;color:#111827;font-family:${FONT}">${esc(c.heading)}</h1>
          ${c.paragraphs.map((p) => para(p)).join("")}
        </td></tr>

        <tr><td style="padding:8px 30px 22px"><div style="height:1px;background:#F0F2F7"></div></td></tr>

        ${c.feature ? featureBlock(c.feature) : ""}

        <tr><td style="padding:24px 30px 0">
          <p style="margin:0;font-size:14px;line-height:1.85;color:#6B7280;font-family:${FONT}">${esc(c.signoff ?? "ຂອບໃຈທີ່ຕິດຕາມ 🙏")}</p>
        </td></tr>

        <tr><td style="padding:22px 30px 0">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#374151;font-family:${FONT}">ຕິດຕາມພວກເຮົາ</p>
          ${channelRow()}
        </td></tr>

        <tr><td style="padding:22px 30px 24px">
          <div style="height:1px;background:#F0F2F7;margin-bottom:16px"></div>
          <p style="margin:0 0 8px;font-size:12px;line-height:1.7;color:#9CA3AF;font-family:${FONT}">
            ທ່ານໄດ້ຮັບອີເມວນີ້ເພາະທ່ານອະນຸຍາດໃຫ້ພວກເຮົາສົ່ງຂ່າວສານທີ່ <a href="${SITE}" style="color:#6B7280">laoforextrader.com</a>
          </p>
          <p style="margin:0;font-size:12px;font-family:${FONT}">
            <a href="${esc(unsubUrl)}" style="color:#6B7280;text-decoration:underline">ຍົກເລີກຮັບອີເມວ</a>
          </p>
        </td></tr>

      </table>
      <p style="margin:16px 0 0;font-size:11px;line-height:1.8;color:#9CA3AF;font-family:${FONT};max-width:560px">
        ⚠ ຜົນງານທີ່ຜ່ານມາບໍ່ໄດ້ຮັບປະກັນຜົນໃນອະນາຄົດ · ການ Trade ມີຄວາມສ່ຽງ ອາດເສຍທຶນທັງໝົດ
      </p>
    </td></tr>
  </table>
</body></html>`
}

export function buildText(c: BroadcastContent, unsubUrl: string): string {
  const lines = [c.heading, "", ...c.paragraphs.flatMap((p) => [p, ""])]

  if (c.feature) {
    lines.push("—", "", c.feature.kicker, c.feature.title, "")
    lines.push(...c.feature.paragraphs.flatMap((p) => [p, ""]))
    lines.push(...c.feature.stats.map((s) => `  ${s.label}: ${s.value}`), "")
    if (c.feature.statsNote) lines.push(c.feature.statsNote, "")
    lines.push(`${c.feature.cta.label}: ${c.feature.cta.url}`, "")
  }

  lines.push(
    c.signoff ?? "ຂອບໃຈທີ່ຕິດຕາມ",
    "",
    "ຕິດຕາມພວກເຮົາ:",
    ...CHANNELS.map((ch) => `  ${ch.name}: ${ch.href}`),
    "",
    "—",
    `ທ່ານໄດ້ຮັບອີເມວນີ້ເພາະທ່ານອະນຸຍາດໃຫ້ພວກເຮົາສົ່ງຂ່າວສານທີ່ ${SITE}`,
    `ຍົກເລີກຮັບອີເມວ: ${unsubUrl}`,
    "",
    "⚠ ຜົນງານທີ່ຜ່ານມາບໍ່ໄດ້ຮັບປະກັນຜົນໃນອະນາຄົດ · ການ Trade ມີຄວາມສ່ຽງ",
  )

  return lines.join("\n")
}
