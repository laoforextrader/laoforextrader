import CTABanner from '@/components/sections/CTABanner'
import EASystemHeroCanvas from '@/components/sections/EASystemHeroCanvas'
import { sanityClient, QUERIES } from '@/lib/sanity'
import { EAStats } from '@/types'

export const revalidate = 60

function fmtPct(n: number | undefined, fallback: string): string {
  if (n === undefined || n === null || isNaN(n)) return fallback
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}

function pctClass(n: number | undefined, fallback: 'blue' | 'amber'): 'blue' | 'amber' {
  if (n === undefined || n === null || isNaN(n)) return fallback
  return n >= 0 ? fallback : 'amber' // negative shows as amber-ish
}

function monthLabel(monthStr: string | undefined): string {
  if (!monthStr) return 'Live'
  // monthStr is "YYYY-MM"
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const [y, m] = monthStr.split('-').map(Number)
  if (!y || !m || m < 1 || m > 12) return 'Live'
  return `${months[m-1]} ${y}`
}

export default async function EASystemPage() {
  let stats: EAStats | null = null
  try {
    stats = await sanityClient.fetch<EAStats>(
      QUERIES.eaStatsByEaId('sgride'),
      {},
      { next: { revalidate: 60 } }
    )
    if (!stats || stats.updateMode === 'off') stats = null
  } catch {}

  const monthly   = stats?.monthlyReturns ?? []
  const lastMonth = monthly.length ? monthly[monthly.length - 1] : null
  const daily     = stats?.dailyReturns ?? []
  const lastDay   = daily.length ? daily[daily.length - 1] : null

  const todayDisplay = fmtPct(lastDay?.profitPct,        '+2.4%')
  const monthDisplay = fmtPct(lastMonth?.profitPct,      '+18.7%')
  const totalDisplay = fmtPct(stats?.profitTotalPct,     '+500%')
  const monthSubLabel = monthLabel(lastMonth?.month)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

        .ea-hero {
          position: relative;
          background: #000;
          overflow: hidden;
          min-height: 440px;
          display: flex;
          align-items: center;
        }
        .ea-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1060px;
          margin: 0 auto;
          padding: 52px 24px;
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 48px;
          align-items: center;
          width: 100%;
        }
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(74, 222, 128, 0.12);
          border: 0.5px solid rgba(74, 222, 128, 0.35);
          border-radius: 100px;
          padding: 4px 12px;
          font-size: 11px;
          color: #4ADE80;
          font-weight: 600;
          margin-bottom: 14px;
        }
        .live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4ADE80;
          animation: ldot 3s infinite;
        }
        @keyframes ldot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
        .ea-stat-card {
          background: rgba(255, 255, 255, 0.08);
          border: 0.5px solid rgba(255, 255, 255, 0.14);
          border-radius: 16px;
          padding: 22px;
          backdrop-filter: blur(10px);
        }
        .ea-sname {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 4px;
          font-family: 'JetBrains Mono', monospace;
        }
        .ea-slabel {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 14px;
        }
        .ea-bigval {
          font-size: 44px;
          font-weight: 700;
          color: #4ADE80;
          line-height: 1;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 3px;
        }
        .ea-bigsub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 18px;
        }
        .ea-minigrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .ea-mini {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 10px;
        }
        .ea-minilabel {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 4px;
        }
        .ea-minival {
          font-size: 17px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }
        .ea-minival.blue { color: #60A5FA; }
        .ea-minival.amber { color: #FCD34D; }
        .ea-minisub {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.3);
          margin-top: 2px;
        }
        .ea-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #60A5FA;
          margin-bottom: 6px;
        }
        .ea-h1 {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }
        .ea-h2 {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #60A5FA, #A78BFA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ea-sub {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.65;
        }

        /* EA Cards white section */
        .ea-cards-section {
          background: #fff;
          border-top: 1px solid #D4D8E5;
          border-bottom: 1px solid #D4D8E5;
        }
        .ea-cards-inner {
          max-width: 1060px;
          margin: 0 auto;
          padding: 48px 24px;
        }
        .section-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #2563EB;
          margin-bottom: 5px;
        }
        .section-title {
          font-size: 26px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 4px;
          letter-spacing: -0.025em;
        }
        .section-title span {
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .section-subtitle {
          font-size: 14px;
          color: #374151;
          margin-bottom: 24px;
        }
        .ea-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 24px;
        }
        .ea-card {
          background: #fff;
          border: 1.5px solid #E2E6F0;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .ea-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }
        .ea-card.blue::before { background: linear-gradient(90deg, #2563EB, #4F46E5); }
        .ea-card.purple::before { background: linear-gradient(90deg, #7C3AED, #EC4899); }
        .ea-card:hover {
          border-color: #2563EB;
          box-shadow: 0 6px 24px rgba(37, 99, 235, 0.09);
          transform: translateY(-3px);
        }
        .ea-tag {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 100px;
          margin-bottom: 12px;
        }
        .ea-tag.blue { background: #EEF3FF; color: #2563EB; }
        .ea-tag.purple { background: #F5F3FF; color: #7C3AED; }
        .ea-card-name {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 3px;
        }
        .ea-card-desc {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 14px;
        }
        .ea-rows {
          border-top: 1px solid #F3F4F6;
          padding-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .ea-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        .ea-k { color: #6B7280; }
        .ea-v { font-weight: 600; color: #111827; }
        .ea-v.ok { color: #059669; }
        .ea-v.am { color: #D97706; }
        .ea-v.rd { color: #DC2626; }
        .btn-blue-full {
          width: 100%;
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          color: #fff;
          border: none;
          padding: 10px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Noto Sans Lao', sans-serif;
        }
        .btn-purple-full {
          width: 100%;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff;
          border: none;
          padding: 10px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Noto Sans Lao', sans-serif;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .step-card {
          background: #F9FAFB;
          border: 1px solid #E2E6F0;
          border-radius: 12px;
          padding: 18px;
          text-align: center;
        }
        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #EEF3FF;
          border: 1.5px solid #BFCFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #2563EB;
          margin: 0 auto 10px;
        }
        .step-title {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 3px;
        }
        .step-sub {
          font-size: 11px;
          color: #6B7280;
        }
        .risk-banner {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 8px;
          padding: 10px 16px;
          margin-bottom: 20px;
          font-size: 11px;
          color: #92400E;
          line-height: 1.6;
        }
        .cta-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-primary {
          font-family: 'Noto Sans Lao', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          border: none;
          padding: 12px 28px;
          border-radius: 10px;
          cursor: pointer;
        }
        .btn-telegram {
          font-family: 'Noto Sans Lao', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: #229ED9;
          border: none;
          padding: 12px 22px;
          border-radius: 10px;
          cursor: pointer;
        }
        .btn-ghost {
          font-family: 'Noto Sans Lao', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1F2937;
          background: #fff;
          border: 1.5px solid #9CA3AF;
          padding: 12px 22px;
          border-radius: 10px;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .ea-hero-inner {
            grid-template-columns: 1fr;
          }
          .ea-cards-grid {
            grid-template-columns: 1fr;
          }
          .steps-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* EA Dark Hero with Particle Canvas */}
      <div className="ea-hero">
        <EASystemHeroCanvas />
        <div className="ea-hero-inner">
          {/* Stat Card — LIVE values from Sanity (fall back to static) */}
          <div className="ea-stat-card">
            <div className="live-badge">
              <div className="live-dot" />
              Live Account Running
            </div>
            <div className="ea-sname">TheRocket EA SGride</div>
            <div className="ea-slabel">ກຳໄລມື້ນີ້</div>
            <div className="ea-bigval">{todayDisplay}</div>
            <div className="ea-bigsub">Live realtime</div>
            <div className="ea-minigrid">
              <div className="ea-mini">
                <div className="ea-minilabel">ເດືອນນີ້</div>
                <div className={`ea-minival ${pctClass(lastMonth?.profitPct, 'blue')}`}>{monthDisplay}</div>
                <div className="ea-minisub">{monthSubLabel}</div>
              </div>
              <div className="ea-mini">
                <div className="ea-minilabel">TOTAL GROWTH</div>
                <div className="ea-minival amber">{totalDisplay}</div>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div>
            <div className="ea-eyebrow">TheRocket EA System</div>
            <div className="ea-h1">ລະບົບ Trade ອັດຕະໂນມັດ</div>
            <div className="ea-h2">ຜົນງານຈິງ ທຸກວັນ</div>
            <div className="ea-sub">
              ກຳໄລຈາກ Live Account · ບໍ່ແມ່ນ Backtest · ກ໊ອບ Trade ໄດ້ທັນທີ
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner between hero and cards */}
      <CTABanner />

      {/* EA Cards — White Section */}
      <div className="ea-cards-section">
        <div className="ea-cards-inner">
          <div className="section-eyebrow">EA Products</div>
          <div className="section-title">
            ເລືອກ EA <span>ທີ່ເໝາະກັບທ່ານ</span>
          </div>
          <div className="section-subtitle">
            ທັງ 2 EA ທຳງານໃນ Live Account ຈິງ
          </div>

          {/* Cards */}
          <div className="ea-cards-grid">
            {/* SGride */}
            <div className="ea-card blue">
              <div className="ea-tag blue">Portfolio Builder</div>
              <div className="ea-card-name">TheRocket EA SGride</div>
              <div className="ea-card-desc">Grid Trading · ກຳໄລຍາວ · ໝັ້ນຄົງ</div>
              <div className="ea-rows">
                <div className="ea-row">
                  <span className="ea-k">Strategy</span>
                  <span className="ea-v">Grid Trading</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Risk Level</span>
                  <span className="ea-v am">Medium</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Profit Style</span>
                  <span className="ea-v ok">Long-term</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Best For</span>
                  <span className="ea-v">Portfolio Growth</span>
                </div>
              </div>
              <a href="/broker" className="btn-blue-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>ໃຊ້ SGride →</a>
            </div>

            {/* MegiHedge */}
            <div className="ea-card purple">
              <div className="ea-tag purple">Aggressive Growth</div>
              <div className="ea-card-name">TheRocket EA MegiHedge</div>
              <div className="ea-card-desc">Hedge · ກຳໄລໄວ · Short-term</div>
              <div className="ea-rows">
                <div className="ea-row">
                  <span className="ea-k">Strategy</span>
                  <span className="ea-v">Hedging</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Risk Level</span>
                  <span className="ea-v rd">Higher</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Profit Style</span>
                  <span className="ea-v ok">Short-term</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Best For</span>
                  <span className="ea-v">Active Growth</span>
                </div>
              </div>
              <a href="/broker" className="btn-purple-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>ໃຊ້ MegiHedge →</a>
            </div>
          </div>

          {/* Steps */}
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <div className="step-title">ເປີດບັນຊີ Broker</div>
              <div className="step-sub">ສະໝັກຜ່ານ Link LFT</div>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <div className="step-title">ເຊື່ອມ EA System</div>
              <div className="step-sub">Connect TheRocket EA</div>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <div className="step-title">Trade ອັດຕະໂນມັດ</div>
              <div className="step-sub">ບໍ່ຕ້ອງເຝົ້ານຳ</div>
            </div>
          </div>

          {/* Risk Disclosure */}
          <div className="risk-banner">
            ⚠ Risk Disclosure: ການລົງທຶນໃນ Forex ມີຄວາມສ່ຽງ · ຜົນງານໃນອະດີດບໍ່ຮັບປະກັນຜົນໃນອະນາຄົດ
          </div>

          {/* CTA Row */}
          <div className="cta-row">
            <a href="/broker" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>ເລີ່ມ Copy Trade</a>
            <a href="https://t.me/laoforextrader" target="_blank" rel="noopener noreferrer" className="btn-telegram" style={{ display: 'inline-block', textDecoration: 'none' }}>Join Telegram</a>
            <a href="https://www.facebook.com/groups/Laoforextrader" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ display: 'inline-block', textDecoration: 'none' }}>ດູ Live Results</a>
          </div>
        </div>
      </div>
    </>
  )
}
