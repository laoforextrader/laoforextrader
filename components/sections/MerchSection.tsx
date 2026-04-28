import Image from 'next/image'
import styles from './MerchSection.module.css'

export default function MerchSection() {
  return (
    <section className={styles.merchSection}>
      <div className={styles.merchInner}>
        {/* Left: Product images */}
        <div className={styles.merchImgSide}>
          <div className={styles.merchImgBg} />
          <div className={styles.merchImgsWrap}>
            <Image
              className={styles.tshirtImg}
              src="/images/tshirt.png"
              alt="XM T-Shirt"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 530px"
            />
            <Image
              className={styles.capImg}
              src="/images/cap.png"
              alt="XM Cap"
              fill
              sizes="(max-width: 768px) 50vw, 200px"
            />
          </div>
        </div>

        {/* Right: Content */}
        <div className={styles.merchContent}>
          <div className={styles.merchEyebrow}>
            <div className={styles.merchEyebrowLine} />
            <div className={styles.merchEyebrowText}>Exclusive Merchandise</div>
          </div>
          <h2 className={styles.merchHeading}>
            Open account.<br />
            <span>Get free merch.</span>
          </h2>
          <p className={styles.merchDesc}>
            ສະໝັກ Broker ຜ່ານ Link LFT · ຮັບ Merchandise ສ່ວນຕົວຟຣີ ຈຳນວນຈຳກັດ
          </p>
          <div className={styles.merchPerks}>
            <div className={styles.merchPerk}>
              <div className={styles.perkDot} />
              T-Shirt Premium Cotton
            </div>
            <div className={styles.merchPerk}>
              <div className={styles.perkDot} />
              Cap Embroidered
            </div>
            <div className={styles.merchPerk}>
              <div className={styles.perkDot} />
              ສຳລັບລູກຄ້າໃໝ່ທີ່ເປີດ Account ຜ່ານ Link
            </div>
          </div>
          <div className={styles.merchBtns}>
            <button className={styles.btnDark}>CLAIM YOUR GIFT</button>
            <button className={styles.btnOutline}>LEARN MORE</button>
          </div>
          <p className={styles.merchNote}>
            * ຈຳກັດ 1 Gift ຕໍ່ 1 Account · ສ່ວນ Cap ແລະ T-Shirt ມີ Size ຈຳກັດ
          </p>
        </div>
      </div>
    </section>
  )
}
