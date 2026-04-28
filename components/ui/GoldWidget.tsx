'use client'
import { useGoldPrice } from '@/hooks/useGoldPrice'

export function GoldWidget() {
  const { xauusd, laoGoldLAK, change, changePct, isLive } = useGoldPrice()
  const up        = change >= 0
  const hasChange = change !== 0

  return (
    <div className="hidden lg:block card p-4 animate-float shadow-xl">
      {/* XAUUSD header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">XAUUSD Live</span>
        <span
          className={`flex items-center gap-1 text-[10px] font-mono font-semibold ${
            isLive ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`}
          />
          {isLive ? 'LIVE' : 'LOAD'}
        </span>
      </div>

      {/* Spot price */}
      <div className="font-mono text-2xl font-medium text-gray-900 mb-0.5">
        {xauusd
          ? xauusd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : 'Loading...'}
      </div>
      <div
        className={`font-mono text-[11px] font-semibold mb-2 ${
          hasChange ? (up ? 'text-green-600' : 'text-red-500') : 'text-gray-400'
        }`}
      >
        {hasChange ? (
          <>
            {up ? '▲' : '▼'} {up ? '+' : ''}
            {change.toFixed(2)} ({up ? '+' : ''}
            {changePct.toFixed(2)}%)
          </>
        ) : (
          <>— —</>
        )}
      </div>

      {/* Lao gold price */}
      <div
        className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
        style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>🪙</span>
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#D97706',
            }}
          >
            ລາຄາຄຳລາວ / ບາດ
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#92400E' }}>
            {laoGoldLAK ? `${laoGoldLAK.toLocaleString('en-US')} ກີບ` : 'Loading...'}
          </div>
        </div>
      </div>
    </div>
  )
}
