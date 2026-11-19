import { urlFor } from "@/lib/sanity"
import type { ContestSponsor, LocaleText } from "@/lib/contest/store"
import type { Lang } from "@/lib/contest/i18n"
import { loc } from "@/lib/contest/i18n"

// Who backed a round.
//
// Kept on the round document, so the archive keeps showing whoever paid for
// THAT one after the next sponsor has taken over the live page. A logo is
// optional — a name set in type reads better than a stretched bitmap, and
// asking for artwork should never be what holds a round up.

export default function Sponsors({
  sponsors, lang, title, compact = false,
}: {
  sponsors?: ContestSponsor[]
  lang: Lang
  title: string
  compact?: boolean
}) {
  if (!sponsors?.length) return null
  return (
    <div className={compact ? "flex flex-wrap items-center gap-3" : "flex flex-col gap-2.5"}>
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-bk-muted">
        {title}
      </span>
      <div className="flex flex-wrap items-center gap-2.5">
        {sponsors.map((sp, i) => {
          const role = loc(sp.role as LocaleText | undefined, lang)
          const inner = (
            <span className="flex items-center gap-2.5 rounded-bk border border-bk-line bg-bk-surface px-3 py-2">
              {sp.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={urlFor(sp.logo).height(48).fit("max").url()}
                  alt={sp.name ?? "sponsor"}
                  className="h-6 w-auto object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="text-[13px] font-bold">{sp.name}</span>
              )}
              {role && <span className="text-[11.5px] text-bk-muted">{role}</span>}
            </span>
          )
          return sp.url ? (
            <a key={i} href={sp.url} target="_blank" rel="noopener noreferrer sponsored"
              className="hover:opacity-80">{inner}</a>
          ) : (
            <span key={i}>{inner}</span>
          )
        })}
      </div>
    </div>
  )
}
