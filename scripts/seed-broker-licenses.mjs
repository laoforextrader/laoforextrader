#!/usr/bin/env node
/**
 * One-off seed: licence records and company facts for the six brokers that
 * already have docs, researched 2026-11-04.
 *
 * Run:  node scripts/seed-broker-licenses.mjs            # dry run, prints the patch
 *       node scripts/seed-broker-licenses.mjs --write    # actually writes
 *
 * Needs SANITY_API_TOKEN (it is in .env.local).
 *
 * ── What this deliberately does NOT write ────────────────────────────────
 * spreadFrom, commission, withdrawalSpeed, depositMethods, phone, email and
 * reviewedAt are left empty on purpose. The review pages tell readers that an
 * empty slot means "we have not tested or verified this yet", so filling them
 * from marketing copy or from affiliate blogs would make that sentence false.
 * Spread and withdrawal speed come from your own test account; phone and
 * email come from each broker's affiliate manager, who is a better source
 * than anything on the open web.
 *
 * ── Confidence ───────────────────────────────────────────────────────────
 * Every number below appeared in at least two independent places, or on the
 * broker's own regulation page. Two carry caveats, marked inline. Check each
 * against the regulator's public register before you treat the page as final:
 *   CySEC   https://www.cysec.gov.cy/en-GB/entities/investment-firms/
 *   ASIC    https://connectonline.asic.gov.au/
 *   FCA     https://register.fca.org.uk/
 *   FSC BZ  https://www.ifsc.gov.bz/
 *   FSC MU  https://www.fscmauritius.org/
 *   BVI FSC https://www.bvifsc.vg/
 *   CIMA    https://www.cima.ky/
 */

import { createClient } from "@sanity/client"
import { readFileSync, existsSync } from "node:fs"

// .env.local is not loaded for a bare node script, so read it directly.
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

const L = (regulator, country, licenseNo, entity, extra = {}) => ({
  _type: "object",
  _key: `${regulator}-${country}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  regulator,
  country,
  licenseNo,
  entity,
  isRepresentative: false,
  ...extra,
})

const DATA = {
  "xm-global": {
    founded: 2009,
    registeredIn: "cy",
    registeredCity: "ລີມາຊອລ",
    websiteLabel: "www.xm.com",
    licenses: [
      L("CySEC", "cy", "120/10", "Trading Point of Financial Instruments Ltd"),
      L("ASIC", "au", "AFSL 443670", "Trading Point of Financial Instruments Pty Ltd"),
      // XM's own regulation page gives 000261/27 under the Securities
      // Industry Act 2021. Older third-party pages still print the retired
      // IFSC/60/354/TS/19 — worth confirming on the Belize register.
      L("FSC", "bz", "000261/27", "XM Global Limited"),
    ],
  },

  exness: {
    founded: 2008,
    registeredIn: "cy",
    registeredCity: "ລີມາຊອລ",
    websiteLabel: "www.exness.com",
    licenses: [
      L("FCA", "gb", "730729", "Exness UK Ltd"),
      L("CySEC", "cy", "178/12", "Exness (Cy) Ltd"),
      L("FSA", "sc", "SD025", "Exness (SC) Ltd"),
      L("CBCS", "cw", "0003LSI", "Exness B.V."),
    ],
  },

  vantage: {
    founded: 2009,
    registeredIn: "au",
    registeredCity: "ຊິດນີ",
    websiteLabel: "www.vantagemarkets.com",
    licenses: [
      L("ASIC", "au", "AFSL 428901", "Vantage Global Prime Pty Ltd"),
      L("CIMA", "ky", "SIBL 1383491", "Vantage International Group Ltd"),
      L("FSCA", "za", "51268", "Vantage Markets (Pty) Ltd"),
      L("VFSC", "vu", "700271", "Vantage Global Ltd"),
    ],
  },

  markets4you: {
    founded: 2007,
    registeredIn: "vg",
    websiteLabel: "www.markets4you.com",
    licenses: [
      L("BVI FSC", "vg", "SIBA/L/12/1027", "E-Global Trade & Finance Group, Inc."),
      L("FSC", "mu", "GB21026460", "Trade4you International"),
    ],
  },

  iux: {
    founded: 2016,
    registeredIn: "mu",
    registeredCity: "Ebene Cybercity",
    websiteLabel: "www.iux.com",
    licenses: [L("FSC", "mu", "GB22200605", "IUX Markets (MU) Ltd")],
  },

  "interstellar-group": {
    // No founding year survived checking, so it stays empty rather than
    // taking the "2020" that review sites repeat without a source.
    websiteLabel: "www.isgfx.com",
    licenses: [
      // 001312025 is an ASIC Authorised Representative number, NOT an AFSL.
      // Several directories print it beside an ASIC logo as though the
      // company held the licence itself; it does not.
      L("ASIC", "au", "AR 001312025", "ຜູ້ຕາງໜ້າທີ່ໄດ້ຮັບອະນຸຍາດ — ບໍ່ແມ່ນຜູ້ຖືໃບ AFSL", {
        isRepresentative: true,
      }),
      // FSA Seychelles SD127 appears only on one promotional network, so the
      // regulator is recorded without a number until the register confirms it.
      L("FSA", "sc", undefined, undefined),
    ],
  },
}

const write = process.argv.includes("--write")

const docs = await client.fetch(
  `*[_type == "broker"]{ _id, name, "slug": slug.current, minDeposit, minDepositUsd }`,
)

let planned = 0
for (const doc of docs) {
  const data = DATA[doc.slug]
  if (!data) {
    console.log(`· ${doc.slug}: no researched data, skipped`)
    continue
  }

  const patch = { ...data }

  // Migrate the legacy free-text minimum into the sortable number. Only when
  // the number is absent: a value typed in Studio always wins.
  if (typeof doc.minDepositUsd !== "number") {
    const n = Number(String(doc.minDeposit ?? "").replace(/[^0-9.]/g, ""))
    if (Number.isFinite(n) && n > 0) patch.minDepositUsd = n
  }

  planned++
  console.log(
    `${write ? "→" : "·"} ${doc.name} (${doc.slug}): ` +
      `${patch.licenses.length} licences` +
      (patch.founded ? `, founded ${patch.founded}` : ", founded —") +
      (patch.minDepositUsd ? `, minDepositUsd ${patch.minDepositUsd}` : ""),
  )

  if (write) {
    await client.patch(doc._id).set(patch).commit()
  }
}

console.log(
  write
    ? `\nWrote ${planned} broker docs.`
    : `\nDry run — ${planned} docs would be written. Re-run with --write to apply.`,
)
