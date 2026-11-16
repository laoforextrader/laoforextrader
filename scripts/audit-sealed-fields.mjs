// Fails if a database query still filters or selects a secret field that is
// no longer stored in the clear.
//
//   node scripts/audit-sealed-fields.mjs
//
// Why a query check and not a property check: TypeScript already catches
// stale property reads, because the legacy fields are typed under deliberately
// awkward names (legacyDashKeyPlain, legacyOwnerEmailPlain) that only their
// accessor uses. What TypeScript cannot see is the inside of a GROQ string —
// `ownerEmail == $email` compiles perfectly and matches nothing.
//
// Written after 16 Nov 2026, when exactly that line in accountsOf made a
// linked account invisible to the page that had just linked it, and the
// customer's only symptom was a button that appeared to do nothing.

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = process.cwd()
const DIRS = ["app", "lib", "components", "scripts"]

// A query may name these only where the comment says the legacy shape is
// still being matched on purpose (the migration window) or aliased.
const RULES = [
  {
    field: "ownerEmail",
    hint: "match ownerEmailHash (blindIndex) instead, or alias it as legacyOwnerEmailPlain",
  },
  {
    field: "dashKey",
    hint: "select dashKeyEnc, or alias the old one as legacyDashKeyPlain",
  },
  {
    field: "entryCode",
    hint: "select entryCodeEnc and open it with codeOf()",
  },
]

function* walk(dir) {
  let names
  try { names = readdirSync(dir) } catch { return }
  for (const name of names) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue
      yield* walk(p)
    } else if (/\.(ts|tsx|mjs)$/.test(name) && !name.endsWith(".d.ts")) {
      yield p
    }
  }
}

const problems = []

for (const dir of DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file).replace(/\\/g, "/")
    if (rel === "scripts/audit-sealed-fields.mjs") continue
    // The migration is the one script whose job is to read the old fields.
    if (rel === "scripts/migrate-seal-secrets.mjs") continue
    if (rel === "scripts/semi-link-doctor.mjs") continue

    const src = readFileSync(file, "utf8")
    // Every GROQ string in the file: backticks containing *[_type ...
    for (const m of src.matchAll(/`([^`]*\*\s*\[\s*_type[^`]*)`/g)) {
      const query = m[1]
      const line = src.slice(0, m.index).split(/\r?\n/).length
      for (const rule of RULES) {
        // The field named on its own, not as fieldEnc/fieldHash, and not
        // already aliased ("legacyX": field).
        const bare = new RegExp(`(?<!")\\b${rule.field}\\b(?!Enc|Hash|")`)
        if (!bare.test(query)) continue
        const aliased = new RegExp(`"legacy[^"]*"\\s*:\\s*${rule.field}\\b`).test(query)
        const migrationWindow = /ownerEmailHash == \$hash \|\| ownerEmail == \$email/.test(query)
        if (aliased || migrationWindow) continue
        problems.push({ rel, line, field: rule.field, hint: rule.hint, query: query.replace(/\s+/g, " ").slice(0, 120) })
      }
    }
  }
}

if (problems.length === 0) {
  console.log("ok — no query reads a sealed field in the clear")
  process.exit(0)
}

console.log(`${problems.length} quer${problems.length === 1 ? "y" : "ies"} still naming a sealed field:\n`)
for (const p of problems) {
  console.log(`  ${p.rel}:${p.line}  (${p.field})`)
  console.log(`    ${p.query}`)
  console.log(`    -> ${p.hint}\n`)
}
process.exit(1)
