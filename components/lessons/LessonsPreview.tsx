// The lessons block on the homepage.
//
// Flat surface, same tokens as /broker. It was a soft-blue grid of pills that
// slid in one by one behind an IntersectionObserver — a client component, and
// a client bundle, for a list of ten links. It is a server component now and
// the numbers do the ordering work the animation was doing.

import Link from "next/link"
import type { Article } from "@/types"
import { btnOutline, ArrowIcon } from "@/components/broker/review/BrokerBits"

interface Props {
  lessons: Article[]
  /**
   * How many lessons exist, counted in Sanity. The heading used to say "50
   * ບົດ" from memory while the dataset held 52 — a number nobody would ever
   * notice going stale, on a page whose whole argument is that its numbers
   * are checked.
   */
  total?: number
}

export function LessonsPreview({ lessons, total }: Props) {
  if (!lessons?.length) return null

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="lao-head m-0 text-[26px] font-bold leading-tight tracking-[-0.025em] text-bk-ink sm:text-[30px]">
            ຮຽນ Forex ຟຣີ{total ? ` ${total} ບົດ` : ""}
          </h2>
          <p className="m-0 mt-2 text-base leading-[1.7] text-bk-muted">
            ຕັ້ງແຕ່ສູນຈົນໃຊ້ງານໄດ້ · ພາສາລາວ · ຮຽງຕາມລຳດັບ
          </p>
        </div>
        <Link
          href="/lessons"
          className="hidden shrink-0 text-[15px] font-semibold text-bk-muted underline decoration-bk-line underline-offset-4 hover:text-bk-ink sm:block"
        >
          ທັງໝົດ
        </Link>
      </div>

      <ol className="m-0 mt-6 grid list-none grid-cols-1 gap-0 overflow-hidden rounded-bk border border-bk-line p-0 md:grid-cols-2">
        {lessons.map((lesson, i) => (
          <li
            key={lesson._id}
            // The hairline between two columns has to come from the cells, not
            // from divide-y: a two-column grid divided by rows draws a line
            // across the gap and through the middle of the pair.
            className="border-b border-bk-line last:border-b-0 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0 md:[&:nth-child(odd)]:border-r"
          >
            <Link
              href={`/lessons/${lesson.slug?.current ?? ""}`}
              className="flex min-h-[56px] items-center gap-3 px-4 py-3 no-underline hover:bg-bk-sunken"
            >
              <span className="shrink-0 font-mono text-[13px] font-bold text-bk-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 text-[15px] font-semibold leading-[1.6] tracking-[-0.01em] text-bk-ink">
                {lesson.title}
              </span>
              <span className="shrink-0 font-mono text-[12px] text-bk-muted">
                {lesson.readTime ?? 5}m
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <Link href="/lessons" className={`${btnOutline} w-full sm:w-auto`}>
          ເບິ່ງບົດຮຽນທັງໝົດ
          <ArrowIcon size={15} />
        </Link>
      </div>
    </section>
  )
}
