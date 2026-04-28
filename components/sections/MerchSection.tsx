'use client'

import Image from 'next/image'

export default function MerchSection() {
  return (
    <section className="merch-section">
      <style jsx>{`
        .merch-section {
          background: #fff;
          border-top: 1px solid #D4D8E5;
          border-bottom: 1px solid #D4D8E5;
        }
        .merch-inner {
          max-width: 1060px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 480px;
          align-items: center;
        }
        .merch-img-side {
          background: #fff;
          position: relative;
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 20px;
        }
        .merch-img-bg {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image:
            repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(5, 150, 105, 0.8) 38px, rgba(5, 150, 105, 0.8) 39px),
            repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(220, 38, 38, 0.5) 38px, rgba(220, 38, 38, 0.5) 39px);
          pointer-events: none;
        }
        .merch-imgs-wrap {
          position: relative;
          width: 100%;
          height: 440px;
        }
        .tshirt-img {
          position: absolute;
          left: 0;
          top: 0;
          width: 78%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.15));
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cap-img {
          position: absolute;
          right: 10px;
          bottom: 20px;
          width: 38%;
          height: 45%;
          object-fit: contain;
          filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.18));
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s;
        }
        .merch-img-side:hover .tshirt-img {
          transform: translateY(-8px) scale(1.03);
        }
        .merch-img-side:hover .cap-img {
          transform: translateY(-10px) scale(1.05) rotate(-3deg);
        }
        .merch-content {
          padding: 56px 48px;
          background: #fff;
          border-left: 1px solid #E5E7EB;
        }
        .merch-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .merch-eyebrow-line {
          width: 28px;
          height: 1.5px;
          background: #9CA3AF;
        }
        .merch-eyebrow-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9CA3AF;
        }
        .merch-heading {
          font-size: 38px;
          font-weight: 800;
          color: #111827;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: 14px;
        }
        .merch-heading span {
          color: #2563EB;
        }
        .merch-desc {
          font-size: 14px;
          color: #374151;
          line-height: 1.75;
          margin-bottom: 24px;
        }
        .merch-perks {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 32px;
        }
        .merch-perk {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #374151;
        }
        .perk-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2563EB;
          flex-shrink: 0;
        }
        .merch-btns {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
        }
        .btn-dark {
          background: #111827;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 13px 28px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Noto Sans Lao', sans-serif;
        }
        .btn-dark:hover {
          background: #374151;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        }
        .btn-outline {
          background: #fff;
          color: #374151;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 13px 24px;
          border-radius: 4px;
          border: 1.5px solid #D1D5DB;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Noto Sans Lao', sans-serif;
        }
        .btn-outline:hover {
          border-color: #9CA3AF;
        }
        .merch-note {
          font-size: 11px;
          color: #9CA3AF;
        }
        @media (max-width: 768px) {
          .merch-inner {
            grid-template-columns: 1fr;
          }
          .merch-content {
            border-left: none;
            border-top: 1px solid #E5E7EB;
            padding: 32px 24px;
          }
          .merch-heading {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="merch-inner">
        {/* Left: Product images */}
        <div className="merch-img-side">
          <div className="merch-img-bg" />
          <div className="merch-imgs-wrap">
            <Image
              className="tshirt-img"
              src="/images/tshirt.png"
              alt="XM T-Shirt"
              fill
              style={{ objectFit: 'contain', objectPosition: 'center left' }}
            />
            <Image
              className="cap-img"
              src="/images/cap.png"
              alt="XM Cap"
              fill
              style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
            />
          </div>
        </div>

        {/* Right: Content */}
        <div className="merch-content">
          <div className="merch-eyebrow">
            <div className="merch-eyebrow-line" />
            <div className="merch-eyebrow-text">Exclusive Merchandise</div>
          </div>
          <h2 className="merch-heading">
            Open account.<br />
            <span>Get free merch.</span>
          </h2>
          <p className="merch-desc">
            ສະໝັກ Broker ຜ່ານ Link LFT · ຮັບ Merchandise ສ່ວນຕົວຟຣີ ຈຳນວນຈຳກັດ
          </p>
          <div className="merch-perks">
            <div className="merch-perk">
              <div className="perk-dot" />
              T-Shirt Premium Cotton
            </div>
            <div className="merch-perk">
              <div className="perk-dot" />
              Cap Embroidered
            </div>
            <div className="merch-perk">
              <div className="perk-dot" />
              ສຳລັບລູກຄ້າໃໝ່ທີ່ເປີດ Account ຜ່ານ Link
            </div>
          </div>
          <div className="merch-btns">
            <button className="btn-dark">CLAIM YOUR GIFT</button>
            <button className="btn-outline">LEARN MORE</button>
          </div>
          <p className="merch-note">
            * ຈຳກັດ 1 Gift ຕໍ່ 1 Account · ສ່ວນ Cap ແລະ T-Shirt ມີ Size ຈຳກັດ
          </p>
        </div>
      </div>
    </section>
  )
}
