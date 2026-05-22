"use client"
import dynamic from "next/dynamic"

// Lazy-load the widget so its CSS module and Sparkles/Send icons aren't
// in the initial bundle for every page.
const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
  loading: () => null,
})

export default function ChatWidgetLoader() {
  return <ChatWidget />
}
