import { sanityClient, QUERIES } from '@/lib/sanity'
import { generateOGImage, OG_SIZE } from '@/lib/ogImageTemplate'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await sanityClient.fetch(QUERIES.articleBySlug(slug))
  return generateOGImage({
    title: article?.title || 'LaoForexTrader',
    excerpt: article?.excerpt,
    category: 'ea-tools',
    readTime: article?.readTime,
  })
}
