import { generateOGImage, OG_SIZE } from '@/lib/ogImageTemplate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage() {
  return generateOGImage({
    title: 'ເຄື່ອງມືຄຳນວນ Forex',
    excerpt: 'Pip Calculator, Lot Calculator ແລະ ເຄື່ອງມືຊ່ວຍເທຣດ Forex',
    category: 'tools',
  })
}
