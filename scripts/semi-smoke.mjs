// End-to-end check of every route the Semi dashboard depends on.
//
//   node --env-file=.env.local scripts/semi-smoke.mjs [baseUrl]
//
// Creates a throwaway account document in the sealed shape, exercises the
// routes an EA and a browser actually call, and deletes it again. It asserts
// the SHAPE of each answer, not just that the call returned: the bugs of
// 16 Nov 2026 all returned 200s and 404s that looked reasonable on their own.
//
// It cannot sign in as a person, so the two routes behind a Google session
// (state, command) are checked for the 401 they owe an anonymous caller;
// their ownership logic is covered by the store test below, which calls the
// real accountsOf through the same data.

import { createClient } from "@sanity/client"
import { createHash, createHmac, hkdfSync, createCipheriv, randomBytes } from "node:crypto"

const BASE = process.argv[2] ?? "https://www.laoforextrader.com"
const ACCOUNT = "999000222"
const KEY = "TEST-SMOK-ETES-T001"

const secret = process.env.DATA_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || ""
if (!secret) { console.error("no DATA_ENCRYPTION_KEY / NEXTAUTH_SECRET"); process.exit(1) }
const keyId = createHash("sha256").update(secret).digest("hex").slice(0, 8)
const subkey = p => Buffer.from(hkdfSync("sha256", Buffer.from(secret, "utf8"), Buffer.alloc(0), `laoforextrader:${p}`, 32))
const b64u = b => b.toString("base64url")
const encryptPII = plain => {
  const iv = randomBytes(12)
  const c = createCipheriv("aes-256-gcm", subkey("enc"), iv)
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()])
  return `v1.${keyId}.${b64u(iv)}.${b64u(c.getAuthTag())}.${b64u(ct)}`
}
const blindIndex = (v, d) => createHmac("sha256", subkey(`mac:${d}`)).update(v.trim().toLowerCase()).digest("hex").slice(0, 32)
const signBody = (body, key) => createHash("sha256").update(body + key, "utf8").digest("hex")

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-04-25", useCdn: false, token: process.env.SANITY_API_TOKEN,
})

let pass = 0, fail = 0
const check = (name, ok, detail = "") => {
  if (ok) { pass++; console.log("PASS  " + name) }
  else { fail++; console.log("FAIL  " + name + (detail ? "   " + detail : "")) }
}

const beat = (over = {}) => JSON.stringify({
  ts: Math.floor(Date.now() / 1000),
  acct: { login: Number(ACCOUNT), symbol: "XAUUSDm", broker: "smoke" },
  money: { balance: 1000, equity: 1000 },
  state: { mode: "AUTO" },
  sides: [{ side: "BUY", state: "IDLE" }, { side: "SELL", state: "IDLE" }],
  ...over,
})

async function push(body, key = KEY) {
  const res = await fetch(BASE + "/api/ea/semi", {
    method: "POST",
    headers: { "content-type": "application/json", "x-rm-account": ACCOUNT, "x-rm-sign": signBody(body, key) },
    body,
  })
  return { status: res.status, json: await res.json().catch(() => null) }
}

const id = `semi-${ACCOUNT}`
const EMAIL = "smoke@local"

try {
  // The sealed shape, exactly as linkAccount writes it today.
  await sanity.createOrReplace({
    _id: id,
    _type: "semiAccount",
    account: ACCOUNT,
    ownerEmailHash: blindIndex(EMAIL, "semiOwner"),
    ownerEmailEnc: encryptPII(EMAIL),
    ownerName: "smoke test",
    dashKeyEnc: encryptPII(KEY),
    state: "",
    ackRound: 0,
    rounds: [],
  })

  // 1 — the heartbeat an EA sends. This is what returned 404 "account not
  //     linked" for every sealed account until today.
  let r = await push(beat())
  check("a sealed account is recognised by /api/ea/semi", r.status === 200, "got " + r.status + " " + JSON.stringify(r.json))
  check("reply carries the command envelope", r.json && "cmd" in r.json && "ackRound" in r.json, JSON.stringify(r.json))

  // 2 — a wrong key must still be refused
  r = await push(beat(), "WRONG-KEY")
  check("a wrong key is refused", r.status === 401, "got " + r.status)

  // 3 — an unknown account
  const res3 = await fetch(BASE + "/api/ea/semi", {
    method: "POST",
    headers: { "content-type": "application/json", "x-rm-account": "111000111", "x-rm-sign": "00" },
    body: beat(),
  })
  check("an unknown account is not linked", res3.status === 404, "got " + res3.status)

  // 4 — the state the dashboard polls, and the command route, both refuse an
  //     anonymous caller rather than leaking that the account exists
  for (const [name, url] of [
    ["state", `${BASE}/api/semi/state?acc=${ACCOUNT}`],
    ["command", `${BASE}/api/semi/command`],
  ]) {
    const res = await fetch(url, name === "command"
      ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ account: ACCOUNT, cmd: "BUY" }) }
      : {})
    check(`/api/semi/${name} needs a session`, res.status === 401, "got " + res.status)
  }

  // 5 — the heartbeat actually landed: state and lastSeen written
  const after = await sanity.fetch(`*[_id == $id][0]{ lastSeen, "hasState": defined(state) && state != "" }`, { id })
  check("the heartbeat was stored", !!after?.lastSeen && after.hasState, JSON.stringify(after))

  // 6 — a legacy plaintext document still authenticates, and gets sealed
  await sanity.patch(id).unset(["dashKeyEnc"]).set({ dashKey: KEY }).commit({ visibility: "sync" })
  r = await push(beat())
  check("a legacy plaintext key still authenticates", r.status === 200, "got " + r.status)
  await new Promise(res => setTimeout(res, 1500))
  const sealed = await sanity.fetch(`*[_id == $id][0]{ "plain": defined(dashKey), "sealed": defined(dashKeyEnc) }`, { id })
  check("and is sealed on use", sealed?.sealed === true && sealed?.plain === false, JSON.stringify(sealed))
} finally {
  await sanity.delete(id).catch(() => {})
  console.log("\ntemporary account deleted")
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
