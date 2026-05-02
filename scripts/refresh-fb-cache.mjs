// Forces Facebook to re-scrape every URL in sitemap.xml.
// Usage:  FB_APP_SECRET=<secret> node scripts/refresh-fb-cache.mjs
//
// Get the secret at:
//   https://developers.facebook.com/apps/1949886389746807/settings/basic/
// (click "Show" next to "App Secret")

const APP_ID     = '1949886389746807'
const APP_SECRET = process.env.FB_APP_SECRET
const SITEMAP    = 'https://www.laoforextrader.com/sitemap.xml'
const CONCURRENCY = 5
const HOST_REWRITE = { from: 'https://laoforextrader.com', to: 'https://www.laoforextrader.com' }

if (!APP_SECRET) {
  console.error('ERROR: FB_APP_SECRET env var is required.')
  console.error('Run: FB_APP_SECRET=<your_secret> node scripts/refresh-fb-cache.mjs')
  process.exit(1)
}

const accessToken = `${APP_ID}|${APP_SECRET}`

async function fetchSitemap() {
  const res  = await fetch(SITEMAP)
  const xml  = await res.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  return urls.map(u => u.startsWith(HOST_REWRITE.from + '/') || u === HOST_REWRITE.from
    ? u.replace(HOST_REWRITE.from, HOST_REWRITE.to)
    : u)
}

async function rescrape(url) {
  const endpoint = `https://graph.facebook.com/v21.0/?id=${encodeURIComponent(url)}&scrape=true&access_token=${encodeURIComponent(accessToken)}`
  const res  = await fetch(endpoint, { method: 'POST' })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    return { url, ok: false, error: data?.error?.message || `HTTP ${res.status}` }
  }
  return { url, ok: true, ogUrl: data?.og_object?.url, title: data?.og_object?.title }
}

async function runPool(items, worker, size) {
  const results = []
  let cursor = 0
  const workers = Array.from({ length: size }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await worker(items[i])
    }
  })
  await Promise.all(workers)
  return results
}

const urls = await fetchSitemap()
console.log(`Re-scraping ${urls.length} URLs (concurrency=${CONCURRENCY})...\n`)

const results = await runPool(urls, async (url) => {
  const r = await rescrape(url)
  const tag = r.ok ? 'OK ' : 'ERR'
  console.log(`[${tag}] ${url}${r.error ? ' — ' + r.error : ''}`)
  return r
}, CONCURRENCY)

const ok  = results.filter(r => r.ok).length
const err = results.length - ok
console.log(`\nDone. ${ok} OK, ${err} errors.`)
if (err) process.exit(1)
