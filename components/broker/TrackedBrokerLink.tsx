"use client"

// A broker outbound link that records the click. Its only reason to be a
// client component is the two trackers, which is what lets the sections
// around it stay server components.
//
// `rel` carries `sponsored` because these are affiliate links: Google asks
// for it, and a review site that hides the relationship is the kind of site
// this one is trying not to be.

import { event } from "@/lib/gtag"
import { trackClick, brokerTarget } from "@/lib/trackClick"

interface Props {
  href: string
  brokerName: string
  /**
   * The broker slug, which is what every other surface keys its click
   * counters on. Falls back to the name so an older caller still records
   * something rather than nothing.
   */
  slug?: string
  action?: "broker_click" | "broker_website_click"
  style?: React.CSSProperties
  className?: string
  children: React.ReactNode
}

export function TrackedBrokerLink({
  href,
  brokerName,
  slug,
  action = "broker_click",
  style,
  className,
  children,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => {
        event({ action, category: "Broker", label: brokerName })
        trackClick({
          target: brokerTarget(slug || brokerName),
          label: brokerName,
          group: "broker",
        })
      }}
      style={style}
      className={className}
    >
      {children}
    </a>
  )
}
