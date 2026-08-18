"use client"

import { trackClick, type ClickGroup } from "@/lib/trackClick"

interface Props {
  href: string
  /** Stable id used as the /admin row key — lowercase, e.g. "ea-abs-download" */
  target: string
  label?: string
  group?: ClickGroup
  /** Outbound links open in a new tab by default; pass false for internal ones. */
  external?: boolean
  style?: React.CSSProperties
  className?: string
  children: React.ReactNode
}

/**
 * A plain <a> that reports the click to GA4 + /api/track/click.
 *
 * Exists as its own client component so server components (the /ea-system
 * pages) can drop it in without becoming client components themselves.
 */
export default function TrackedLink({
  href,
  target,
  label,
  group = "other",
  external = true,
  style,
  className,
  children,
}: Props) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => trackClick({ target, label, group })}
      style={style}
      className={className}
    >
      {children}
    </a>
  )
}
