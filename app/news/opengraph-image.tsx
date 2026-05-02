import { generateOGImage, OG_SIZE } from '@/lib/ogImageTemplate'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage() {
  return generateOGImage({
    title: 'ຂ່າວສານຕະຫຼາດການເງິນ',
    excerpt: 'ຂ່າວ Forex, ທອງຄຳ XAUUSD ແລະ Crypto ອັບເດດທຸກວັນ',
    category: 'news',
  })
}
