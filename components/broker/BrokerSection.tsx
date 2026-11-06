// The broker block on the homepage: the three top-ranked brokers with the
// figures someone actually decides on, and a way into the full directory.
//
// Flat surface, same tokens as /broker. What it replaces was a client
// component that staggered three gradient cards in behind an
// IntersectionObserver, drew a #1 badge on a gold gradient, and keyed its
// per-broker tags off slugs ("xm-global", "ic-markets") that no broker doc
// uses any more — so two of the three tags had silently stopped rendering.
//
// It carries no number it has not been given: a broker doc with no recorded
// spread shows "—" here exactly as it does in the directory.

import Link from "next/link"
import Image from "next/image"
import type { Broker } from "@/types"
import {
  licensesOf,
  minDepositLabel,
  spreadLabel,
  laoDepositState,
  LAO_DEPOSIT_SHORT,
  registerHref,
  gradeColor,
  gradeInk,
  scoreWord,
  sortBrokers,
} from "@/lib/broker"
import { Flag, ArrowIcon, btnSolid, btnOutline } from "@/components/broker/review/BrokerBits"
import { TrackedBrokerLink } from "./TrackedBrokerLink"

interface Props {
  brokers: Broker[]
}

export function BrokerSection({ brokers }: Props) {
  if (!brokers?.length) return null
  const top = sortBrokers(brokers, "rank").slice(0, 3)

  return (
    <section className="border-t border-bk-line">
      <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-14">
        <h2 className="lao-head m-0 text-[26px] font-bold leading-tight tracking-[-0.025em] text-bk-ink sm:text-[30px]">
          ໂບຣກເກີທີ່ພວກເຮົາທົດສອບແລ້ວ
        </h2>
        <p className="m-0 mt-2 max-w-[60ch] text-base leading-[1.75] text-bk-muted">
          ເປີດບັນຊີຈິງ ຝາກຈິງ ຖອນຈິງ ກ່ອນໃຫ້ຄະແນນ · ຊ່ອງທີ່ຍັງບໍ່ໄດ້ທົດສອບຈະປະໄວ້ຫວ່າງ
        </p>

        <ul className="m-0 mt-7 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
          {top.map((b) => {
            const slug = b.slug?.current ?? ""
            const licenses = licensesOf(b)
            const rating = b.rating
            const logo = b.logo?.asset?.url as string | undefined
            const register = registerHref(b)
            const lao = laoDepositState(b)

            const rows: { label: string; value: string | null; strong?: boolean }[] = [
              { label: "ຝາກຂັ້ນຕ່ຳ", value: minDepositLabel(b) },
              { label: "Spread ຈາກ", value: spreadLabel(b) },
              { label: "Leverage", value: b.maxLeverage ?? null },
              { label: "ທະນາຄານລາວ", value: LAO_DEPOSIT_SHORT[lao], strong: lao === "full" },
            ]

            return (
              <li key={b._id} className="flex flex-col rounded-bk border border-bk-line bg-bk-surface">
                <div className="flex items-center gap-3 p-4">
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
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/broker/${slug}`}
                        className="truncate text-[17px] font-bold leading-snug tracking-[-0.02em] text-bk-ink no-underline hover:underline"
                      >
                        {b.name}
                      </Link>
                      {b.rank === 1 && (
                        <span className="shrink-0 whitespace-nowrap rounded-md border border-bk-ink px-1.5 py-px text-[10px] font-bold text-bk-ink">
                          ອັນດັບ 1
                        </span>
                      )}
                    </div>
                    {typeof rating === "number" && (
                      <span className="mt-1 block text-[11px] leading-tight text-bk-muted">
                        {scoreWord(rating)}
                      </span>
                    )}
                  </div>
                  {typeof rating === "number" && (
                    <span
                      className="inline-flex min-w-[44px] shrink-0 items-center justify-center rounded-bk px-2.5 py-1.5 font-mono text-[15px] font-bold tracking-[-0.02em]"
                      style={{ background: gradeColor(rating), color: gradeInk(rating) }}
                    >
                      {rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 border-t border-bk-line px-4 py-2.5">
                  {licenses.slice(0, 3).map((l, i) => (
                    <Flag key={`${l.regulator}-${i}`} src={l.flag} alt={l.country ?? ""} w={17} h={12} />
                  ))}
                  <span className="truncate text-xs text-bk-muted">
                    {licenses
                      .slice(0, 3)
                      .map((l) => l.regulator)
                      .join(" · ") || "ຍັງບໍ່ໄດ້ບັນທຶກໃບອະນຸຍາດ"}
                  </span>
                </div>

                <dl className="m-0 grid flex-1 grid-cols-2 gap-x-4 gap-y-3 border-t border-bk-line px-4 py-4">
                  {rows.map((r) => (
                    <div key={r.label} className="min-w-0">
                      <dt className="truncate text-[11px] leading-tight text-bk-muted">{r.label}</dt>
                      <dd
                        className={`m-0 mt-1 truncate font-mono text-[15px] font-bold tracking-[-0.02em] ${
                          r.value === null
                            ? "text-bk-muted"
                            : r.strong
                              ? "text-ok-ink dark:text-ok"
                              : "text-bk-ink"
                        }`}
                      >
                        {r.value ?? "—"}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-col gap-2.5 border-t border-bk-line p-4">
                  {register && (
                    <TrackedBrokerLink
                      href={register}
                      brokerName={b.name}
                      slug={slug}
                      className={`${btnSolid} w-full`}
                    >
                      ເປີດບັນຊີ
                      <ArrowIcon size={15} />
                    </TrackedBrokerLink>
                  )}
                  <Link
                    href={`/broker/${slug}`}
                    className="inline-flex min-h-[44px] items-center justify-center text-center text-sm font-semibold text-bk-muted underline decoration-bk-line underline-offset-4 hover:text-bk-ink"
                  >
                    ອ່ານລີວິວເຕັມ
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/broker" className={`${btnOutline} w-full sm:w-auto`}>
            ທຽບໂບຣກເກີທັງໝົດ
            <ArrowIcon size={15} />
          </Link>
          <Link href="/broker#how-we-rate" className={`${btnOutline} w-full sm:w-auto`}>
            ພວກເຮົາໃຫ້ຄະແນນແນວໃດ
          </Link>
        </div>
      </div>
    </section>
  )
}
