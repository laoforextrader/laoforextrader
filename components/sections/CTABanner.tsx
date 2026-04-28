import Link from 'next/link'

export default function CTABanner() {
  return (
    <div style={{ background: 'linear-gradient(135deg,#1E3A8A,#2563EB,#4F46E5)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 5 }}>
            ຢາກເລີ່ມ Copy Trade TheRocket EA?
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', fontFamily: "'Noto Sans Lao', sans-serif", lineHeight: 1.6 }}>
            ເປີດບັນຊີຜ່ານ Link LFT · ຮັບ Merchandise ຟຣີ · ກຳໄລ Live ທຸກວັນ
          </div>
        </div>
        <Link href="/ea-system"
          style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#2563EB', background: '#fff', padding: '13px 32px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
          ເລີ່ມເລີຍ →
        </Link>
      </div>
    </div>
  )
}
