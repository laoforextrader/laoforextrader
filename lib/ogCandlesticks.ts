export const CANDLES_SVG = `
<g fill="#10B981" opacity="0.9">
  <rect x="20"  y="320" width="18" height="120"/>
  <line x1="29"  y1="290" x2="29"  y2="460" stroke="#10B981" stroke-width="2.5"/>
  <rect x="60"  y="260" width="18" height="160"/>
  <line x1="69"  y1="220" x2="69"  y2="440" stroke="#10B981" stroke-width="2.5"/>
  <rect x="140" y="200" width="18" height="180"/>
  <line x1="149" y1="160" x2="149" y2="420" stroke="#10B981" stroke-width="2.5"/>
  <rect x="220" y="240" width="18" height="130"/>
  <line x1="229" y1="200" x2="229" y2="400" stroke="#10B981" stroke-width="2.5"/>
  <rect x="300" y="180" width="18" height="200"/>
  <line x1="309" y1="130" x2="309" y2="420" stroke="#10B981" stroke-width="2.5"/>
  <rect x="380" y="220" width="18" height="150"/>
  <line x1="389" y1="180" x2="389" y2="410" stroke="#10B981" stroke-width="2.5"/>
  <rect x="500" y="170" width="18" height="180"/>
  <line x1="509" y1="130" x2="509" y2="400" stroke="#10B981" stroke-width="2.5"/>
  <rect x="580" y="200" width="18" height="140"/>
  <line x1="589" y1="165" x2="589" y2="380" stroke="#10B981" stroke-width="2.5"/>
  <rect x="700" y="160" width="18" height="200"/>
  <line x1="709" y1="110" x2="709" y2="410" stroke="#10B981" stroke-width="2.5"/>
  <rect x="780" y="190" width="18" height="160"/>
  <line x1="789" y1="155" x2="789" y2="390" stroke="#10B981" stroke-width="2.5"/>
  <rect x="900" y="140" width="18" height="220"/>
  <line x1="909" y1="90"  x2="909" y2="420" stroke="#10B981" stroke-width="2.5"/>
  <rect x="980" y="170" width="18" height="170"/>
  <line x1="989" y1="130" x2="989" y2="390" stroke="#10B981" stroke-width="2.5"/>
  <rect x="1100" y="120" width="18" height="240"/>
  <line x1="1109" y1="70" x2="1109" y2="430" stroke="#10B981" stroke-width="2.5"/>
  <rect x="1160" y="150" width="18" height="190"/>
  <line x1="1169" y1="110" x2="1169" y2="400" stroke="#10B981" stroke-width="2.5"/>
</g>
<g fill="#EF4444" opacity="0.9">
  <rect x="100" y="280" width="18" height="100"/>
  <line x1="109" y1="250" x2="109" y2="410" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="180" y="250" width="18" height="130"/>
  <line x1="189" y1="210" x2="189" y2="420" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="260" y="230" width="18" height="110"/>
  <line x1="269" y1="200" x2="269" y2="380" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="340" y="260" width="18" height="90"/>
  <line x1="349" y1="235" x2="349" y2="390" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="420" y="200" width="18" height="140"/>
  <line x1="429" y1="165" x2="429" y2="380" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="460" y="230" width="18" height="100"/>
  <line x1="469" y1="205" x2="469" y2="370" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="540" y="190" width="18" height="130"/>
  <line x1="549" y1="155" x2="549" y2="360" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="620" y="220" width="18" height="110"/>
  <line x1="629" y1="190" x2="629" y2="375" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="740" y="210" width="18" height="110"/>
  <line x1="749" y1="180" x2="749" y2="370" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="820" y="200" width="18" height="140"/>
  <line x1="829" y1="165" x2="829" y2="390" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="940" y="180" width="18" height="130"/>
  <line x1="949" y1="145" x2="949" y2="360" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="1020" y="200" width="18" height="100"/>
  <line x1="1029" y1="170" x2="1029" y2="350" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="1060" y="175" width="18" height="120"/>
  <line x1="1069" y1="140" x2="1069" y2="350" stroke="#EF4444" stroke-width="2.5"/>
  <rect x="1140" y="160" width="18" height="130"/>
  <line x1="1149" y1="125" x2="1149" y2="345" stroke="#EF4444" stroke-width="2.5"/>
</g>
`

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
}
