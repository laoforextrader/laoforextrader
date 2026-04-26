/**
 * WordPress XML → Sanity Import Script
 * 
 * ວິທີໃຊ້:
 * 1. Export WordPress: WP Admin → Tools → Export → All content → Download XML
 * 2. ວາງໄຟລ໌ XML ໄວ້ທີ່ scripts/wordpress-export.xml
 * 3. ຕັ້ງຄ່າ SANITY_API_TOKEN ໃນ .env.local
 * 4. npx ts-node scripts/import-wordpress.ts
 */

import { createClient } from "@sanity/client"
import { parseStringPromise } from "xml2js"
import { readFileSync } from "fs"
import { slugify } from "../lib/utils"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   "production",
  apiVersion: "2025-04-25",
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
})

// Map WordPress categories → LFT categories
const CATEGORY_MAP: Record<string, string> = {
  "broker":       "broker",
  "forex":        "education",
  "education":    "education",
  "news":         "news",
  "analysis":     "analysis",
  "วิเคราะห์":   "analysis",
  "โบรกเกอร์":   "broker",
  "การศึกษา":    "education",
  "ຂ່າວ":         "news",
  "ການສຶກສາ":    "education",
  "ໂບຣກເກີ":    "broker",
  "default":      "education",
}

function mapCategory(wpCategories: string[]): string {
  for (const cat of wpCategories) {
    const lower = cat.toLowerCase()
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(key)) return val
    }
  }
  return "education"
}

// Convert WP HTML content → simple Portable Text blocks
function htmlToPortableText(html: string) {
  // Strip HTML tags, convert paragraphs
  const cleaned = html
    .replace(/<p[^>]*>(.*?)<\/p>/gis, (_, text) => text.trim() + "\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, "\n## $1\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gis, "\n### $1\n")
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, "$1")
    .replace(/<li[^>]*>(.*?)<\/li>/gis, "• $1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')

  const paragraphs = cleaned.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)

  return paragraphs.map((text, i) => ({
    _type: "block",
    _key:  `block_${i}`,
    style: text.startsWith("## ") ? "h2" : text.startsWith("### ") ? "h3" : "normal",
    children: [{
      _type: "span",
      _key:  `span_${i}`,
      text:  text.replace(/^#{2,3}\s/, ""),
      marks: [],
    }],
    markDefs: [],
  }))
}

async function importWordPress() {
  console.log("📥 Reading WordPress export XML...")

  let xmlContent: string
  try {
    xmlContent = readFileSync("scripts/wordpress-export.xml", "utf8")
  } catch {
    console.log("❌ ไม่พบไฟล์ scripts/wordpress-export.xml")
    console.log("   วิธีสร้าง: WP Admin → Tools → Export → All Content → Download")
    process.exit(1)
  }

  const parsed = await parseStringPromise(xmlContent)
  const items: any[] = parsed?.rss?.channel?.[0]?.item ?? []

  console.log(`📄 พบ ${items.length} posts`)

  let imported = 0
  let skipped  = 0

  for (const item of items) {
    const postType   = item["wp:post_type"]?.[0]
    const postStatus = item["wp:status"]?.[0]

    // เฉพาะ post ที่ publish แล้ว
    if (postType !== "post" || postStatus !== "publish") { skipped++; continue }

    const title   = item.title?.[0] ?? "Untitled"
    const content = item["content:encoded"]?.[0] ?? ""
    const excerpt = item["excerpt:encoded"]?.[0] ?? ""
    const date    = item.pubDate?.[0] ?? new Date().toISOString()
    const slug    = item["wp:post_name"]?.[0] || slugify(title)
    const categories = (item.category ?? []).map((c: any) => c._ ?? c)

    const doc = {
      _type:       "article",
      title,
      slug:        { _type: "slug", current: slug },
      excerpt:     excerpt.replace(/<[^>]+>/g, "").trim().slice(0, 300),
      category:    mapCategory(categories),
      publishedAt: new Date(date).toISOString(),
      featured:    false,
      body:        htmlToPortableText(content),
    }

    try {
      await client.createOrReplace({ ...doc, _id: `wp_${item["wp:post_id"]?.[0]}` })
      console.log(`  ✓ ${title.slice(0, 60)}`)
      imported++
    } catch (err) {
      console.log(`  ✗ Error: ${title.slice(0, 40)} — ${err}`)
    }
  }

  console.log(`\n✅ นำเข้าสำเร็จ: ${imported} บทความ, ข้ามไป: ${skipped}`)
}

importWordPress().catch(console.error)
