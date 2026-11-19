import { toCode } from "@/lib/contest/countries"

// A flag, as an image from flagcdn.com.
//
// Not a flag emoji: Windows ships no flag glyphs at all, so 🇱🇦 renders as
// the letters LA on the desktop machines half the audience reads this on,
// and the board would look broken for them alone.
//
// Plain <img>, not next/image: these are 40px PNGs from a CDN that already
// serves them cached, and routing them through the optimizer would add a
// remote-pattern entry and a function call per flag for no gain.
//
// An unknown value renders nothing rather than a placeholder — a wrong flag
// beside someone's name is worse than no flag.

export default function Flag({
  value, size = 16, className = "",
}: { value?: string | null; size?: number; className?: string }) {
  const code = toCode(value)
  if (!code) return null
  const w = size
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
      alt={code}
      width={w}
      height={Math.round(w * 0.75)}
      loading="lazy"
      decoding="async"
      className={`inline-block shrink-0 rounded-[2px] object-cover align-[-2px] ${className}`}
      style={{ width: w, height: Math.round(w * 0.75) }}
    />
  )
}
