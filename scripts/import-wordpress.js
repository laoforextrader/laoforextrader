/**
 * WordPress XML → Sanity Import Script
 * 
 * ວິທີໃຊ້:
 * 1. Export WordPress: WP Admin → Tools → Export → All content → Download XML
 * 2. ວາງໄຟລ໌ XML ໄວ້ທີ່ scripts/wordpress-export.xml
 * 3. ຕັ້ງຄ່າ SANITY_API_TOKEN ໃນ .env.local
 * 4. npx ts-node scripts/import-wordpress.ts
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sanityClientLib = require("@sanity/client")
const { parseString }  = require("xml2js")
const fs               = require("fs")
const path             = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") })

const client = sanityClientLib.createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   "production",
  apiVersion: "2025-04-25",
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
})

// Map WordPress categories → LFT categories
const CATEGORY_MAP = {
  "broker":       "broker",
  "forex":        "education",
  "education":    "education",
  "news":         "news",
  "analysis":     "analysis",
  "ea":           "ea-tools",
  "tools":        "ea-tools",
}

function mapCategory(wpCategories) {
  for (const cat of wpCategories) {
    const lower = cat.toLowerCase()
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(key)) return val
    }
  }
  return "education"
}

function slugify(str) {
  return str.toLowerCase().trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .slice(0, 96)
}

// Convert WP HTML → Portable Text blocks (ไม่ใช้ regex flag 's')
function htmlToPortableText(html) {
  if (!html) return []

  // ลบ CDATA wrapper ถ้ามี
  let content = html.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "")

  // แทนที่ tag ต่างๆ โดยไม่ใช้ /s flag
  // ใช้ [\s\S] แทน . เพื่อ match newline ด้วย
  content = content
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, function(_, text) { return text.trim() + "\n\n" })
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, function(_, text) { return "\n## " + text.trim() + "\n" })
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, function(_, text) { return "\n### " + text.trim() + "\n" })
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, function(_, text) { return text })
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function(_, text) { return "• " + text.trim() + "\n" })
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, function(_, text) { return text })
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, function(_, text) { return text })
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, function(_, text) { return text })
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8216;|&#8217;|&lsquo;|&rsquo;/g, "'")

  const paragraphs = content.split(/\n{2,}/).map(function(p) { return p.trim() }).filter(Boolean)

  return paragraphs.map(function(text, i) {
    let style = "normal"
    let cleanText = text
    if (text.startsWith("## "))  { style = "h2"; cleanText = text.slice(3) }
    if (text.startsWith("### ")) { style = "h3"; cleanText = text.slice(4) }

    return {
      _type: "block",
      _key:  "b" + i,
      style: style,
      children: [{
        _type: "span",
        _key:  "s" + i,
        text:  cleanText,
        marks: [],
      }],
      markDefs: [],
    }
  })
}

async function importWordPress() {
  console.log("📥 กำลังอ่านไฟล์ WordPress XML...")

  // หาไฟล์ XML
  const xmlPath = path.resolve(__dirname, "wordpress-export.xml")
  if (!fs.existsSync(xmlPath)) {
    console.log("❌ ไม่พบไฟล์: scripts/wordpress-export.xml")
    console.log("")
    console.log("📋 วิธี Export จาก WordPress:")
    console.log("   1. เข้า WP Admin → Tools → Export")
    console.log("   2. เลือก 'All content'")
    console.log("   3. Click 'Download Export File'")
    console.log("   4. เอาไฟล์ .xml มาวางที่ scripts/wordpress-export.xml")
    process.exit(1)
  }

  const xmlContent = fs.readFileSync(xmlPath, "utf8")
  console.log("📄 กำลัง parse XML...")

  parseString(xmlContent, { explicitArray: true }, async function(err, parsed) {
    if (err) {
      console.log("❌ Parse XML ล้มเหลว:", err.message)
      process.exit(1)
    }

    const items = (parsed && parsed.rss && parsed.rss.channel && parsed.rss.channel[0] && parsed.rss.channel[0].item) || []
    console.log("📄 พบ " + items.length + " items ใน XML")

    let imported = 0
    let skipped  = 0
    let errors   = 0

    for (const item of items) {
      const postType   = item["wp:post_type"]   && item["wp:post_type"][0]
      const postStatus = item["wp:status"]       && item["wp:status"][0]
      const postId     = item["wp:post_id"]      && item["wp:post_id"][0]

      // เฉพาะ published posts
      if (postType !== "post" || postStatus !== "publish") {
        skipped++
        continue
      }

      const title   = (item.title   && item.title[0])   || "Untitled"
      const content = (item["content:encoded"] && item["content:encoded"][0]) || ""
      const excerpt = (item["excerpt:encoded"] && item["excerpt:encoded"][0]) || ""
      const date    = (item.pubDate && item.pubDate[0]) || new Date().toISOString()
      const wpSlug  = (item["wp:post_name"] && item["wp:post_name"][0]) || ""
      const slug    = wpSlug || slugify(title)

      // Categories
      const cats = (item.category || []).map(function(c) {
        return (typeof c === "string") ? c : (c._ || c["$"] && c["$"].nicename || "")
      }).filter(Boolean)

      const doc = {
        _id:         "wp_" + postId,
        _type:       "article",
        title:       title,
        slug:        { _type: "slug", current: slug },
        excerpt:     (excerpt || "").replace(/<[^>]+>/g, "").trim().slice(0, 300),
        category:    mapCategory(cats),
        publishedAt: new Date(date).toISOString(),
        featured:    false,
        readTime:    Math.max(1, Math.ceil(content.length / 1500)),
        body:        htmlToPortableText(content),
      }

      try {
        await client.createOrReplace(doc)
        console.log("  ✓ [" + doc.category + "] " + title.slice(0, 65))
        imported++
      } catch (importErr) {
        console.log("  ✗ Error: " + title.slice(0, 40) + " — " + importErr.message)
        errors++
      }
    }

    console.log("")
    console.log("═══════════════════════════════")
    console.log("✅ นำเข้าสำเร็จ : " + imported + " บทความ")
    console.log("⏭  ข้ามไป     : " + skipped  + " (draft/page)")
    console.log("❌ Error       : " + errors   + " บทความ")
    console.log("═══════════════════════════════")
  })
}

importWordPress()
