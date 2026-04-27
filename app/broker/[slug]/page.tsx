import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const broker = await sanityClient.fetch(QUERIES.brokerBySlug(slug))
  if (!broker) return { title: "Not found" }
  return {
    title: `ລີວິວ ${broker.name} | LaoForexTrader`,
    description: broker.excerpt ?? `ລີວິວ ${broker.name} ຝາກຂັ້ນຕ່ຳ $${broker.minDeposit} Leverage ${broker.maxLeverage}`,
  }
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

export default async function BrokerDetailPage({ params }: Props) {
  const { slug } = await params
  const broker = await sanityClient.fetch(QUERIES.brokerBySlug(slug))
  if (!broker) notFound()

  const rb = broker.ratingBreakdown ?? {}

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>

        {/* Back */}
        <Link href="/broker"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 13, textDecoration: "none", marginBottom: 20, fontWeight: 500 }}>
          <ArrowLeft size={13} /> ກັບໄປໜ້າ Broker
        </Link>

        {/* Header card */}
        <div style={{ background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 18, padding: "28px 28px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#EEF3FF", border: "1px solid #BFCFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: "#2563EB", flexShrink: 0 }}>
              {broker.name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>{broker.name}</h1>
                {broker.badge && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "#FEF3C7", color: "#92400E" }}>
                    {broker.badge === "recommended" ? "ແນະນຳ" : broker.badge === "top" ? "ອັນດັບ 1" : "ໃໝ່"}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 20, color: "#F59E0B", letterSpacing: -1, marginBottom: 6 }}>
                {"★".repeat(Math.floor(broker.rating ?? 4))}{"☆".repeat(5 - Math.floor(broker.rating ?? 4))}
                <span style={{ fontSize: 13, color: "#6B7280", marginLeft: 8, letterSpacing: 0 }}>{(broker.rating ?? 4).toFixed(1)} / 5</span>
              </div>
              {broker.excerpt && (
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, margin: 0 }}>{broker.excerpt}</p>
              )}
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            {broker.registerUrl && (
              <a href={broker.registerUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "11px 28px", background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
                ສະໝັກເປີດບັນຊີ {broker.name.split(" ")[0]} →
              </a>
            )}
            {broker.affiliateUrl && (
              <a href={broker.affiliateUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "11px 20px", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: "none", border: "1.5px solid #D1D5DB" }}>
                ເຂົ້າເວັບໂບຣກເກີ
              </a>
            )}
          </div>
        </div>

        {/* Stats + Rating breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Key stats */}
          <div style={{ background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563EB", marginBottom: 14 }}>ຂໍ້ມູນຫຼັກ</div>
            {[
              { label: "ຝາກຂັ້ນຕ່ຳ", value: `$${broker.minDeposit ?? "—"}` },
              { label: "Leverage ສູງສຸດ", value: broker.maxLeverage ?? "—" },
              { label: "ຝາກ BCEL", value: broker.laoDeposit ? "✓ ຮອງຮັບ" : "✗ ບໍ່ຮອງຮັບ", green: broker.laoDeposit },
              { label: "ໃບອະນຸຍາດ", value: toStr(broker.regulators ?? broker.regulation) },
              { label: "Platforms", value: toStr(broker.platforms) },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ color: "#6B7280" }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: row.green === true ? "#059669" : row.green === false ? "#9CA3AF" : "#111827", textAlign: "right", maxWidth: "55%" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Rating breakdown */}
          <div style={{ background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563EB", marginBottom: 14 }}>ຄະແນນລາຍດ້ານ</div>
            <StarBar label="ຄວາມໝັ້ນຄົງ" value={rb.stability} />
            <StarBar label="ຝາກ-ຖອນ" value={rb.deposit} />
            <StarBar label="Spread" value={rb.spread} />
            <StarBar label="Support" value={rb.support} />
            <StarBar label="ໂປຣໂມຊັ່ນ" value={rb.promotion} />
          </div>
        </div>

        {/* Pros / Cons */}
        {((broker.pros?.length ?? 0) > 0 || (broker.cons?.length ?? 0) > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#059669", marginBottom: 14 }}>ຂໍ້ດີ</div>
              {(broker.pros ?? []).map((p: string) => (
                <div key={p} style={{ display: "flex", gap: 8, fontSize: 13, color: "#111827", marginBottom: 8 }}>
                  <CheckCircle size={14} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                  {p}
                </div>
              ))}
            </div>
            <div style={{ background: "#FFF7F7", border: "1.5px solid #FECACA", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#DC2626", marginBottom: 14 }}>ຂໍ້ເສຍ</div>
              {(broker.cons ?? []).map((c: string) => (
                <div key={c} style={{ display: "flex", gap: 8, fontSize: 13, color: "#111827", marginBottom: 8 }}>
                  <XCircle size={14} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  {c}
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
              <a href={broker.registerUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", padding: "11px 32px", background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
                ສະໝັກດຽວນີ້ →
              </a>
            )}
            {broker.affiliateUrl && (
              <a href={broker.affiliateUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", padding: "11px 20px", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: "none", border: "1.5px solid #D1D5DB" }}>
                ເຂົ້າເວັບໂບຣກເກີ
              </a>
            )}
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "#9CA3AF" }}>
          ⚠ ການລົງທຶນໃນ Forex ມີຄວາມສ່ຽງ · ທ່ານອາດສູນເສຍເງິນທຶນ
        </div>
      </div>
    </div>
  )
}
