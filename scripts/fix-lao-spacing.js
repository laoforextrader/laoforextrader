// fix-lao-spacing.js
// ແກ້ໄຂຊ່ອງຫວ່າງໃນຂໍ້ຄວາມລາວທຸກບົດຄວາມ
// ວິທີໃຊ້: node scripts/fix-lao-spacing.js

const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// ແກ້ຊ່ອງຫວ່າງໃນຂໍ້ຄວາມລາວ
function fixLaoSpacing(text) {
  if (!text || typeof text !== "string") return text

  // ລຶບຊ່ອງຫວ່າງລະຫວ່າງຕົວໜັງສືລາວ
  // ຕົວໜັງສືລາວ Unicode range: \u0E80-\u0EFF
  let fixed = text

  // ແກ້ Pattern: ຕົວໜັງສືລາວ + space + ຕົວໜັງສືລາວ
  // ເຮັດຊ້ຳໆ ຈົນກວ່າຈະບໍ່ມີ Pattern ນີ້ແລ້ວ
  let prev = ""
  while (prev !== fixed) {
    prev = fixed
    fixed = fixed.replace(/([\u0E80-\u0EFF]) ([\u0E80-\u0EFF])/g, "$1$2")
  }

  // ແກ້ Pattern: ລາວ + space + ສະຫຼະ/ວັນນະຍຸດ
  fixed = fixed.replace(/([\u0E80-\u0EFF]) ([\u0EB0-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD])/g, "$1$2")

  // ແກ້ Pattern: ທີ ່ → ທີ່, ຢ ູ ່ → ຢູ່ ແລະອື່ນໆ
  fixed = fixed.replace(/(\u0E9B|\u0EAB|\u0E84|\u0EAD) (\u0EC8|\u0EC9|\u0ECA|\u0ECB|\u0ECC|\u0ECD)/g, "$1$2")

  return fixed
}

// ແກ້ Portable Text blocks ທັງໝົດ
function fixPortableTextBlocks(blocks) {
  if (!Array.isArray(blocks)) return blocks

  return blocks.map(block => {
    if (!block) return block

    // ແກ້ children array
    if (Array.isArray(block.children)) {
      return {
        ...block,
        children: block.children.map(child => {
          if (child && typeof child.text === "string") {
            return { ...child, text: fixLaoSpacing(child.text) }
          }
          return child
        })
      }
    }

    return block
  })
}

async function fixAllArticles() {
  console.log("🔍 ກຳລັງດຶງທຸກບົດຄວາມ...")

  // ດຶງທຸກບົດຄວາມທີ່ category ບໍ່ແມ່ນ broker
  const articles = await client.fetch(`
    *[_type == "article" && category != "broker"] {
      _id, title, slug, category, excerpt, body
    }
  `)

  console.log(`📚 ພົບ ${articles.length} ບົດຄວາມ`)

  let fixed = 0
  let skipped = 0
  let failed = 0

  for (const article of articles) {
    try {
      const fixedTitle = fixLaoSpacing(article.title)
      const fixedExcerpt = fixLaoSpacing(article.excerpt)
      const fixedBody = fixPortableTextBlocks(article.body)

      // ກວດວ່າມີການປ່ຽນແປງໄຫມ
      const titleChanged = fixedTitle !== article.title
      const excerptChanged = fixedExcerpt !== article.excerpt
      const bodyChanged = JSON.stringify(fixedBody) !== JSON.stringify(article.body)

      if (!titleChanged && !excerptChanged && !bodyChanged) {
        skipped++
        continue
      }

      // ອັບເດດ
      await client.patch(article._id).set({
        ...(titleChanged && { title: fixedTitle }),
        ...(excerptChanged && { excerpt: fixedExcerpt }),
        ...(bodyChanged && { body: fixedBody }),
      }).commit()

      console.log(`✅ ແກ້ແລ້ວ: ${fixedTitle.slice(0, 50)}...`)
      fixed++

      // ລໍຊັກໜ່ອຍ ຫຼີກລ່ຽງ Rate Limit
      await new Promise(r => setTimeout(r, 200))

    } catch (err) {
      console.error(`❌ ລົ້ມເຫຼວ: ${article.title?.slice(0, 40)}:`, err.message)
      failed++
    }
  }

  console.log(`\n══════════════════════════════`)
  console.log(`✅ ແກ້ສຳເລັດ: ${fixed} ບົດ`)
  console.log(`⏭️  ຂ້າມ (ບໍ່ມີຊ່ອງຫວ່າງ): ${skipped} ບົດ`)
  if (failed > 0) console.log(`❌ ລົ້ມເຫຼວ: ${failed} ບົດ`)
  console.log(`══════════════════════════════`)
}

fixAllArticles().catch(console.error)
