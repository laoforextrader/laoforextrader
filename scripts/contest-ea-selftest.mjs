// End-to-end check of the contest heartbeat endpoint, against production.
//
//   node --env-file=.env.local scripts/contest-ea-selftest.mjs [baseUrl]
//
// Creates a throwaway entry, posts heartbeats as the EA would (signed the
// same way), prints what came back, and deletes the entry again. It leaves
// nothing on the leaderboard: the entry exists for about two seconds and is
// removed in a finally block even if a check fails.
//
// What it proves: signature verification, the deposit and start-balance
// flags, the profit arithmetic, the ranking reply, and the rejection paths.

import { createClient } from "@sanity/client"
import { createHash } from "node:crypto"

const BASE = process.argv[2] ?? "https://www.laoforextrader.com"
const LOGIN = "999000111"          // not a real account; removed at the end
const CODE = "TESTCODE"

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-04-25",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const sign = (body, code) => createHash("sha256").update(body + code, "utf8").digest("hex")

let pass = 0, fail = 0
const check = (name, ok, detail = "") => {
  if (ok) { pass++; console.log("PASS  " + name) }
  else { fail++; console.log("FAIL  " + name + (detail ? "   " + detail : "")) }
}

async function post(bodyObj, { code = CODE, login = LOGIN, breakSign = false } = {}) {
  const body = JSON.stringify(bodyObj)
  const s = sign(body, code)
  const res = await fetch(BASE + "/api/ea/contest", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-rm-account": login,
      "x-rm-sign": breakSign ? s.replace(/.$/, s.endsWith("0") ? "1" : "0") : s,
    },
    body,
  })
  let json = null
  try { json = await res.json() } catch {}
  return { status: res.status, json }
}

const beat = (over = {}) => ({
  ts: Math.floor(Date.now() / 1000),
  acct: { login: Number(LOGIN), server: "Exness-MT5Trial7", currency: "USD", leverage: 500, symbol: "XAUUSDm" },
  money: { balance: 102_000, equity: 101_500, margin: 300, free: 101_200 },
  contest: { startBalance: 100_000, deposits: 0, withdrawals: 0, peakEquity: 102_500, maxDDPct: 3.1, trades: 412, lots: 18.4 },
  positions: { count: 6, lots: 0.21, floating: -500 },
  ...over,
})

const contest = await sanity.fetch(
  `*[_type == "contest" && status in ["register","live","judging"]] | order(startAt desc)[0]{ _id, title, startBalance }`
)
if (!contest) { console.log("no open round — run the seed script first"); process.exit(1) }
console.log("round: " + contest.title + "   start balance " + contest.startBalance + "\n")

const id = "contestEntry-selftest"
try {
  await sanity.createOrReplace({
    _id: id,
    _type: "contestEntry",
    contest: { _type: "reference", _ref: contest._id },
    entryNo: 9999,
    ownerEmail: "selftest@local",
    displayName: "selftest (temporary)",
    mtLogin: LOGIN,
    entryCode: CODE,
    status: "pending",
  })

  // 1 — a good heartbeat
  let r = await post(beat())
  check("accepts a correctly signed heartbeat", r.status === 200, "got " + r.status)
  check("profit = equity - start (1,500)", r.json?.profit === 1500, "got " + r.json?.profit)
  check("reply carries a rank", typeof r.json?.rank === "number", JSON.stringify(r.json))
  check("status becomes active", r.json?.status === "active", "got " + r.json?.status)

  // 2 — a bad signature
  r = await post(beat(), { breakSign: true })
  check("rejects a tampered signature", r.status === 401, "got " + r.status)

  // 3 — an unknown account
  r = await post(beat(), { login: "123456789" })
  check("rejects an unregistered login", r.status === 404, "got " + r.status)

  // 4 — a stale timestamp
  r = await post(beat({ ts: Math.floor(Date.now() / 1000) - 7200 }))
  check("rejects a two-hour-old timestamp", r.status === 400, "got " + r.status)

  // 5 — a demo top-up after the start
  r = await post(beat({
    money: { balance: 152_000, equity: 151_500, margin: 300, free: 151_200 },
    contest: { startBalance: 100_000, deposits: 50_000, withdrawals: 0, maxDDPct: 3.1, trades: 420, lots: 19 },
  }))
  check("a 50k top-up does not become profit", r.json?.profit === 1500, "got " + r.json?.profit)
  check("the deposit is flagged", r.json?.status === "flagged", "got " + r.json?.status)

  // 6 — the wrong starting balance
  r = await post(beat({
    contest: { startBalance: 10_000, deposits: 0, withdrawals: 0, maxDDPct: 1, trades: 1, lots: 0.1 },
  }))
  check("a wrong start balance is flagged", r.json?.status === "flagged", "got " + r.json?.status)

  // 7 — a blown account
  r = await post(beat({ money: { balance: 5_000, equity: 4_000, margin: 0, free: 4_000 } }))
  check("a blown account is marked blown", r.json?.status === "blown", "got " + r.json?.status)

  const saved = await sanity.fetch(`*[_id == $id][0]{ profit, status, trades, flags, series }`, { id })
  check("flags were stored", (saved?.flags?.length ?? 0) >= 2, JSON.stringify(saved?.flags?.map(f => f.kind)))
  check("equity curve was sampled", (JSON.parse(saved?.series ?? "[]")).length >= 1)
} finally {
  await sanity.delete(id).catch(() => {})
  console.log("\ntemporary entry deleted")
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
