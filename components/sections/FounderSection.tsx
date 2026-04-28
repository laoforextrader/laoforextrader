import Image from 'next/image'
import styles from './FounderSection.module.css'

export default function FounderSection() {
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
            ຈຶ່ງທໍາກ້າວລ້ຳຜ່ານທີດຈຳກັດ ເພື່ອພິສູດສາກທະພາບຂອງທ່ານ
            ໂອກາດ ແລະ ທາງເລືອກ ຢູ່ໃນມືທ່ານ
          </p>

          <div className={styles.founderStats}>
            <div>
              <div className={styles.statNumber}>2014</div>
              <div className={styles.statLabel}>Started Trading</div>
            </div>
            <div>
              <div className={`${styles.statNumber} ${styles.statNumberBlue}`}>+500%</div>
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
