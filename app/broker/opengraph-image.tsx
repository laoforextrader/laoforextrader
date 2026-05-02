import { generateOGImage, OG_SIZE } from '@/lib/ogImageTemplate'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage() {
  return generateOGImage({
    title: 'ລີວິວ Broker Forex',
    excerpt: 'ປຽບທຽບ Broker ທີ່ດີທີ່ສຸດ ຝາກຖອນສະດວກໃນລາວ',
    category: 'broker',
  })
}
