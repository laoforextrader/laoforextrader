import Link from "next/link"
import Image from "next/image"
import { Article } from "@/types"
import { urlFor } from "@/lib/sanity"
import { formatDate, categoryRoute } from "@/lib/utils"
import { Clock } from "lucide-react"

const CAT_COLOR: Record<string,string> = {
  broker:"text-accent", news:"text-green-600", education:"text-violet",
  analysis:"text-amber-600", "ea-tools":"text-pink",
}
const CAT_LABEL: Record<string,string> = {
  broker:"● ລີວິວ Broker", news:"● ຂ່າວ", education:"● ການສຶກສາ",
  analysis:"● ວິເຄາະ", "ea-tools":"● EA & Tools",
}

interface Props { article: Article; variant?: "default"|"featured" }

export function ArticleCard({ article, variant="default" }: Props) {
  const href = `/${categoryRoute(article.category)}/${article.slug?.current ?? ""}`
  if (variant === "featured") {
    return (
      <Link href={href} className="block cursor-pointer group">
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${CAT_COLOR[article.category] ?? "text-fg-3"}`}>
          {CAT_LABEL[article.category] ?? article.category}
        </div>
        <h3 className="font-lao text-[15px] font-semibold leading-snug text-fg group-hover:text-accent-strong transition-colors mb-2">
          {article.title}
        </h3>
        <div className="font-lao text-[11px] text-fg-4">{article.author?.name} · {formatDate(article.publishedAt)}</div>
      </Link>
    )
  }
  return (
    <Link href={href} className="grid grid-cols-[1fr_76px] gap-3 items-start py-4 px-5 border-b border-line-2 group hover:bg-surface-2 transition-colors cursor-pointer">
      <div>
        <div className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 ${CAT_COLOR[article.category] ?? "text-fg-4"}`}>
          {CAT_LABEL[article.category] ?? article.category}
        </div>
        <h3 className="font-lao text-[13px] font-semibold leading-snug text-fg group-hover:text-accent-strong transition-colors mb-1.5 line-clamp-2">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-fg-4 font-lao">
          <span>{article.author?.name}</span>
          <span>·</span>
          <span>{formatDate(article.publishedAt)}</span>
          {article.readTime && <><span>·</span><span className="flex items-center gap-0.5"><Clock size={9}/>{article.readTime}m</span></>}
        </div>
      </div>
      {article.coverImage ? (
        <div className="relative w-[76px] h-[54px] rounded-lg overflow-hidden bg-surface-3 flex-shrink-0">
          <Image src={urlFor(article.coverImage).width(152).url()} alt={article.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
      ) : (
        <div className="w-[76px] h-[54px] rounded-lg bg-surface-3 flex-shrink-0 flex items-center justify-center font-mono text-xl font-bold text-fg-4">
          {article.category === "broker" ? "$" : article.category === "ea-tools" ? "⚙" : "F"}
        </div>
      )}
    </Link>
  )
}
