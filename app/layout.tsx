import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { MarketTicker } from "@/components/market/MarketTicker"
import { SessionProvider } from "@/components/auth/SessionProvider"

export const metadata: Metadata = {
  title: { default: "LaoForexTrader — ແຫຼ່ງຂໍ້ມູນການເທຣດ #1 ສຳລັບຄົນລາວ", template: "%s | LaoForexTrader" },
  description: "ລີວິວ Broker, ຄວາມຮູ້ການເທຣດ, ວິເຄາະຕະຫຼາດ ສຳລັບ Trader ລາວ",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lo">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        background: "#EDEEF2",
        color: "#111827",
        fontFamily: "'Noto Sans Lao', sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>
        <SessionProvider>
          <Navbar />
          <MarketTicker />
          <main style={{ flex: 1, color: "#111827" }}>{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
