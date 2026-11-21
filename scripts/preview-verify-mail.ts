/**
 * Write the registration email to a file so it can be looked at.
 *
 *   npx tsx scripts/preview-verify-mail.ts [out.html]
 *
 * Same function the route sends, so what opens in the browser is what lands
 * in the mailbox — minus the mail client's own quirks, which is why the
 * markup is tables and inline styles in the first place.
 */
import { writeFileSync } from "node:fs"
import { verifyMail, VERIFY_SUBJECT } from "../lib/account/verifyEmail"

const out = process.argv[2] ?? "verify-mail.preview.html"
const { html, text } = verifyMail(
  "ສົມຊາຍ",
  "https://www.laoforextrader.com/login/verify?t=3f9c1a7e2b8d4051.K2pQ7xR1nZ0vTbWm.9c41ab7e",
)

writeFileSync(out, html, "utf8")
console.log(`subject: ${VERIFY_SUBJECT}`)
console.log(`html:    ${out}`)
console.log("---- text part ----")
console.log(text)
