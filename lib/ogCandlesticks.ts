export type Candle = {
  x: number
  y: number
  h: number
  wickTop: number
  wickBottom: number
  color: '#10B981' | '#EF4444'
}

// Pre-computed candle layout for the 1200x630 OG canvas.
// Body = rect(x, y, w=18, h). Wick = vertical line at x+8, from wickTop to wickBottom.
export const CANDLES: Candle[] = [
  { x: 20,   y: 320, h: 120, wickTop: 290, wickBottom: 460, color: '#10B981' },
  { x: 60,   y: 260, h: 160, wickTop: 220, wickBottom: 440, color: '#10B981' },
  { x: 140,  y: 200, h: 180, wickTop: 160, wickBottom: 420, color: '#10B981' },
  { x: 220,  y: 240, h: 130, wickTop: 200, wickBottom: 400, color: '#10B981' },
  { x: 300,  y: 180, h: 200, wickTop: 130, wickBottom: 420, color: '#10B981' },
  { x: 380,  y: 220, h: 150, wickTop: 180, wickBottom: 410, color: '#10B981' },
  { x: 500,  y: 170, h: 180, wickTop: 130, wickBottom: 400, color: '#10B981' },
  { x: 580,  y: 200, h: 140, wickTop: 165, wickBottom: 380, color: '#10B981' },
  { x: 700,  y: 160, h: 200, wickTop: 110, wickBottom: 410, color: '#10B981' },
  { x: 780,  y: 190, h: 160, wickTop: 155, wickBottom: 390, color: '#10B981' },
  { x: 900,  y: 140, h: 220, wickTop: 90,  wickBottom: 420, color: '#10B981' },
  { x: 980,  y: 170, h: 170, wickTop: 130, wickBottom: 390, color: '#10B981' },
  { x: 1100, y: 120, h: 240, wickTop: 70,  wickBottom: 430, color: '#10B981' },
  { x: 1160, y: 150, h: 190, wickTop: 110, wickBottom: 400, color: '#10B981' },

  { x: 100,  y: 280, h: 100, wickTop: 250, wickBottom: 410, color: '#EF4444' },
  { x: 180,  y: 250, h: 130, wickTop: 210, wickBottom: 420, color: '#EF4444' },
  { x: 260,  y: 230, h: 110, wickTop: 200, wickBottom: 380, color: '#EF4444' },
  { x: 340,  y: 260, h: 90,  wickTop: 235, wickBottom: 390, color: '#EF4444' },
  { x: 420,  y: 200, h: 140, wickTop: 165, wickBottom: 380, color: '#EF4444' },
  { x: 460,  y: 230, h: 100, wickTop: 205, wickBottom: 370, color: '#EF4444' },
  { x: 540,  y: 190, h: 130, wickTop: 155, wickBottom: 360, color: '#EF4444' },
  { x: 620,  y: 220, h: 110, wickTop: 190, wickBottom: 375, color: '#EF4444' },
  { x: 740,  y: 210, h: 110, wickTop: 180, wickBottom: 370, color: '#EF4444' },
  { x: 820,  y: 200, h: 140, wickTop: 165, wickBottom: 390, color: '#EF4444' },
  { x: 940,  y: 180, h: 130, wickTop: 145, wickBottom: 360, color: '#EF4444' },
  { x: 1020, y: 200, h: 100, wickTop: 170, wickBottom: 350, color: '#EF4444' },
  { x: 1060, y: 175, h: 120, wickTop: 140, wickBottom: 350, color: '#EF4444' },
  { x: 1140, y: 160, h: 130, wickTop: 125, wickBottom: 345, color: '#EF4444' },
]

export type OGStyle = {
  bg: string
  accent: string
  accentLight: string
  badgeBg: string
  badgeColor: string
  catBg: string
  catBorder: string
  catColor: string
  eyebrow: string
  candleOpacity: number
}

export const OG_STYLES: Record<string, OGStyle> = {
  education: {
    bg: 'linear-gradient(160deg, #0A0E1A 0%, #111827 50%, #0D1220 100%)',
    accent: '#EAB308',
    accentLight: '#F59E0B',
    badgeBg: 'linear-gradient(135deg, #EAB308, #CA8A04)',
    badgeColor: '#000',
    catBg: 'rgba(234,179,8,0.12)',
    catBorder: 'rgba(234,179,8,0.3)',
    catColor: '#EAB308',
    eyebrow: '#EAB308',
    candleOpacity: 0.07,
  },
  broker: {
    bg: 'linear-gradient(160deg, #0A0E1A 0%, #111827 50%, #0D1220 100%)',
    accent: '#EAB308',
    accentLight: '#F59E0B',
    badgeBg: 'linear-gradient(135deg, #EAB308, #CA8A04)',
    badgeColor: '#000',
    catBg: 'rgba(234,179,8,0.12)',
    catBorder: 'rgba(234,179,8,0.3)',
    catColor: '#EAB308',
    eyebrow: '#EAB308',
    candleOpacity: 0.07,
  },
  'ea-tools': {
    bg: 'linear-gradient(135deg, #060C1B 0%, #0D1829 60%, #060C1B 100%)',
    accent: '#22D3EE',
    accentLight: '#818CF8',
    badgeBg: 'linear-gradient(135deg, #0891B2, #06B6D4)',
    badgeColor: '#fff',
    catBg: 'rgba(6,182,212,0.12)',
    catBorder: 'rgba(6,182,212,0.3)',
    catColor: '#22D3EE',
    eyebrow: '#22D3EE',
    candleOpacity: 0.06,
  },
  analysis: {
    bg: 'linear-gradient(140deg, #04110C 0%, #071A10 50%, #050F09 100%)',
    accent: '#34D399',
    accentLight: '#6EE7B7',
    badgeBg: 'linear-gradient(135deg, #059669, #10B981)',
    badgeColor: '#fff',
    catBg: 'rgba(16,185,129,0.12)',
    catBorder: 'rgba(16,185,129,0.3)',
    catColor: '#34D399',
    eyebrow: '#34D399',
    candleOpacity: 0.09,
  },
  news: {
    bg: 'linear-gradient(140deg, #04110C 0%, #071A10 50%, #050F09 100%)',
    accent: '#34D399',
    accentLight: '#6EE7B7',
    badgeBg: 'linear-gradient(135deg, #059669, #10B981)',
    badgeColor: '#fff',
    catBg: 'rgba(16,185,129,0.12)',
    catBorder: 'rgba(16,185,129,0.3)',
    catColor: '#34D399',
    eyebrow: '#34D399',
    candleOpacity: 0.09,
  },
  lessons: {
    bg: 'linear-gradient(160deg, #0A0E1A 0%, #111827 50%, #0D1220 100%)',
    accent: '#EAB308',
    accentLight: '#F59E0B',
    badgeBg: 'linear-gradient(135deg, #EAB308, #CA8A04)',
    badgeColor: '#000',
    catBg: 'rgba(234,179,8,0.12)',
    catBorder: 'rgba(234,179,8,0.3)',
    catColor: '#EAB308',
    eyebrow: '#EAB308',
    candleOpacity: 0.07,
  },
  tools: {
    bg: 'linear-gradient(135deg, #060C1B 0%, #0D1829 60%, #060C1B 100%)',
    accent: '#22D3EE',
    accentLight: '#818CF8',
    badgeBg: 'linear-gradient(135deg, #0891B2, #06B6D4)',
    badgeColor: '#fff',
    catBg: 'rgba(6,182,212,0.12)',
    catBorder: 'rgba(6,182,212,0.3)',
    catColor: '#22D3EE',
    eyebrow: '#22D3EE',
    candleOpacity: 0.06,
  },
}

export function getOGStyle(category: string): OGStyle {
  return OG_STYLES[category] || OG_STYLES['education']
}

export const CATEGORY_LABELS: Record<string, string> = {
  education: 'Education',
  'ea-tools': 'EA Tools',
  broker: 'Broker',
  analysis: 'Analysis',
  news: 'News',
  lessons: 'Lessons',
  tools: 'Tools',
}
