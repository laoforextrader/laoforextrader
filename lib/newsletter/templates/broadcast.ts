// Email HTML is not web HTML. Tables, inline styles, no external stylesheet —
// Gmail strips <style> blocks and every webfont link, so Lao text falls back to
// whatever the device has. That is fine on Lao phones and the reason the layout
// must survive a font swap without breaking.
//
// Deliberately text-first: an image-only mail is one of the oldest spam
// signatures there is, and this list is 100% Gmail.

export interface BroadcastContent {
  subject: string
  /** Grey text after the subject in the inbox list — wasted if left empty. */
  preheader: string
  heading: string
  paragraphs: string[]
  cta?: { label: string; url: string }
  signoff?: string
}

const BRAND = "#2563EB"
const SITE = "https://www.laoforextrader.com"
const FONT = "'Noto Sans Lao','Phetsarath OT','Saysettha OT',Arial,sans-serif"

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

export function buildHtml(c: BroadcastContent, unsubUrl: string): string {
  const paragraphs = c.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.85;color:#374151;font-family:${FONT}">${esc(p)}</p>`,
    )
    .join("")

  const cta = c.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0"><tr><td style="border-radius:10px;background:${BRAND}">
         <a href="${esc(c.cta.url)}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:${FONT}">${esc(c.cta.label)}</a>
       </td></tr></table>`
    : ""

  return `<!doctype html>
<html lang="lo"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.subject)}</title></head>
<body style="margin:0;padding:0;background:#EDEEF2">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEEF2;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;border:1px solid #E2E6F0">
        <tr><td style="padding:26px 30px 0">
          <span style="font-size:15px;font-weight:800;color:${BRAND};font-family:Arial,sans-serif;letter-spacing:.5px">LaoForexTrader</span>
        </td></tr>
        <tr><td style="padding:18px 30px 0">
          <h1 style="margin:0 0 16px;font-size:21px;line-height:1.5;color:#111827;font-family:${FONT}">${esc(c.heading)}</h1>
          ${paragraphs}
          ${cta}
        </td></tr>
        <tr><td style="padding:0 30px 26px">
          <p style="margin:0;font-size:14px;line-height:1.8;color:#6B7280;font-family:${FONT}">${esc(c.signoff ?? "ຂອບໃຈທີ່ຕິດຕາມ 🙏")}</p>
        </td></tr>
        <tr><td style="padding:18px 30px 24px;border-top:1px solid #F3F4F6">
          <p style="margin:0 0 8px;font-size:12px;line-height:1.7;color:#9CA3AF;font-family:${FONT}">
            ທ່ານໄດ້ຮັບອີເມວນີ້ເພາະທ່ານອະນຸຍາດໃຫ້ພວກເຮົາສົ່ງຂ່າວສານທີ່ <a href="${SITE}" style="color:#6B7280">laoforextrader.com</a>
          </p>
          <p style="margin:0;font-size:12px;font-family:${FONT}">
            <a href="${esc(unsubUrl)}" style="color:#6B7280;text-decoration:underline">ຍົກເລີກຮັບອີເມວ</a>
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#9CA3AF;font-family:${FONT}">⚠ ການລົງທຶນມີຄວາມສ່ຽງ · ໃຊ້ຂໍ້ມູນດ້ວຍຄວາມລະມັດລະວັງ</p>
    </td></tr>
  </table>
</body></html>`
}

export function buildText(c: BroadcastContent, unsubUrl: string): string {
  return [
    c.heading,
    "",
    ...c.paragraphs.flatMap((p) => [p, ""]),
    ...(c.cta ? [`${c.cta.label}: ${c.cta.url}`, ""] : []),
    c.signoff ?? "ຂອບໃຈທີ່ຕິດຕາມ",
    "",
    "—",
    `ທ່ານໄດ້ຮັບອີເມວນີ້ເພາະທ່ານອະນຸຍາດໃຫ້ພວກເຮົາສົ່ງຂ່າວສານທີ່ ${SITE}`,
    `ຍົກເລີກຮັບອີເມວ: ${unsubUrl}`,
  ].join("\n")
}
