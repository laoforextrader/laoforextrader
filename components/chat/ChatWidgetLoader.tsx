"use client"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

// Lazy-load the widget so its CSS module and Sparkles/Send icons aren't
// in the initial bundle for every page.
const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
  loading: () => null,
})

// Pages the floating button must stay off. /semi is a control panel the owner
// uses on a phone: the bubble sits over the live controls and there is nothing
// for a site assistant to answer there.
const HIDE_ON = ["/semi"]

export default function ChatWidgetLoader() {
  const path = usePathname()
  if (path && HIDE_ON.some(p => path === p || path.startsWith(p + "/"))) return null
  return <ChatWidget />
}
