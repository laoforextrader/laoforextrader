import { generateOGImage, OG_SIZE } from '@/lib/ogImageTemplate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage() {
  return generateOGImage({
    title: 'ບົດຮຽນ Forex',
    excerpt: 'ບົດຮຽນເທຣດ Forex ແບບເປັນຂັ້ນຕອນ ຈາກພື້ນຖານສູ່ມືອາຊີບ',
    category: 'lessons',
  })
}
