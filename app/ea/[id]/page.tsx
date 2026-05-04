import EAStatsCard from "@/components/ea/EAStatsCard"
import { notFound } from "next/navigation"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { EAStats } from "@/types"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }

export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const stats = await sanityClient.fetch<EAStats>(QUERIES.eaStatsByEaId(id), {}, { next: { revalidate: 60 } })
  return {
    title: stats?.title ? `${stats.title} — Live Stats` : "EA Stats",
    description: stats?.title ? `ສະຖິຕິສົດ ${stats.title}` : undefined,
  }
}

export default async function EAStatsPage({ params }: Props) {
  const { id } = await params
  const stats = await sanityClient.fetch<EAStats>(QUERIES.eaStatsByEaId(id), {}, { next: { revalidate: 60 } })
  if (!stats || stats.updateMode === "off") notFound()

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div className="max-w-[860px] mx-auto px-6 py-10">
        <EAStatsCard eaId={id} />
      </div>
    </div>
  )
}
