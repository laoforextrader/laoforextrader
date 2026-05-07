// Section 4 — Technical summary horizontal cards: TradingView mini
// chart LEFT, AI bias + levels + analysis RIGHT.

export interface TechItem {
  _key?: string
  symbol: string
  trend: "bullish" | "bearish" | "neutral" | string
  bias?: string
  support?: string
  resistance?: string
  analysis?: string
}

const TREND_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  bullish: { label: "Bullish",  emoji: "📈", color: "#059669", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.3)" },
  bearish: { label: "Bearish",  emoji: "📉", color: "#DC2626", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.3)" },
  neutral: { label: "Sideways", emoji: "➖", color: "#D97706", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.3)" },
}

const TV_SYMBOL: Record<string, string> = {
  XAUUSD: "OANDA:XAUUSD",
  EURUSD: "FX:EURUSD",
}

export default function TechnicalSection({ items }: { items: TechItem[] }) {
  if (!items || items.length === 0) return null
  return (
    <section className="mb-10">
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-1 flex items-center gap-1.5">
          📊 Technical Summary
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
              className="flex bg-white rounded-2xl overflow-hidden border border-gray-200"
            >
              {/* Chart LEFT */}
              <div className="flex-shrink-0 w-[160px] bg-gray-50 border-r border-gray-100 flex flex-col">
                <div className="px-3 pt-3 pb-1.5 flex items-center justify-between">
                  <div className="font-mono text-[15px] font-bold text-gray-900">{t.symbol}</div>
                </div>
                <div className="flex-1 min-h-[90px]">
                  <iframe
                    scrolling="no"
                    allowTransparency
                    frameBorder={0}
                    src={`https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=en#%7B%22symbol%22%3A%22${encodeURIComponent(tvSymbol)}%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A100%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Atrue%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%7D`}
                    className="w-full h-full"
                    title={`${t.symbol} Chart`}
                  />
                </div>
              </div>

              {/* Content RIGHT */}
              <div className="flex-1 min-w-0 p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}
                  >
                    <span>{tc.emoji}</span> {tc.label}
                  </span>
                </div>
                {t.bias && (
                  <p className="font-lao text-[13px] font-semibold text-gray-800 leading-snug mb-2.5 line-clamp-2">
                    {t.bias}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[10px] mb-2.5 flex-wrap">
                  {t.support && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono"
                      style={{ background: "rgba(16,185,129,0.08)", color: "#059669", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <span className="font-bold uppercase">S</span>
                      <span className="font-bold">{t.support}</span>
                    </span>
                  )}
                  {t.resistance && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <span className="font-bold uppercase">R</span>
                      <span className="font-bold">{t.resistance}</span>
                    </span>
                  )}
                </div>
                {t.analysis && (
                  <p className="font-lao text-[11.5px] text-gray-600 leading-relaxed line-clamp-3 flex-1">
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
