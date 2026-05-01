import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { sanityClient, QUERIES, urlFor } from "@/lib/sanity"
import { PortableText } from "@portabletext/react"
import { Article } from "@/types"
import { ArrowLeft, CheckCircle, XCircle, Clock, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"
import PostEngagement from "@/components/sections/PostEngagement"
import { buildArticleMetadata, buildBrokerMetadata } from "@/lib/articleMetadata"
import { TrackedBrokerLink } from "@/components/broker/TrackedBrokerLink"

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const broker = await sanityClient.fetch(QUERIES.brokerBySlug(slug), {}, { next: { revalidate: 60 } })
  if (broker) return buildBrokerMetadata(broker, `/broker/${broker.slug?.current ?? slug}`)
  const article = await sanityClient.fetch<Article>(QUERIES.articleBySlug(slug), {}, { next: { revalidate: 60 } })
  if (article) return buildArticleMetadata(article, `/broker/${article.slug?.current ?? ""}`)
  return { title: "Not found" }
}

// ── Portable Text components ────────────────────────────────────────────────
const ptComponents = {
  block: {
    normal:     ({ children }: any) => <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: "1rem", fontSize: 15 }}>{children}</p>,
    h2:         ({ children }: any) => <h2 style={{ color: "#111827", fontWeight: 700, fontSize: "1.4rem", marginTop: "2rem", marginBottom: "0.8rem", paddingBottom: "0.5rem", borderBottom: "1px solid #E5E7EB" }}>{children}</h2>,
    h3:         ({ children }: any) => <h3 style={{ color: "#111827", fontWeight: 600, fontSize: "1.15rem", marginTop: "1.5rem", marginBottom: "0.6rem" }}>{children}</h3>,
    blockquote: ({ children }: any) => <blockquote style={{ borderLeft: "3px solid #BFCFFF", paddingLeft: "1rem", color: "#6B7280", fontStyle: "italic", margin: "1.5rem 0" }}>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: any) => <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column" as const, gap: 6 }}>{children}</ul>,
    number: ({ children }: any) => <ol style={{ paddingLeft: "1.5rem", marginBottom: "1rem", listStyleType: "decimal", display: "flex", flexDirection: "column" as const, gap: 6 }}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li style={{ color: "#374151", fontSize: 14 }}>{children}</li>,
    number: ({ children }: any) => <li style={{ color: "#374151", fontSize: 14 }}>{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => <strong style={{ color: "#111827", fontWeight: 600 }}>{children}</strong>,
    link:   ({ value, children }: any) => <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: "#2563EB", textDecoration: "underline" }}>{children}</a>,
  },
}

function toStr(val: any): string {
  if (!val) return "—"
  if (Array.isArray(val)) return val.join(", ") || "—"
  return String(val)
}

function StarBar({ label, value }: { label: string; value?: number }) {
  const v = value ?? 0
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: "#6B7280", width: 90 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${(v / 5) * 100}%`, height: "100%", background: "linear-gradient(90deg,#2563EB,#4F46E5)", borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", width: 28, textAlign: "right" }}>{v.toFixed(1)}</span>
    </div>
  )
}

export default async function BrokerSlugPage({ params }: Props) {
  const { slug } = await params

  // ── Try broker profile first ───────────────────────────────────────────────
  const broker = await sanityClient.fetch(QUERIES.brokerBySlug(slug), {}, { next: { revalidate: 60 } })

  if (broker) {
    const rb = broker.ratingBreakdown ?? {}
    return (
      <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>

          <Link href="/broker"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 13, textDecoration: "none", marginBottom: 20, fontWeight: 500 }}>
            <ArrowLeft size={13} /> ກັບໄປໜ້າ Broker
          </Link>

          {/* Header card */}
          <div style={{ background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 18, padding: "28px 28px 24px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
              {broker.logo?.asset?.url ? (
                <Image
                  src={urlFor(broker.logo).width(112).height(112).url()}
                  alt={broker.logo.alt || broker.name}
                  width={56}
                  height={56}
                  style={{
                    borderRadius: 14,
                    objectFit: "contain",
                    background: "#fff",
                    border: "1px solid #E2E6F0",
                    padding: 6,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "#EEF3FF", border: "1px solid #BFCFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: "#2563EB", flexShrink: 0 }}>
                  {broker.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>{broker.name}</h1>
                  {broker.badge?.show && broker.badge?.text && (() => {
                    const colorMap: Record<string, { bg: string; color: string; border: string }> = {
                      gold:   { bg: "#FEF3C7", color: "#D97706", border: "#FDE68A" },
                      blue:   { bg: "#EEF3FF", color: "#2563EB", border: "#BFCFFF" },
                      green:  { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
                      purple: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
                      gray:   { bg: "#F9FAFB", color: "#374151", border: "#E2E6F0" },
                      orange: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
                      red:    { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
                    }
                    const c = colorMap[broker.badge.color] || colorMap.gray
                    return (
                      <span style={{
                        display: "inline-block",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 100,
                        border: `1px solid ${c.border}`,
                        background: c.bg,
                        color: c.color,
                        whiteSpace: "nowrap",
                      }}>
                        {broker.badge.text}
                      </span>
                    )
                  })()}
                </div>
                <div style={{ fontSize: 20, color: "#F59E0B", letterSpacing: -1, marginBottom: 6 }}>
                  {"★".repeat(Math.floor(broker.rating ?? 4))}{"☆".repeat(5 - Math.floor(broker.rating ?? 4))}
                  <span style={{ fontSize: 13, color: "#6B7280", marginLeft: 8, letterSpacing: 0 }}>{(broker.rating ?? 4).toFixed(1)} / 5</span>
                </div>
                {broker.excerpt && <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, margin: 0 }}>{broker.excerpt}</p>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              {broker.registerUrl && (
                <TrackedBrokerLink href={broker.registerUrl} brokerName={broker.name} action="broker_click"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "11px 28px", background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
                  ສະໝັກເປີດບັນຊີ {broker.name.split(" ")[0]} →
                </TrackedBrokerLink>
              )}
              {broker.affiliateUrl && (
                <TrackedBrokerLink href={broker.affiliateUrl} brokerName={broker.name} action="broker_website_click"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "11px 20px", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: "none", border: "1.5px solid #D1D5DB" }}>
                  ເຂົ້າເວັບໂບຣກເກີ
                </TrackedBrokerLink>
              )}
            </div>
          </div>

          {/* Stats + Rating */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563EB", marginBottom: 14 }}>ຂໍ້ມູນຫຼັກ</div>
              {[
                { label: "ຝາກຂັ້ນຕ່ຳ",    value: `$${broker.minDeposit ?? "—"}` },
                { label: "Leverage ສູງສຸດ", value: broker.maxLeverage ?? "—" },
                { label: "ຝາກ BCEL",        value: broker.laoDeposit ? "✓ ຮອງຮັບ" : "✗ ບໍ່ຮອງຮັບ", green: broker.laoDeposit },
                { label: "ໃບອະນຸຍາດ",      value: toStr(broker.regulators ?? broker.regulation) },
                { label: "Platforms",        value: toStr(broker.platforms) },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ color: "#6B7280" }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.green === true ? "#059669" : row.green === false ? "#9CA3AF" : "#111827", textAlign: "right", maxWidth: "55%" }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563EB", marginBottom: 14 }}>ຄະແນນລາຍດ້ານ</div>
              <StarBar label="ຄວາມໝັ້ນຄົງ" value={rb.stability} />
              <StarBar label="ຝາກ-ຖອນ"     value={rb.deposit} />
              <StarBar label="Spread"        value={rb.spread} />
              <StarBar label="Support"       value={rb.support} />
              <StarBar label="ໂປຣໂມຊັ່ນ"  value={rb.promotion} />
            </div>
          </div>

          {/* Pros / Cons */}
          {((broker.pros?.length ?? 0) > 0 || (broker.cons?.length ?? 0) > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#059669", marginBottom: 14 }}>ຂໍ້ດີ</div>
                {(broker.pros ?? []).map((p: string) => (
                  <div key={p} style={{ display: "flex", gap: 8, fontSize: 13, color: "#111827", marginBottom: 8 }}>
                    <CheckCircle size={14} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />{p}
                  </div>
                ))}
              </div>
              <div style={{ background: "#FFF7F7", border: "1.5px solid #FECACA", borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#DC2626", marginBottom: 14 }}>ຂໍ້ເສຍ</div>
                {(broker.cons ?? []).map((c: string) => (
                  <div key={c} style={{ display: "flex", gap: 8, fontSize: 13, color: "#111827", marginBottom: 8 }}>
                    <XCircle size={14} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />{c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div style={{ background: "linear-gradient(135deg,#EEF3FF,#F5F3FF)", border: "1.5px solid #BFCFFF", borderRadius: 14, padding: "24px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 6 }}>ພ້ອມເລີ່ມ Trade ກັບ {broker.name} ແລ້ວບໍ?</div>
            <div style={{ fontSize: 13, color: "#374151", marginBottom: 18 }}>ສະໝັກງ່າຍ · ຟຣີ · ໃຊ້ເວລາ 5 ນາທີ</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {broker.registerUrl && (
                <TrackedBrokerLink href={broker.registerUrl} brokerName={broker.name} action="broker_click"
                  style={{ display: "inline-flex", alignItems: "center", padding: "11px 32px", background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
                  ສະໝັກດຽວນີ້ →
                </TrackedBrokerLink>
              )}
              {broker.affiliateUrl && (
                <TrackedBrokerLink href={broker.affiliateUrl} brokerName={broker.name} action="broker_website_click"
                  style={{ display: "inline-flex", alignItems: "center", padding: "11px 20px", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: "none", border: "1.5px solid #D1D5DB" }}>
                  ເຂົ້າເວັບໂບຣກເກີ
                </TrackedBrokerLink>
              )}
            </div>
          </div>

          <PostEngagement
            postId={broker._id}
            postTitle={`ລີວິວ ${broker.name}`}
            postUrl={`https://laoforextrader.com/broker/${broker.slug?.current ?? ""}`}
          />

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "#9CA3AF" }}>
            ⚠ ການລົງທຶນໃນ Forex ມີຄວາມສ່ຽງ · ທ່ານອາດສູນເສຍເງິນທຶນ
          </div>
        </div>
      </div>
    )
  }

  // ── Fall back to article ───────────────────────────────────────────────────
  const article = await sanityClient.fetch<Article>(QUERIES.articleBySlug(slug), {}, { next: { revalidate: 60 } })
  if (!article) notFound()

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>

        <Link href="/broker"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 13, textDecoration: "none", marginBottom: 20, fontWeight: 500 }}>
          <ArrowLeft size={13} /> ກັບໄປໜ້າ Broker
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 14, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          {article.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "#9CA3AF", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #E5E7EB", flexWrap: "wrap" }}>
          {article.author && <span style={{ color: "#374151", fontWeight: 500 }}>{article.author.name}</span>}
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{formatDate(article.publishedAt)}</span>
          {article.readTime && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{article.readTime} ນາທີ</span>}
        </div>

        {article.excerpt && (
          <div style={{ background: "#F9FAFB", borderLeft: "3px solid #BFCFFF", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: 24, color: "#374151", fontSize: 14, lineHeight: 1.7 }}>
            {article.excerpt}
          </div>
        )}

        <div>
          {article.body && <PortableText value={article.body} components={ptComponents} />}
        </div>

        <PostEngagement
          postId={article._id}
          postTitle={article.title}
          postUrl={`https://laoforextrader.com/broker/${article.slug?.current ?? ""}`}
        />

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #E5E7EB" }}>
          <Link href="/broker" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#2563EB", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
            <ArrowLeft size={13} /> ກັບໄປໜ້າ Broker
          </Link>
        </div>
      </div>
    </div>
  )
}
