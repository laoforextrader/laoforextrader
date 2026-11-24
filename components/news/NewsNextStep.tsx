// What a reader does after finishing a news item.
//
// A news page that ends at "read the original" sends the reader to somebody
// else's site and does not get them back. Every news page on this site now
// ends with one onward step instead — and it is ONE, not a wall of three:
// a page offering every exit offers none.
//
// WHICH one is two questions, asked in order.
//
// 1. Is this story about a broker we list? A reader who just finished a page
//    about Exness is as close to choosing a broker as they will ever be, and
//    handing them a generic shortlist at that moment throws the match away.
//    So the story's own text decides: `mentions` carries the summariser's
//    extracted broker names, the original English headline and the Lao
//    title/summary, in that order of trust, and lib/brokerMentions.ts says
//    which broker doc — if any — they name. The matcher errs toward silence;
//    claiming a story is about the wrong broker is worse than showing the
//    generic block.
//
//    The card leads with the review, not with "open an account". Half these
//    stories are a regulator fining somebody, and a page that answers "X was
//    just fined" with "open an account at X" is not a review site.
//
// 2. Otherwise, one of three generic blocks, picked from a hash of the item
//    id — stable per story (a reader returning sees the same thing) and
//    spread across the catalogue (consecutive stories in a list do not all
//    show the same block). Deliberately not random: a block that changes on
//    refresh looks like an ad slot.
//
// One Sanity read either way: the same lean broker index answers both
// questions.

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
import { matchBrokers } from "@/lib/brokerMentions"

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

interface Props {
  seed: string
  /**
   * Anything the story says about who it is about, most trustworthy first:
   * the summariser's `brokers[]`, then the original English headline, then
   * the Lao title and summary. Nulls are fine — the caller passes the fields
   * it has without checking them.
   */
  mentions?: (string | null | undefined)[]
}

export default async function NewsNextStep({ seed, mentions }: Props) {
  const variant = VARIANTS[hash(seed) % VARIANTS.length]
  const canMatch = (mentions ?? []).some((m) => m && m.trim())

  // The EA block needs no broker data — but a story that names one of our
  // brokers does, so the query is skipped only when there is nothing to match.
  if (variant === "ea" && !canMatch) return <EaNext />

  const brokers = await sanityClient
    .fetch<Broker[]>(QUERIES.brokerMentionIndex, {}, { next: { revalidate: 300 } })
    .catch(() => [])
  if (!brokers?.length) return <EaNext />

  const named = canMatch ? matchBrokers(mentions ?? [], brokers)[0] : undefined
  if (named) return <MentionedBrokerNext broker={named} />

  if (variant === "ea") return <EaNext />

  const ranked = sortBrokers(brokers, "rank").slice(0, 3)
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
        <Link href="/ea-system/semi" className={`${btnOutline} w-full sm:w-auto`}>
          EA ເຄິ່ງອັດຕະໂນມັດ
        </Link>
      </div>
    </Shell>
  )
}

/* ── 3. one broker ───────────────────────────────────────────────────── */

function TopBrokerNext({ broker }: { broker: Broker }) {
  return <BrokerCard broker={broker} title="ພ້ອມເລີ່ມແລ້ວບໍ?" sub="ອັນດັບ 1 ຂອງພວກເຮົາໃນຕອນນີ້" />
}

/* ── 4. the broker this story is about ───────────────────────────────── */

/**
 * Review first, sign-up second — and the subtitle says what the card is, not
 * what the reader should do. The story above it may well be a fine or a
 * licence withdrawal against this very broker; the card has no idea which,
 * and the one wording that is honest either way is "here is what we recorded
 * about them".
 */
function MentionedBrokerNext({ broker }: { broker: Broker }) {
  return (
    <BrokerCard
      broker={broker}
      title={`ຂ່າວນີ້ເວົ້າເຖິງ ${broker.name}`}
      sub={`ນີ້ແມ່ນສິ່ງທີ່ພວກເຮົາບັນທຶກໄວ້ກ່ຽວກັບ ${broker.name} — ຄະແນນ, ການຝາກຖອນ ແລະ ໃບອະນຸຍາດ`}
      reviewFirst
    />
  )
}

function BrokerCard({
  broker,
  title,
  sub,
  reviewFirst = false,
}: {
  broker: Broker
  title: string
  sub: string
  reviewFirst?: boolean
}) {
  const slug = broker.slug?.current ?? ""
  const logo = broker.logo?.asset?.url as string | undefined
  const register = registerHref(broker)
  const lao = laoDepositState(broker)

  const open = register ? (
    <TrackedBrokerLink
      key="open"
      href={register}
      brokerName={broker.name}
      slug={slug}
      className={`${reviewFirst ? btnOutline : btnSolid} w-full sm:w-auto`}
    >
      ເປີດບັນຊີ
      {!reviewFirst && <ArrowIcon size={15} />}
    </TrackedBrokerLink>
  ) : null

  const review = (
    <Link
      key="review"
      href={`/broker/${slug}`}
      className={`${reviewFirst ? btnSolid : btnOutline} w-full sm:w-auto`}
    >
      ອ່ານລີວິວເຕັມ
      {reviewFirst && <ArrowIcon size={15} />}
    </Link>
  )

  return (
    <Shell title={title} sub={sub}>
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

      {/* DOM order is the visual order on both axes: reversing with
          flex-row-reverse would have left the mobile column the other way
          round from the desktop row. */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {reviewFirst ? [review, open] : [open, review]}
      </div>
    </Shell>
  )
}
