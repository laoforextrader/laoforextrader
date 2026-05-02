const FONT_URLS = [
  'https://www.laoforextrader.com/fonts/NotoSansLao-Bold.ttf',
  'https://fonts.gstatic.com/s/notosanslao/v33/bx6lNx2Ol_ixgdYWLm9BwxM3NW6BOkuf763Clj73CiQ_J1Djx9pidOt4lsHdfw.ttf',
]

let cachedFont: ArrayBuffer | null = null

export async function loadLaoFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont
  for (const url of FONT_URLS) {
    try {
      const res = await fetch(url, { cache: 'force-cache' })
      if (res.ok) {
        cachedFont = await res.arrayBuffer()
        return cachedFont
      }
    } catch {}
  }
  throw new Error('Failed to load Noto Sans Lao font from any source')
}
