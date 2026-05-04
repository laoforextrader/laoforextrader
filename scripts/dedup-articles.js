// Trim whitespace from article slugs, then dedupe by clean slug (keep newest by _updatedAt).
// Usage:
//   Dry-run:  SANITY_API_TOKEN=... node scripts/dedup-articles.js
//   Apply:    SANITY_API_TOKEN=... node scripts/dedup-articles.js --apply

const { createClient } = require("@sanity/client")

const APPLY = process.argv.includes("--apply")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function run() {
  console.log(APPLY ? "🚀 APPLY mode (will modify Sanity)" : "🔎 DRY-RUN mode (no changes)")

  const all = await client.fetch(`
    *[_type == "article"] {
      _id, _updatedAt, title, category, slug,
      "bodyLen": length(pt::text(body))
    }
  `)

  console.log(`Total articles: ${all.length}`)

  // Step 1: trim whitespace from slugs
  const dirty = all.filter(a => a.slug?.current && a.slug.current !== a.slug.current.trim())
  console.log(`\nStep 1: ${dirty.length} slugs need trimming`)
  for (const a of dirty) {
    const clean = a.slug.current.trim()
    console.log(`  trim: ${a._id}  "${a.slug.current}" -> "${clean}"`)
    if (APPLY) {
      await client.patch(a._id).set({ slug: { _type: "slug", current: clean } }).commit()
      a.slug.current = clean
      await new Promise(r => setTimeout(r, 100))
    }
  }

  // Re-fetch (or rely on local mutations) – use local mutations + freshness via re-sort
  // Group by clean slug
  const bySlug = {}
  for (const a of all) {
    const key = a.slug?.current?.trim()
    if (!key) continue
    if (!bySlug[key]) bySlug[key] = []
    bySlug[key].push(a)
  }
  // Sort each group: longest body first; tie-break by _updatedAt desc.
  // Rationale: the new "long content" docs are what we want; _updatedAt is unreliable
  // because the short docs were touched more recently while debugging.
  for (const key of Object.keys(bySlug)) {
    bySlug[key].sort((x, y) => {
      const lx = x.bodyLen || 0, ly = y.bodyLen || 0
      if (ly !== lx) return ly - lx
      return y._updatedAt > x._updatedAt ? 1 : -1
    })
  }

  // Step 2: pick docs to delete (shorter duplicates), but never delete drafts.*
  // Build (loserId -> keeperId) map so we can migrate refs before deletion.
  const toDelete = []
  const refMap = {}
  for (const [slug, docs] of Object.entries(bySlug)) {
    if (docs.length <= 1) continue
    const keeper = docs[0]
    const losers = docs.slice(1).filter(d => !d._id.startsWith("drafts."))
    const skippedDrafts = docs.slice(1).filter(d => d._id.startsWith("drafts."))
    console.log(`\nDuplicate slug: "${slug}" (x${docs.length})`)
    console.log(`  KEEP   ${keeper._id.padEnd(40)} body=${(keeper.bodyLen||0).toString().padStart(5)}ch  updated=${keeper._updatedAt}`)
    for (const l of losers) {
      console.log(`  DELETE ${l._id.padEnd(40)} body=${(l.bodyLen||0).toString().padStart(5)}ch  updated=${l._updatedAt}`)
      refMap[l._id] = keeper._id
    }
    for (const d of skippedDrafts) console.log(`  SKIP   ${d._id.padEnd(40)} body=${(d.bodyLen||0).toString().padStart(5)}ch  (draft)`)
    toDelete.push(...losers.map(l => l._id))
  }

  if (toDelete.length === 0) {
    console.log("\n✅ No older duplicates to delete")
  } else {
    // Step 2a: migrate references from losers to keepers
    const refs = await client.fetch(
      `*[references($ids)]{ _id, _type }`,
      { ids: toDelete }
    )
    console.log(`\nStep 2a: ${refs.length} docs reference soon-to-be-deleted articles`)
    for (const r of refs) {
      // Pull the full doc to remap any matching reference fields
      const doc = await client.fetch(`*[_id==$id][0]`, { id: r._id })
      const patches = {}
      const walk = (val, path) => {
        if (val && typeof val === "object") {
          if (val._type === "reference" && refMap[val._ref]) {
            patches[path] = { ...val, _ref: refMap[val._ref] }
            return
          }
          for (const k of Object.keys(val)) {
            if (k.startsWith("_") && k !== "_ref") continue
            walk(val[k], path ? `${path}.${k}` : k)
          }
        }
      }
      walk(doc, "")
      const paths = Object.keys(patches)
      if (paths.length === 0) continue
      console.log(`  migrate ${r._type} ${r._id}:`)
      let p = client.patch(r._id)
      for (const path of paths) {
        const newVal = patches[path]
        console.log(`    ${path}: ${doc[path.split(".")[0]]?._ref || "(nested)"} -> ${newVal._ref}`)
        p = p.set({ [path]: newVal })
      }
      if (APPLY) {
        await p.commit()
        await new Promise(r => setTimeout(r, 100))
      }
    }

    console.log(`\nStep 2b: ${toDelete.length} older docs to delete`)
    if (APPLY) {
      for (const id of toDelete) {
        try {
          await client.delete(id)
          console.log(`  🗑️  deleted ${id}`)
        } catch (e) {
          console.log(`  ⚠️  could not delete ${id}: ${e.message}`)
        }
        await new Promise(r => setTimeout(r, 100))
      }
    } else {
      console.log("(dry-run — re-run with --apply to delete)")
    }
  }

  console.log(`\n${APPLY ? "✅ Applied" : "ℹ️  Dry-run complete"}: trimmed ${dirty.length}, ${APPLY ? "deleted" : "would delete"} ${toDelete.length}`)
}

run().catch(e => { console.error(e); process.exit(1) })
