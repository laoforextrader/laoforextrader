"use client"
import { event } from "@/lib/gtag"

interface Props {
  href: string
  brokerName: string
  action?: "broker_click" | "broker_website_click"
  style?: React.CSSProperties
  className?: string
  children: React.ReactNode
}

export function TrackedBrokerLink({
  href,
  brokerName,
  action = "broker_click",
  style,
  className,
  children,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => event({ action, category: "Broker", label: brokerName })}
      style={style}
      className={className}
    >
      {children}
    </a>
  )
}
