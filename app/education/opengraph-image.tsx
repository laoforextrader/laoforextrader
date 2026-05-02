import { generateOGImage, OG_SIZE } from '@/lib/ogImageTemplate'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage() {
  return generateOGImage({
    title: 'ການສຶກສາ Forex',
    excerpt: 'ຮຽນ Forex ຟຣີ ສຳລັບຄົນລາວ ຕັ້ງແຕ່ພື້ນຖານຈົນເຖິງຂັ້ນສູງ',
    category: 'education',
  })
}
