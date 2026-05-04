import { NextResponse } from 'next/server'
import { sanityClient, QUERIES } from '@/lib/sanity'

export const revalidate = 3600

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const quiz = await sanityClient.fetch(
    QUERIES.quizBySlug(slug),
    {},
    { next: { revalidate: 3600 } }
  )
  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quiz)
}
