'use client'

import Image from 'next/image'

export default function FounderSection() {
  return (
    <section className="founder-section">
      <style jsx>{`
        .founder-section {
          background: #fff;
          border-top: 1px solid #D4D8E5;
        }
        .founder-inner {
          max-width: 1060px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 480px 1fr;
          min-height: 500px;
          align-items: stretch;
        }
        .founder-img-side {
          background: #fff;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
          min-height: 500px;
          padding-bottom: 0;
          position: relative;
        }
        .founder-right {
          padding: 56px 52px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .founder-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .founder-eyebrow-line {
          width: 28px;
          height: 1.5px;
          background: #111827;
        }
        .founder-eyebrow-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #374151;
        }
        .founder-name {
          font-size: 42px;
          font-weight: 800;
          color: #111827;
          line-height: 1.0;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
        }
        .founder-role {
          font-size: 14px;
          color: #9CA3AF;
          margin-bottom: 22px;
        }
        .founder-divider {
          width: 40px;
          height: 2px;
          background: #111827;
          margin-bottom: 20px;
        }
        .founder-quote-mark {
          font-size: 52px;
          color: #D1D5DB;
          line-height: 0.8;
          font-family: Georgia, serif;
          display: block;
          margin-bottom: 6px;
        }
        .founder-quote {
          font-size: 18px;
          color: #374151;
          line-height: 1.75;
          font-style: italic;
          margin-bottom: 28px;
        }
        .founder-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px 28px;
        }
        .stat-number {
          font-size: 26px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
        }
        .stat-number.blue {
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label {
          font-size: 10px;
          font-weight: 600;
          color: #9CA3AF;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 3px;
        }
        @media (max-width: 768px) {
          .founder-inner {
            grid-template-columns: 1fr;
          }
          .founder-img-side {
            min-height: 320px;
          }
          .founder-right {
            padding: 32px 24px;
          }
          .founder-name {
            font-size: 32px;
          }
          .founder-quote {
            font-size: 16px;
          }
        }
      `}</style>

      <div className="founder-inner">
        {/* Left: Founder photo */}
        <div className="founder-img-side">
          <Image
            src="/images/founder.png"
            alt="Mee Muangsong"
            fill
            style={{ objectFit: 'contain', objectPosition: 'bottom center' }}
            priority
          />
        </div>

        {/* Right: Content */}
        <div className="founder-right">
          <div className="founder-eyebrow">
            <div className="founder-eyebrow-line" />
            <div className="founder-eyebrow-text">Founder &amp; Lead Trader</div>
          </div>

          <h2 className="founder-name">
            Mee<br />Muangsong
          </h2>
          <p className="founder-role">
            Forex Trader since 2014 · Founder of Laos Forex Community
          </p>

          <div className="founder-divider" />

          <span className="founder-quote-mark">&ldquo;</span>
          <p className="founder-quote">
            ຈຶ່ງທໍາກ້າວລ້ຳຜ່ານທີດຈຳກັດ ເພື່ອພິສູດສາກທະພາບຂອງທ່ານ
            ໂອກາດ ແລະ ທາງເລືອກ ຢູ່ໃນມືທ່ານ
          </p>

          <div className="founder-stats">
            <div>
              <div className="stat-number">2014</div>
              <div className="stat-label">Started Trading</div>
            </div>
            <div>
              <div className="stat-number blue">+500%</div>
              <div className="stat-label">EA in 7 months</div>
            </div>
            <div>
              <div className="stat-number">12K+</div>
              <div className="stat-label">Community</div>
            </div>
            <div>
              <div className="stat-number">10+</div>
              <div className="stat-label">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
