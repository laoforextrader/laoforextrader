// Section 4 — technical analysis for major pairs (XAUUSD, EURUSD).
// Embeds TradingView mini chart widget for visual context.

export interface TechItem {
  _key?: string
  symbol: string
  trend: "bullish" | "bearish" | "neutral" | string
  bias?: string
  support?: string
  resistance?: string
  analysis?: string
}

const TREND_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  bullish: { label: "Bullish",  emoji: "📈", color: "#059669", bg: "rgba(16,185,129,0.10)" },
  bearish: { label: "Bearish",  emoji: "📉", color: "#DC2626", bg: "rgba(239,68,68,0.10)" },
  neutral: { label: "Sideways", emoji: "➖", color: "#D97706", bg: "rgba(245,158,11,0.10)" },
}

// Map our internal symbols to TradingView's symbol identifiers
const TV_SYMBOL: Record<string, string> = {
  XAUUSD: "OANDA:XAUUSD",
  EURUSD: "FX:EURUSD",
}

export default function TechnicalSection({ items }: { items: TechItem[] }) {
  if (!items || items.length === 0) return null
  return (
    <section className="mb-12">
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-1 flex items-center gap-1.5">
          📊 Technical
        </div>
        <h2 className="font-sans font-extrabold text-[22px] tracking-tight text-gray-900">
          ການວິເຄາະທາງເຕັກນິກ
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(t => {
          const tc = TREND_CONFIG[t.trend] ?? TREND_CONFIG.neutral
          const tvSymbol = TV_SYMBOL[t.symbol] ?? `FX:${t.symbol}`
          return (
            <div
              key={t._key ?? t.symbol}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            >
              {/* TradingView mini chart */}
              <div className="bg-gray-50 border-b border-gray-100" style={{ height: 180 }}>
                <iframe
                  scrolling="no"
                  allowTransparency
                  frameBorder={0}
                  src={`https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=en#%7B%22symbol%22%3A%22${encodeURIComponent(tvSymbol)}%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A180%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%7D`}
                  className="w-full h-full"
                  title={`${t.symbol} Chart`}
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-[20px] font-bold text-gray-900">{t.symbol}</h3>
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: tc.bg, color: tc.color }}
                  >
                    <span>{tc.emoji}</span> {tc.label}
                  </span>
                </div>

                {t.bias && (
                  <p className="font-lao text-[14px] font-semibold text-gray-800 mb-3 leading-snug">
                    {t.bias}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 mb-0.5">
                      Support
                    </div>
                    <div className="font-mono text-[14px] font-bold text-emerald-700">
                      {t.support || "—"}
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-2.5">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-red-700 mb-0.5">
                      Resistance
                    </div>
                    <div className="font-mono text-[14px] font-bold text-red-700">
                      {t.resistance || "—"}
                    </div>
                  </div>
                </div>

                {t.analysis && (
                  <p className="font-lao text-[13px] text-gray-600 leading-relaxed">
                    {t.analysis}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
