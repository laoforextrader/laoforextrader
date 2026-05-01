const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function dedupe() {
  console.log("🔍 ກວດ Duplicate Articles...")

  const articles = await client.fetch(`
    *[_type == "article" && category == "education"] {
      _id, _updatedAt, title,
      "slug": slug.current
    } | order(slug.current asc, _updatedAt desc)
  `)

  const seen = new Map()
  const toDelete = []

  for (const a of articles) {
    if (seen.has(a.slug)) {
      toDelete.push(a._id)
      console.log(`🗑️  DELETE: ${a.slug} (${a._id})`)
    } else {
      seen.set(a.slug, a._id)
    }
  }

  if (toDelete.length === 0) {
    console.log("✅ ບໍ່ມີ Duplicate")
    return
  }

  console.log(`\n⚠️  ຈະລົບ ${toDelete.length} duplicate docs...`)

  for (const id of toDelete) {
    await client.delete(id)
    console.log(`✅ ລົບແລ້ວ: ${id}`)
  }

  console.log(`\n✅ ສຳເລັດ ລົບ ${toDelete.length} duplicates`)
}

dedupe().catch(console.error)
