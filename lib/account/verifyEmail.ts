//  The registration email, kept apart from the route that sends it.
//
//  Two reasons it is its own file: the route should read as "validate, save,
//  mail" rather than as a page of table markup, and a template nobody can
//  look at before it goes out is a template nobody checks. Rendering it is
//  now one command — scripts/preview-verify-mail.ts writes the HTML to a
//  file you open in a browser.
//
//  Tables and inline styles on purpose. Mail clients are a decade behind a
//  browser: Outlook ignores flexbox, Gmail strips <style> blocks, and a
//  layout that depends on either arrives as a column of naked text.

export interface MailParts { subject: string; html: string; text: string }

export const VERIFY_SUBJECT = "ຢືນຢັນການສະໝັກ · LaoForexTrader"

/** Strip the characters that would let a name break out of the markup. */
const safe = (s: string) => s.replace(/[<>&"]/g, "")

export function verifyMail(name: string, url: string): MailParts {
  const who = safe(name)
  const href = safe(url)

  const html = `<!doctype html>
<html lang="lo"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${VERIFY_SUBJECT}</title></head>
<body style="margin:0;background:#F1F5F9;padding:28px 14px;font-family:'Noto Sans Lao','Phetsarath OT',Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
  <tr><td style="padding:30px 30px 0">
    <span style="display:inline-block;width:34px;height:34px;border-radius:9px;background:#2563EB;color:#ffffff;font:800 14px/34px Arial,sans-serif;text-align:center">LFT</span>
  </td></tr>
  <tr><td style="padding:18px 30px 0;font-size:21px;font-weight:800;color:#0F172A">ຢືນຢັນການສະໝັກ</td></tr>
  <tr><td style="padding:12px 30px 0;font-size:14px;line-height:1.9;color:#334155">
    ສະບາຍດີ ${who} — ກົດປຸ່ມລຸ່ມນີ້ເພື່ອຢືນຢັນອີເມວ ແລະ ເຂົ້າສູ່ລະບົບ.
    ລິງກ໌ນີ້ໃຊ້ໄດ້ <b>ຄັ້ງດຽວ</b> ພາຍໃນ <b>24 ຊົ່ວໂມງ</b>.
  </td></tr>
  <tr><td style="padding:22px 30px 0">
    <a href="${href}" style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 26px;border-radius:10px">ຢືນຢັນ ແລະ ເຂົ້າສູ່ລະບົບ</a>
  </td></tr>
  <tr><td style="padding:20px 30px 0;font-size:12px;line-height:1.8;color:#64748B">
    ຖ້າປຸ່ມກົດບໍ່ໄດ້ ໃຫ້ກັອບລິງກ໌ນີ້ໃສ່ບຣາວເຊີ:<br>
    <span style="color:#2563EB;word-break:break-all">${href}</span>
  </td></tr>
  <tr><td style="padding:22px 30px 0">
    <div style="border-top:1px solid #E2E8F0"></div>
  </td></tr>
  <tr><td style="padding:16px 30px 30px;font-size:11.5px;line-height:1.8;color:#94A3B8">
    ຖ້າທ່ານບໍ່ໄດ້ສະໝັກ ບໍ່ຕ້ອງເຮັດຫຍັງ — ບໍ່ມີບັນຊີໃດຖືກເປີດຈົນກວ່າລິງກ໌ນີ້ຖືກກົດ.<br>
    LaoForexTrader · laoforextrader@gmail.com
  </td></tr>
</table>
</td></tr></table></body></html>`

  const text = [
    `ສະບາຍດີ ${who}`,
    "",
    "ຢືນຢັນອີເມວ ແລະ ເຂົ້າສູ່ລະບົບ:",
    url,
    "",
    "ລິງກ໌ໃຊ້ໄດ້ຄັ້ງດຽວ ພາຍໃນ 24 ຊົ່ວໂມງ.",
    "ຖ້າທ່ານບໍ່ໄດ້ສະໝັກ ບໍ່ຕ້ອງເຮັດຫຍັງ.",
    "",
    "LaoForexTrader · laoforextrader@gmail.com",
  ].join("\n")

  return { subject: VERIFY_SUBJECT, html, text }
}
