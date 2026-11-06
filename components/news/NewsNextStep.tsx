// What a reader does after finishing a news item.
//
// A news page that ends at "read the original" sends the reader to somebody
// else's site and does not get them back. Every news page on this site now
// ends with one onward step instead — and it is ONE, not a wall of three:
// a page offering every exit offers none.
//
// Which one appears is picked from a hash of the item id, so it is stable per
// story (a reader returning to the same page sees the same thing) and spread
// across the catalogue (consecutive stories in a list do not all show the
// same block). Deliberately not random: a block that changes on refresh looks
// like an ad slot.

import Link from "next/link"
import Image from "next/image"
import { sanityClient, QUERIES } from "@/lib/sanity"
import type { Broker } from "@/types"
import {
  gradeColor,
  gradeInk,
  licensesOf,
  minDepositLabel,
  registerHref,
  sortBrokers,
  laoDepositState,
  LAO_DEPOSIT_SHORT,
} from "@/lib/broker"
import { ArrowIcon, btnSolid, btnOutline } from "@/components/broker/review/BrokerBits"
import { TrackedBrokerLink } from "@/components/broker/TrackedBrokerLink"

type Variant = "brokers" | "ea" | "topBroker"
const VARIANTS: Variant[] = ["brokers", "ea", "topBroker"]

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export default async function NewsNextStep({ seed }: { seed: string }) {
  const variant = VARIANTS[hash(seed) % VARIANTS.length]

  // The EA block needs no broker data, so it does not pay for the query.
  if (variant === "ea") return <EaNext />

  const brokers = await sanityClient
    .fetch<Broker[]>(QUERIES.featuredBrokers(3), {}, { next: { revalidate: 300 } })
    .catch(() => [])
  if (!brokers?.length) return <EaNext />

  const ranked = sortBrokers(brokers, "rank")
  return variant === "brokers" ? <BrokerListNext brokers={ranked} /> : <TopBrokerNext broker={ranked[0]} />
}

/* ── shell ───────────────────────────────────────────────────────────── */

function Shell({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <aside className="mt-10 rounded-bk border border-bk-line bg-bk-surface p-5 sm:p-6">
      <h2 className="lao-head m-0 text-[20px] font-bold leading-snug tracking-[-0.02em] text-bk-ink">
        {title}
      </h2>
      {sub && <p className="m-0 mt-1.5 text-[14px] leading-[1.7] text-bk-muted">{sub}</p>}
      <div className="mt-4">{children}</div>
    </aside>
  )
}

/* ── 1. the shortlist ────────────────────────────────────────────────── */

function BrokerListNext({ brokers }: { brokers: Broker[] }) {
  return (
    <Shell
      title="ເລືອກໂບຣກເກີແນວໃດ"
      sub="ສາມອັນດັບທຳອິດຈາກການເປີດບັນຊີຈິງ ຝາກຈິງ ຖອນຈິງ"
    >
      <ul className="m-0 list-none divide-y divide-bk-line overflow-hidden rounded-bk border border-bk-line p-0">
        {brokers.map((b) => {
          const slug = b.slug?.current ?? ""
          const logo = b.logo?.asset?.url as string | undefined
          const rating = b.rating
          const regs = licensesOf(b)
            .slice(0, 2)
            .map((l) => l.regulator)
            .join(" · ")
          return (
            <li key={b._id}>
              <Link
                href={`/broker/${slug}`}
                className="flex items-center gap-2.5 px-3 py-2.5 no-underline hover:bg-bk-sunken"
              >
                {logo && (
                  <Image
                    src={logo}
                    alt=""
                    width={30}
                    height={30}
                    data-no-dim
                    className="shrink-0 rounded-md border border-bk-line object-cover"
                    style={{ width: 30, height: 30 }}
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold leading-snug tracking-[-0.02em] text-bk-ink">
                    {b.name}
                  </span>
                  <span className="block truncate text-[11px] leading-tight text-bk-muted">
                    {[regs || null, minDepositLabel(b) ? `ຝາກຂັ້ນຕ່ຳ ${minDepositLabel(b)}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {typeof rating === "number" && (
                  <span
                    className="inline-flex shrink-0 items-center justify-center rounded-md px-1.5 py-1 font-mono text-[12px] font-bold"
                    style={{ background: gradeColor(rating), color: gradeInk(rating) }}
                  >
                    {rating.toFixed(1)}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
      <Link href="/broker" className={`${btnOutline} mt-4 w-full sm:w-auto`}>
        ທຽບໂບຣກເກີທັງໝົດ
        <ArrowIcon size={15} />
      </Link>
    </Shell>
  )
}

/* ── 2. copy trading ─────────────────────────────────────────────────── */

function EaNext() {
  return (
    <Shell
      title="ບໍ່ມີເວລານັ່ງເຝົ້າກຣາຟ?"
      sub="TheRocket EA ເທຣດອັດຕະໂນມັດຈາກບັນຊີຈິງຂອງພວກເຮົາ — ຕາມຜົນງານຕົວຈິງໄດ້ທຸກວັນ ທັງເດືອນທີ່ກຳໄລ ແລະ ເດືອນທີ່ຂາດທຶນ"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/ea-system" className={`${btnSolid} w-full sm:w-auto`}>
          ເບິ່ງຜົນງານ EA
          <ArrowIcon size={15} />
        </Link>
        <Link href="/ea" className={`${btnOutline} w-full sm:w-auto`}>
          ສະຖິຕິສົດ
        </Link>
      </div>
    </Shell>
  )
}

/* ── 3. one broker ───────────────────────────────────────────────────── */

function TopBrokerNext({ broker }: { broker: Broker }) {
  const slug = broker.slug?.current ?? ""
  const logo = broker.logo?.asset?.url as string | undefined
  const register = registerHref(broker)
  const lao = laoDepositState(broker)

  return (
    <Shell title={`ພ້ອມເລີ່ມແລ້ວບໍ?`} sub={`ອັນດັບ 1 ຂອງພວກເຮົາໃນຕອນນີ້`}>
      <div className="flex items-center gap-3">
        {logo && (
          <Image
            src={logo}
            alt=""
            width={44}
            height={44}
            data-no-dim
            className="shrink-0 rounded-bk border border-bk-line object-cover"
            style={{ width: 44, height: 44 }}
          />
        )}
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-bold leading-snug tracking-[-0.02em] text-bk-ink">
            {broker.name}
          </span>
          <span className="block truncate text-[12px] leading-tight text-bk-muted">
            {[
              minDepositLabel(broker) ? `ຝາກຂັ້ນຕ່ຳ ${minDepositLabel(broker)}` : null,
              broker.maxLeverage,
              LAO_DEPOSIT_SHORT[lao],
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
        {typeof broker.rating === "number" && (
          <span
            className="inline-flex min-w-[44px] shrink-0 items-center justify-center rounded-bk px-2.5 py-1.5 font-mono text-[15px] font-bold tracking-[-0.02em]"
            style={{ background: gradeColor(broker.rating), color: gradeInk(broker.rating) }}
          >
            {broker.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {register && (
          <TrackedBrokerLink
            href={register}
            brokerName={broker.name}
            slug={slug}
            className={`${btnSolid} w-full sm:w-auto`}
          >
            ເປີດບັນຊີ
            <ArrowIcon size={15} />
          </TrackedBrokerLink>
        )}
        <Link href={`/broker/${slug}`} className={`${btnOutline} w-full sm:w-auto`}>
          ອ່ານລີວິວເຕັມ
        </Link>
      </div>
    </Shell>
  )
}
