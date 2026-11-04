// The full review page for one broker, composed entirely from structured
// fields. No `body` is required: a doc with its facts filled in produces a
// page that reads as complete, and the Portable Text review — when there is
// one — slots in as one more section rather than being the whole page.

import Link from "next/link"
import Image from "next/image"
import type { Broker } from "@/types"
import {
  SCORE_ROWS,
  brokerAge,
  countryName,
  flagSrc,
  depositMethodsOf,
  faqOf,
  laoDepositState,
  licensesOf,
  minDepositLabel,
  registerHref,
  scoreWord,
  spreadLabel,
  textList,
} from "@/lib/broker"
import {
  ArrowIcon,
  CheckIcon,
  CrossIcon,
  Flag,
  LicenseChips,
  MetaPill,
  NotRecorded,
  ScoreBars,
  Stars,
  btnOutline,
  btnSolid,
} from "./BrokerBits"
import CountUp from "./CountUp"
import FaqAccordion from "./FaqAccordion"
import { formatDate } from "@/lib/utils"

const H2 = "m-0 text-[26px] font-bold leading-tight tracking-[-0.025em] text-bk-ink sm:text-[30px]"
const CARD = "rounded-bk border border-bk-line"

export default function BrokerReview({
  broker,
  others,
}: {
  broker: Broker
  others: Broker[]
}) {
  const slug = broker.slug?.current ?? ""
  const rating = broker.rating ?? 0
  const logo = broker.logo?.asset?.url as string | undefined
  const register = registerHref(broker)
  const licenses = licensesOf(broker)
  const age = brokerAge(broker)
  const lao = laoDepositState(broker)
  const firstName = broker.name.split(" ")[0]

  const facts: { label: string; value: string | null }[] = [
    { label: "ຝາກຂັ້ນຕ່ຳ", value: minDepositLabel(broker) },
    { label: "Leverage ສູງສຸດ", value: broker.maxLeverage ?? null },
    { label: "Spread ເລີ່ມຕົ້ນ", value: spreadLabel(broker) },
    { label: "ຄ່າຄອມມິດຊັ່ນ", value: broker.commission ?? null },
    { label: "ເວລາຖອນເງິນ", value: broker.withdrawalSpeed ?? null },
    { label: "Platform", value: broker.platforms ?? null },
    { label: "ບັນຊີ Swap-free", value: broker.swapFree ? "ມີ" : null },
    { label: "ປີກໍ່ຕັ້ງ", value: broker.founded ? String(broker.founded) : null },
  ]

  const methods = depositMethodsOf(broker)
  const faq = faqOf(broker)
  const pros = textList(broker.pros)
  const cons = textList(broker.cons)
  const bestFor = textList(broker.bestFor)
  const notFor = textList(broker.notFor)
  const scoreRows = SCORE_ROWS.map((r) => ({
    label: r.label,
    value: broker.ratingBreakdown?.[r.key],
  }))

  return (
    <div className="min-h-screen bg-bk-page">
      {/* ── sticky CTA ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-bk-line bg-bk-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6">
          {logo && (
            <Image
              src={logo}
              alt={broker.name}
              width={40}
              height={40}
              data-no-dim
              className="shrink-0 rounded-bk border border-bk-line object-cover"
              style={{ width: 40, height: 40 }}
            />
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-base font-bold leading-snug tracking-[-0.02em] text-bk-ink">
              {broker.name}
            </span>
            <span className="truncate text-sm text-bk-muted">
              {rating.toFixed(1)}
              {minDepositLabel(broker) ? ` · ຝາກຂັ້ນຕ່ຳ ${minDepositLabel(broker)}` : ""}
            </span>
          </span>
          {register && (
            <a
              href={register}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`${btnSolid} shrink-0 px-4 text-sm sm:px-6 sm:text-[15px]`}
            >
              ເປີດບັນຊີ
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-8 sm:px-6">
        <nav aria-label="ເສັ້ນທາງ" className="mb-6 text-[15px] text-bk-muted">
          <Link href="/broker" className="text-bk-muted underline">
            ໂບຣກເກີ
          </Link>
          <span className="mx-2">›</span>
          <span className="text-bk-ink">{broker.name}</span>
        </nav>

        {/* ── head ──────────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
          {logo && (
            <Image
              src={logo}
              alt={broker.name}
              width={96}
              height={96}
              data-no-dim
              className="shrink-0 rounded-bk border border-bk-line object-cover"
              style={{ width: 80, height: 80 }}
            />
          )}
          {broker.websiteLabel && register && (
            <a
              href={register}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`${btnOutline} hidden text-sm sm:inline-flex`}
            >
              ເຂົ້າເວັບ {firstName}
            </a>
          )}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {broker.rank && (
            <MetaPill>
              <CheckIcon />
              ອັນດັບ {broker.rank} ຂອງພວກເຮົາ
            </MetaPill>
          )}
          {broker.reviewedAt && <MetaPill>ອັບເດດ {formatDate(broker.reviewedAt)}</MetaPill>}
          <MetaPill>ທົດສອບດ້ວຍບັນຊີຈິງ</MetaPill>
        </div>

        <h1 className="m-0 text-[32px] font-bold leading-[1.12] tracking-[-0.03em] text-bk-ink sm:text-[44px] lg:text-[48px]">
          ລີວິວ {broker.name}
        </h1>

        {broker.excerpt && (
          <p className="mt-4 max-w-[720px] text-[17px] leading-[1.75] text-bk-muted">
            {broker.excerpt}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Stars rating={rating} size={22} animate />
          <span className="font-mono text-[17px] font-bold text-bk-ink">{rating.toFixed(1)} / 5</span>
          <span className="text-[15px] text-bk-muted">{scoreWord(rating)}</span>
        </div>

        {register && (
          <a
            href={register}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`${btnSolid} mt-7 min-h-[56px] w-full text-[17px] hover:scale-[1.012]`}
          >
            ເປີດບັນຊີ {broker.name}
            <ArrowIcon size={18} />
          </a>
        )}

        {/* ── score ─────────────────────────────────────────────────────── */}
        <section className="mt-12">
          <div className={CARD}>
            <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
              <div>
                <div className="font-mono text-[64px] font-bold leading-[0.95] tracking-[-0.05em] text-bk-ink sm:text-[84px]">
                  <CountUp to={rating} />
                </div>
                <div className="mt-2 text-[22px] font-bold leading-snug tracking-[-0.02em] text-bk-ink">
                  {scoreWord(rating)}
                </div>
                <div className="mt-4">
                  <Stars rating={rating} size={24} />
                </div>
                <div className="mt-4 text-sm leading-normal text-bk-muted">
                  ຄະແນນຈາກການທົດສອບ 5 ດ້ານ
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <ScoreBars rows={scoreRows} />
              </div>
            </div>
          </div>
        </section>

        {/* ── key facts ─────────────────────────────────────────────────── */}
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className={H2}>ຂໍ້ມູນຫຼັກ</h2>
            <span className="flex items-center gap-2 text-sm text-bk-muted">
              <span className="inline-block h-3.5 w-6 rounded border border-dashed border-bk-dash" />
              ຊ່ອງເສັ້ນຂີດ = ຍັງບໍ່ທັນໄດ້ເຕີມຂໍ້ມູນ
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {facts.map((f) => (
              <div
                key={f.label}
                className={`rounded-bk border p-4 sm:p-5 ${
                  f.value ? "border-bk-line" : "border-dashed border-bk-line"
                }`}
              >
                <div className="mb-2 text-sm leading-normal text-bk-muted">{f.label}</div>
                {f.value ? (
                  <div className="font-mono text-[22px] font-bold leading-tight tracking-[-0.03em] text-bk-ink sm:text-[26px]">
                    {f.value}
                  </div>
                ) : (
                  <NotRecorded />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── company ───────────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className={`${H2} mb-4`}>ຂໍ້ມູນບໍລິສັດ</h2>
          <dl className={`${CARD} m-0 divide-y divide-bk-line`}>
            <CompanyRow label="ພູມິພາກທີ່ຈົດທະບຽນ">
              {broker.registeredIn ? (
                <span className="flex items-center gap-2.5">
                  <Flag src={flagSrc(broker.registeredIn)} alt="" w={26} h={19} />
                  <span className="font-semibold text-bk-ink">
                    {countryName(broker.registeredIn)}
                    {broker.registeredCity ? ` · ${broker.registeredCity}` : ""}
                  </span>
                </span>
              ) : (
                <NotRecorded />
              )}
            </CompanyRow>

            <CompanyRow label="ເປີດໃຫ້ບໍລິການມາ">
              {broker.founded ? (
                <span className="font-semibold text-bk-ink">
                  {broker.founded}
                  {age !== null ? ` — ${age} ປີ` : ""}
                </span>
              ) : (
                <NotRecorded />
              )}
            </CompanyRow>

            <CompanyRow label="ເບີໂທຕິດຕໍ່">
              {broker.phone ? (
                <a href={`tel:${broker.phone.replace(/\s/g, "")}`} className="font-semibold text-accent underline">
                  {broker.phone}
                </a>
              ) : (
                <NotRecorded />
              )}
            </CompanyRow>

            <CompanyRow label="ອີເມວ">
              {broker.email ? (
                <a href={`mailto:${broker.email}`} className="break-all font-semibold text-accent underline">
                  {broker.email}
                </a>
              ) : (
                <NotRecorded />
              )}
            </CompanyRow>

            <CompanyRow label="ເວັບໄຊທ໌ຫຼັກ">
              {broker.websiteLabel && register ? (
                <span className="flex flex-wrap items-center justify-end gap-2">
                  <a
                    href={register}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="font-semibold text-accent underline"
                  >
                    {broker.websiteLabel}
                  </a>
                  {/* Said plainly: the destination is the same site, our link
                      just carries a referral tag. Hiding that is what costs
                      a review site its readers. */}
                  <span className="text-[13px] text-bk-muted">ລິ້ງແນະນຳຂອງພວກເຮົາ</span>
                </span>
              ) : (
                <NotRecorded />
              )}
            </CompanyRow>
          </dl>
        </section>

        {/* ── verdict ───────────────────────────────────────────────────── */}
        {(bestFor.length > 0 || notFor.length > 0) && (
          <section className="mt-12 grid gap-4 md:grid-cols-2">
            {bestFor.length > 0 && (
              <VerdictCard title="ເໝາະກັບໃຜ" tone="good" items={bestFor} />
            )}
            {notFor.length > 0 && (
              <VerdictCard title="ບໍ່ເໝາະກັບໃຜ" tone="bad" items={notFor} />
            )}
          </section>
        )}

        {/* ── pros / cons ───────────────────────────────────────────────── */}
        {(pros.length > 0 || cons.length > 0) && (
          <section className="mt-4 grid items-start gap-4 md:grid-cols-2">
            {pros.length > 0 && (
              <div className={`${CARD} p-6 sm:p-8`}>
                <h2 className="m-0 mb-4 text-xl font-bold leading-snug tracking-[-0.02em] text-bk-ink">
                  ຂໍ້ດີ
                </h2>
                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {pros.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <span className="mt-1 text-ok-ink dark:text-ok">
                        <CheckIcon size={17} />
                      </span>
                      <span className="text-[15px] leading-[1.6] text-bk-ink">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cons.length > 0 && (
              <div className={`${CARD} p-6 sm:p-8`}>
                <h2 className="m-0 mb-4 text-xl font-bold leading-snug tracking-[-0.02em] text-bk-ink">
                  ຂໍ້ເສຍ
                </h2>
                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {cons.map((c) => (
                    <li key={c} className="flex items-start gap-3">
                      <span className="mt-1 text-bad-ink dark:text-bad">
                        <CrossIcon size={17} />
                      </span>
                      <span className="text-[15px] leading-[1.6] text-bk-ink">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ── licences ──────────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className={`${H2} mb-2`}>ໃບອະນຸຍາດ ແລະ ຄວາມປອດໄພ</h2>
          <p className="mb-4 text-[15px] leading-relaxed text-bk-muted">
            ເລກໃບອະນຸຍາດກວດສອບໄດ້ຈາກເວັບຂອງຜູ້ກຳກັບດູແລໂດຍກົງ
          </p>
          {licenses.length === 0 ? (
            <div className={`${CARD} p-6 text-[15px] text-bk-muted`}>ຍັງບໍ່ໄດ້ບັນທຶກໃບອະນຸຍາດ</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {licenses.map((l, i) => (
                <div
                  key={`${l.regulator}-${i}`}
                  className={`rounded-bk border p-5 sm:p-6 ${
                    l.isRepresentative ? "border-dashed border-bk-dash" : "border-bk-line"
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    {l.flag && (
                      <Image
                        src={l.flag}
                        alt={l.country ?? ""}
                        width={30}
                        height={22}
                        data-no-dim
                        className="shrink-0 rounded-[3px] border border-bk-line object-cover"
                        style={{ width: 30, height: 22 }}
                      />
                    )}
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-mono text-xl font-bold leading-tight tracking-[-0.02em] text-bk-ink">
                        {l.regulator}
                      </span>
                      {l.country && <span className="text-sm text-bk-muted">{l.country}</span>}
                    </span>
                  </div>
                  {l.entity && <div className="mb-3 text-[13px] leading-relaxed text-bk-muted">{l.entity}</div>}
                  {l.isRepresentative && (
                    // The distinction most sites quietly drop. Being somebody's
                    // authorised representative is not holding the licence.
                    <div className="mb-3 text-[13px] font-semibold leading-relaxed text-warn-ink dark:text-warn">
                      ເປັນພຽງຜູ້ຕາງໜ້າທີ່ໄດ້ຮັບອະນຸຍາດ ບໍ່ແມ່ນຜູ້ຖືໃບອະນຸຍາດເອງ
                    </div>
                  )}
                  {l.licenseNo ? (
                    <div className="inline-block rounded-bk border border-bk-line px-3 py-1.5 font-mono text-sm font-semibold text-bk-ink">
                      ເລກທີ {l.licenseNo}
                    </div>
                  ) : (
                    <NotRecorded />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── deposit ───────────────────────────────────────────────────── */}
        {methods.length > 0 && (
          <section className="mt-12">
            <h2 className={`${H2} mb-4`}>ການຝາກ-ຖອນເງິນ ສຳລັບຄົນລາວ</h2>
            <div className={`${CARD} overflow-hidden`}>
              <div className="hidden grid-cols-4 gap-4 border-b border-bk-line px-5 py-4 text-sm font-semibold text-bk-muted md:grid">
                <span>ຊ່ອງທາງ</span>
                <span>ສະກຸນເງິນ</span>
                <span>ເວລາຖອນ</span>
                <span>ຄ່າທຳນຽມ</span>
              </div>
              <ul className="m-0 list-none divide-y divide-bk-line p-0">
                {methods.map((m, i) => (
                  <li
                    key={`${m.name}-${i}`}
                    className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-5 md:grid-cols-4 md:items-center md:gap-4"
                  >
                    <Cell label="ຊ່ອງທາງ" strong>
                      {m.name ?? "—"}
                    </Cell>
                    <Cell label="ສະກຸນເງິນ">{m.currency ?? "—"}</Cell>
                    <Cell label="ເວລາຖອນ">{m.time ?? <NotRecorded />}</Cell>
                    <Cell label="ຄ່າທຳນຽມ">{m.fee ?? <NotRecorded />}</Cell>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-sm text-bk-muted">
              {lao === "full"
                ? "ຝາກ-ຖອນຜ່ານທະນາຄານລາວເປັນເງິນກີບໄດ້"
                : lao === "partial"
                  ? "ຝາກ-ຖອນຜ່ານທະນາຄານລາວໄດ້ ແຕ່ເປັນສະກຸນ USD"
                  : "ຍັງບໍ່ຮອງຮັບການຝາກ-ຖອນຜ່ານທະນາຄານລາວໂດຍກົງ"}
            </p>
          </section>
        )}

        {/* ── how to open ───────────────────────────────────────────────── */}
        <section className="mt-12">
          <div className={`${CARD} p-6 sm:p-8`}>
            <h2 className={`${H2} mb-6`}>ເປີດບັນຊີ {broker.name} ແນວໃດ</h2>
            <ol className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { t: "ກົດລິ້ງສະໝັກ", d: `ເປີດໜ້າສະໝັກຂອງ ${broker.name} ຈາກລິ້ງໃນໜ້ານີ້` },
                { t: "ຢືນຢັນຕົວຕົນ", d: "ອັບໂຫຼດບັດປະຈຳຕົວ ຫຼື ໜັງສືຜ່ານແດນ ແລະ ເອກະສານທີ່ຢູ່" },
                {
                  t: "ຝາກເງິນ",
                  d: minDepositLabel(broker)
                    ? `ຝາກຂັ້ນຕ່ຳ ${minDepositLabel(broker)} ຜ່ານຊ່ອງທາງທີ່ທ່ານສະດວກ`
                    : "ຝາກເງິນຜ່ານຊ່ອງທາງທີ່ທ່ານສະດວກ",
                },
                { t: "ເລີ່ມເທຣດ", d: "ດາວໂຫຼດແພລດຟອມ ແລ້ວເຂົ້າສູ່ລະບົບດ້ວຍເລກບັນຊີ" },
              ].map((s, i) => (
                <li key={s.t}>
                  <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-bk bg-bk-ink font-mono text-base font-semibold text-bk-page">
                    {i + 1}
                  </span>
                  <div className="mb-2 text-[17px] font-bold leading-snug tracking-[-0.015em] text-bk-ink">
                    {s.t}
                  </div>
                  <div className="text-[15px] leading-[1.7] text-bk-muted">{s.d}</div>
                </li>
              ))}
            </ol>
            {register && (
              <a
                href={register}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`${btnSolid} mt-8 min-h-[56px] w-full text-[17px] hover:scale-[1.012]`}
              >
                ເປີດບັນຊີ {broker.name} ດຽວນີ້
                <ArrowIcon size={18} />
              </a>
            )}
          </div>
        </section>

        {/* ── faq ───────────────────────────────────────────────────────── */}
        {faq.length > 0 && (
          <section className="mt-12">
            <h2 className={`${H2} mb-4`}>ຄຳຖາມທີ່ພົບເລື້ອຍ</h2>
            <FaqAccordion items={faq} />
          </section>
        )}

        {/* ── versus ────────────────────────────────────────────────────── */}
        {others.length > 0 && (
          <section className="mt-12">
            <h2 className={`${H2} mb-4`}>ທຽບ {broker.name} ກັບໂບຣກອື່ນ</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <Link
                  key={o._id}
                  href={`/broker/compare/${slug}-vs-${o.slug?.current}`}
                  className={`${CARD} flex items-center gap-3 p-5 no-underline transition-colors hover:border-bk-ink`}
                >
                  {logo && (
                    <Image src={logo} alt="" width={34} height={34} data-no-dim className="shrink-0 rounded-bk border border-bk-line object-cover" style={{ width: 34, height: 34 }} />
                  )}
                  <span className="text-sm text-bk-muted">vs</span>
                  {o.logo?.asset?.url && (
                    <Image src={o.logo.asset.url} alt="" width={34} height={34} data-no-dim className="shrink-0 rounded-bk border border-bk-line object-cover" style={{ width: 34, height: 34 }} />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-bk-ink">
                    {firstName} ທຽບກັບ {o.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 border-t border-bk-line pt-6">
          <p className="m-0 text-sm leading-[1.75] text-bk-muted">
            ພວກເຮົາໄດ້ຮັບຄ່າຕອບແທນເມື່ອທ່ານເປີດບັນຊີຜ່ານລິ້ງນີ້ ແຕ່ຄະແນນມາຈາກການທົດສອບຈິງ ·
            ການລົງທຶນມີຄວາມສ່ຽງ ທ່ານອາດສູນເສຍເງິນທຶນ
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

function CompanyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5">
      <dt className="text-[15px] leading-normal text-bk-muted">{label}</dt>
      <dd className="m-0 text-right text-base leading-normal">{children}</dd>
    </div>
  )
}

/** Labels show only on a phone, where there is no header row to read from. */
function Cell({
  label,
  children,
  strong = false,
}: {
  label: string
  children: React.ReactNode
  strong?: boolean
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-bk-muted md:hidden">{label}</div>
      <div className={strong ? "text-base font-semibold text-bk-ink" : "text-[15px] text-bk-ink"}>
        {children}
      </div>
    </div>
  )
}

function VerdictCard({
  title,
  tone,
  items,
}: {
  title: string
  tone: "good" | "bad"
  items: string[]
}) {
  return (
    <div className={`${CARD} p-6 sm:p-8`}>
      <div className="mb-4 flex items-center gap-3">
        <span className={tone === "good" ? "text-ok-ink dark:text-ok" : "text-bad-ink dark:text-bad"}>
          {tone === "good" ? <CheckIcon size={22} /> : <CrossIcon size={22} />}
        </span>
        <h2 className="m-0 text-xl font-bold leading-snug tracking-[-0.02em] text-bk-ink">{title}</h2>
      </div>
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-3">
            <span
              className={`mt-2.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                tone === "good" ? "bg-ok" : "bg-bad"
              }`}
            />
            <span className="text-[15px] leading-[1.7] text-bk-ink">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
