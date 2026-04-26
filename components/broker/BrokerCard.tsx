import Link from "next/link"
import Image from "next/image"
import { Broker } from "@/types"
import { urlFor } from "@/lib/sanity"
import { cn } from "@/lib/utils"

interface Props {
  broker: Broker
  variant?: "sidebar" | "list"
}

const BADGE_STYLES: Record<string, string> = {
  recommended: "bg-gold/15 text-gold",
  new:         "bg-green-400/15 text-green-400",
  top:         "bg-gold/15 text-gold",
}

const BADGE_LABEL: Record<string, string> = {
  recommended: "ແນະນຳ",
  new:         "NEW",
  top:         "#1",
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-gold text-[11px] tracking-tight">
      {"★★★★★".split("").map((star, i) => (
        <span key={i} className={i < Math.floor(rating) ? "opacity-100" : "opacity-20"}>{star}</span>
      ))}
    </div>
  )
}

export function BrokerCard({ broker, variant = "list" }: Props) {
  if (variant === "sidebar") {
    return (
      <Link href={`/broker/${broker.slug.current}`}
        className="flex items-center gap-3 py-3 px-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group cursor-pointer">
        <div className="w-9 h-9 rounded-lg bg-lft-dark3 flex items-center justify-center shrink-0 overflow-hidden">
          {broker.logo
            ? <Image src={urlFor(broker.logo).width(72).url()} alt={broker.name} width={36} height={36} className="object-contain" />
            : <span className="font-mono text-[10px] font-bold text-white/40">{broker.name.slice(0,2)}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white group-hover:text-gold transition-colors">{broker.name}</p>
          <StarRating rating={broker.rating} />
        </div>
        {broker.badge && (
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", BADGE_STYLES[broker.badge])}>
            {BADGE_LABEL[broker.badge]}
          </span>
        )}
      </Link>
    )
  }

  // List variant (broker page)
  return (
    <Link href={`/broker/${broker.slug.current}`}
      className="block card p-5 hover:border-white/10 transition-colors group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-lft-dark4 flex items-center justify-center shrink-0 overflow-hidden">
          {broker.logo
            ? <Image src={urlFor(broker.logo).width(96).url()} alt={broker.name} width={48} height={48} className="object-contain" />
            : <span className="font-mono text-sm font-bold text-white/30">{broker.name.slice(0,2)}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm text-white group-hover:text-gold transition-colors">{broker.name}</h3>
            {broker.badge && (
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", BADGE_STYLES[broker.badge])}>
                {BADGE_LABEL[broker.badge]}
              </span>
            )}
          </div>
          <StarRating rating={broker.rating} />
          <p className="font-lao text-[11px] text-white/40 mt-2 line-clamp-2">{broker.excerpt}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-lg font-semibold text-gold">{broker.rating.toFixed(1)}</div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Score</div>
        </div>
      </div>
      <div className="flex gap-4 mt-4 pt-3 border-t border-white/5 text-[10px] text-white/35">
        <span>ຝາກຂັ້ນຕ່ຳ: <strong className="text-white/60">{broker.minDeposit}</strong></span>
        <span>Leverage: <strong className="text-white/60">{broker.maxLeverage}</strong></span>
        {broker.laoDeposit && <span className="text-green-400">✓ ຮອງຮັບຝາກກີບ</span>}
      </div>
    </Link>
  )
}
