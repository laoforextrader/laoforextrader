import Image from 'next/image'
import styles from './FounderSection.module.css'
import { sanityClient, QUERIES } from '@/lib/sanity'
import { EAStats } from '@/types'

function fmtPct(n: number | undefined, fallback: string): string {
  if (n === undefined || n === null || isNaN(n)) return fallback
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(0)}%`
}

export default async function FounderSection() {
  let stats: EAStats | null = null
  try {
    stats = await sanityClient.fetch<EAStats>(
      QUERIES.eaStatsByEaId('sgride'),
      {},
      { next: { revalidate: 60 } }
    )
    if (!stats || stats.updateMode === 'off') stats = null
  } catch {}
  const eaTotal = fmtPct(stats?.profitTotalPct, '+500%')

  return (
    <section className={styles.founderSection}>
      <div className={styles.founderInner}>
        {/* Left: Founder photo */}
        <div className={styles.founderImgSide}>
          <Image
            src="/images/founder.png"
            alt="Mee Muangsong"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 480px"
            style={{ objectFit: 'contain', objectPosition: 'bottom center' }}
          />
        </div>

        {/* Right: Content */}
        <div className={styles.founderRight}>
          <div className={styles.founderEyebrow}>
            <div className={styles.founderEyebrowLine} />
            <div className={styles.founderEyebrowText}>Founder &amp; Lead Trader</div>
          </div>

          <h2 className={styles.founderName}>
            Mee<br />Muangsong
          </h2>
          <p className={styles.founderRole}>
            Forex Trader since 2014 · Founder of Laos Forex Community
          </p>

          <div className={styles.founderDivider} />

          <span className={styles.founderQuoteMark}>&ldquo;</span>
          <p className={styles.founderQuote}>
            ຈົ່ງກ້າວຂ້າມຂີດຈຳກັດ ເພື່ອພິສູດສາກະຍະພາບຂອງທ່ານ
            ໂອກາດ ແລະ ທາງເລືອກຢູ່ໃນມືທ່ານ
          </p>

          <div className={styles.founderStats}>
            <div>
              <div className={styles.statNumber}>2014</div>
              <div className={styles.statLabel}>Started Trading</div>
            </div>
            <div>
              <div className={`${styles.statNumber} ${styles.statNumberBlue}`}>{eaTotal}</div>
              <div className={styles.statLabel}>EA in 7 months</div>
            </div>
            <div>
              <div className={styles.statNumber}>12K+</div>
              <div className={styles.statLabel}>Community</div>
            </div>
            <div>
              <div className={styles.statNumber}>10+</div>
              <div className={styles.statLabel}>Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
