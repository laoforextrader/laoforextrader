import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { MarketTicker } from "@/components/market/MarketTicker"
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper"
import { GoogleAnalytics } from "@next/third-parties/google"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.laoforextrader.com"),
  title: { default: "LaoForexTrader — ແຫຼ່ງຂໍ້ມູນການເທຣດ #1 ສຳລັບຄົນລາວ", template: "%s | LaoForexTrader" },
  description: "ລີວິວ Broker, ຄວາມຮູ້ການເທຣດ, ວິເຄາະຕະຫຼາດ ສຳລັບ Trader ລາວ",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "LaoForexTrader",
    locale: "lo_LA",
    url: "https://www.laoforextrader.com",
    title: "LaoForexTrader — ແຫຼ່ງຂໍ້ມູນການເທຣດ #1 ສຳລັບຄົນລາວ",
    description: "ລີວິວ Broker, ຄວາມຮູ້ການເທຣດ, ວິເຄາະຕະຫຼາດ ສຳລັບ Trader ລາວ",
    images: [{ url: "/opengraph-image" }],
  },
  ...(process.env.NEXT_PUBLIC_FB_APP_ID && {
    facebook: { appId: process.env.NEXT_PUBLIC_FB_APP_ID },
  }),
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
        <SessionProviderWrapper>
          <Navbar />
          <MarketTicker />
          <main style={{ flex: 1, color: "#111827" }}>{children}</main>
          <Footer />
        </SessionProviderWrapper>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
