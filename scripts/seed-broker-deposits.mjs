#!/usr/bin/env node
/**
 * One-off seed: the deposit and withdrawal CHANNELS for the six brokers.
 *
 * Run:  node scripts/seed-broker-deposits.mjs            # dry run
 *       node scripts/seed-broker-deposits.mjs --write
 *
 * ── Where these come from ────────────────────────────────────────────────
 * Each broker's own pros/cons already in its Sanity doc, written by the site
 * owner — not from the open web:
 *
 *   XM Global          laoDeposit: true
 *   Markets4you        "ຮອງຮັບ Lao Bank ແລະ Lao Bank USD"
 *   Exness             "ຝາກ Lao Bank ໄດ້ສະເພາະ USD"
 *   Interstellar       "ຮອງຮັບຝາກ-ຖອນ Lao Bank"
 *   Vantage            "ຝາກ-ຖອນ Lao Bank ບໍ່ໄດ້ ໃຊ້ Crypto ເທົ່ານັ້ນ"
 *   IUX                "ຮອງຮັບຝາກ-ຖອນ Lao Bank"
 *
 * Only the channel and its currency are written. `time` and `fee` are left
 * empty on purpose: the page states that an empty slot means untested, and
 * those two can only come from a real deposit and a real withdrawal. They
 * render as dashed "ຍັງບໍ່ມີຂໍ້ມູນ" slots, which doubles as the to-do list.
 *
 * Safe to re-run: a broker that already has depositMethods is skipped, so
 * anything typed in Studio is never overwritten.
 */

import { createClient } from "@sanity/client"
import { readFileSync, existsSync } from "node:fs"

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}

const token = process.env.SANITY_API_TOKEN
if (!token) {
  console.error("SANITY_API_TOKEN is missing — add it to .env.local")
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f8cr9afb",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-04-25",
  token,
  useCdn: false,
})

const M = (name, currency) => ({
  _type: "object",
  _key: `${name}-${currency}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40),
  name,
  currency,
})

const LAO_KIP = M("ທະນາຄານລາວ (ເງິນກີບ)", "LAK")
const LAO_USD = M("ທະນາຄານລາວ (USD)", "USD")
const CARD = M("ບັດ Visa / Mastercard", "USD")
const CRYPTO = M("Crypto (USDT)", "USDT")

const DATA = {
  "xm-global": [LAO_KIP, LAO_USD, CARD, CRYPTO],
  markets4you: [LAO_KIP, LAO_USD, CARD, CRYPTO],
  exness: [LAO_USD, CARD, CRYPTO],
  "interstellar-group": [LAO_KIP, LAO_USD, CRYPTO],
  vantage: [CRYPTO, CARD],
  iux: [LAO_KIP, LAO_USD, CRYPTO],
}

const write = process.argv.includes("--write")

// count() counts the nulls Sanity leaves behind when a row is added in Studio
// and never filled, so it reports "has data" for an array of blanks. Pull the
// rows and judge them the way the page does.
const docs = await client.fetch(
  `*[_type == "broker"]{ _id, name, "slug": slug.current, depositMethods }`,
)

const usable = (xs) => (xs ?? []).filter((m) => m && (m.name || m.currency)).length

let planned = 0
for (const doc of docs) {
  const methods = DATA[doc.slug]
  if (!methods) {
    console.log(`· ${doc.slug}: no researched channels, skipped`)
    continue
  }
  const have = usable(doc.depositMethods)
  if (have > 0) {
    console.log(`· ${doc.name}: already has ${have} real channels, left alone`)
    continue
  }

  planned++
  console.log(
    `${write ? "→" : "·"} ${doc.name}: ${methods.length} channels — ` +
      methods.map((m) => m.currency).join(", "),
  )
  if (write) await client.patch(doc._id).set({ depositMethods: methods }).commit()
}

console.log(
  write
    ? `\nWrote ${planned} broker docs. Withdrawal times and fees stay empty until tested.`
    : `\nDry run — ${planned} docs would be written. Re-run with --write to apply.`,
)
