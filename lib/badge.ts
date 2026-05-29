import { TIER_ICON_BASE64 } from './tier-icon-base64'

type BadgeInput = {
  github_id: string
  tier: string
  tier_rank: number | null
  score: number
  percentile: number | null
  theme?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
}

const TIER_META: Record<string, { label: string; color: string; icon: string; anim: string }> = {
  challenger: { label: '챌린저', color: '#FF4655', icon: 'crown',   anim: 'shimmer' },
  diamond:    { label: '다이아',  color: '#56C8D8', icon: 'gem',     anim: 'rotate-shimmer' },
  platinum:   { label: '플래티넘', color: '#5AC9A6', icon: 'crystal', anim: 'glow-pulse' },
  gold:       { label: '골드',    color: '#FFD700', icon: 'crystal', anim: 'glow-pulse' },
  silver:     { label: '실버',    color: '#C0C0C0', icon: 'crystal', anim: 'glow-pulse' },
  bronze:     { label: '브론즈',  color: '#CD7F32', icon: 'crystal', anim: 'glow-pulse' },
}

const THEME_CONFIGS = {
  dark:  { bg: '#161b22', iconBg: '#1c2128', divider: '#30363d', text: '#e6edf3', sub: '#8b949e' },
  light: { bg: '#ffffff', iconBg: '#f6f8fa', divider: '#d0d7de', text: '#1f2328', sub: '#636c76' },
} as const

const SIZE_CONFIGS = {
  sm: { w: 140, h: 44, iconW: 44, textX: 52, y1: 17, y2: 31, fs1: 11, fs2: 9  },
  md: { w: 180, h: 56, iconW: 56, textX: 64, y1: 22, y2: 39, fs1: 13, fs2: 10 },
  lg: { w: 240, h: 72, iconW: 72, textX: 80, y1: 28, y2: 50, fs1: 16, fs2: 12 },
} as const

function getCssAnimations(perimeter: number, iconW: number): string {
  const half = iconW / 2
  return `
  .anim-shimmer { animation: shimmer 2.5s infinite; }
  .anim-rotate  { animation: badge-rotate 5s linear infinite; transform-origin: ${half}px ${half}px; }
  .anim-sparkle { animation: sparkle 2s infinite; }
  .anim-glow    { animation: glow 2s ease-in-out infinite; transform-origin: ${half}px ${half}px; }
  .anim-stroke  { animation: stroke-draw 1.5s ease forwards; }

  @keyframes shimmer      { 0% { transform: translateX(-${iconW}px); } 60%, 100% { transform: translateX(${iconW * 2}px); } }
  @keyframes badge-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes sparkle      { 0%, 100% { opacity: 0; } 50% { opacity: 0.7; } }
  @keyframes glow         { 0%, 100% { stroke-opacity: 0.05; transform: scale(0.909); } 50% { stroke-opacity: 0.35; transform: scale(1.091); } }
  @keyframes stroke-draw  { from { stroke-dashoffset: ${perimeter}; } to { stroke-dashoffset: 0; } }
`
}


export function generateBadgeSvg({ tier, tier_rank, score, percentile, theme = 'dark', size = 'md' }: BadgeInput): string {
  const meta = TIER_META[tier] ?? TIER_META.bronze
  const tc = THEME_CONFIGS[theme]
  const sc = SIZE_CONFIGS[size]
  const { w, h, iconW, textX, y1, y2, fs1, fs2 } = sc
  const sf = iconW / 56

  const tierLabel = tier_rank !== null ? `${meta.label} ${tier_rank}` : meta.label
  const scoreLabel = `${score.toLocaleString('ko-KR')}점`
  const { color, icon, anim } = meta
  const t = tier

  const scoreLine = (tier_rank === null || percentile === null)
    ? `<tspan fill="${tc.text}">${scoreLabel}</tspan>`
    : `<tspan fill="${tc.text}">${scoreLabel}</tspan><tspan fill="${tc.sub}"> · 상위 ${percentile.toFixed(1)}%</tspan>`

  const iconDataUri = TIER_ICON_BASE64[t] ?? TIER_ICON_BASE64.bronze
  const iconDefs = ''
  const iconBody = `<image href="${iconDataUri}" x="0" y="0" width="56" height="56"/>`

  // Animation overlays use iconW-based coordinates (not the scaled 56×56 space)
  let extraDefs = iconDefs
  let animBody: string
  if (anim === 'shimmer') {
    extraDefs += `
    <linearGradient id="sg-${t}" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%"   stop-color="#fff" stop-opacity="0"/>
      <stop offset="45%"  stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="55%"  stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>`
    animBody = `
    <rect width="${iconW}" height="${iconW}" fill="url(#sg-${t})" clip-path="url(#ic-${t})" class="anim-shimmer"/>`
  } else if (anim === 'rotate-shimmer') {
    const half = iconW / 2
    extraDefs += `
    <linearGradient id="rg-${t}" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%"   stop-color="#fff" stop-opacity="0"/>
      <stop offset="45%"  stop-color="#fff" stop-opacity="0.3"/>
      <stop offset="55%"  stop-color="#fff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>`
    animBody = `
    <g clip-path="url(#ic-${t})">
      <rect x="${-half}" y="0" width="${iconW}" height="${iconW}" fill="url(#rg-${t})" class="anim-rotate"/>
    </g>
    <circle cx="${Math.round(iconW * 40 / 56)}" cy="${Math.round(iconW * 16 / 56)}" r="${Math.max(1, Math.round(iconW * 2 / 56))}" fill="#fff" class="anim-sparkle"/>`
  } else {
    const half = iconW / 2
    const r = Math.round(iconW * 22 / 56)
    animBody = `
    <circle cx="${half}" cy="${half}" r="${r}" fill="none" stroke="${color}" stroke-width="1.5" class="anim-glow"/>`
  }

  const perimeter = Math.round(2 * (w - 12) + 2 * (h - 12) + 2 * Math.PI * 6)
  const divY1 = Math.round(h * 10 / 56)
  const divY2 = h - divY1

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <clipPath id="cc-${t}">
      <rect width="${w}" height="${h}" rx="6"/>
    </clipPath>
    <clipPath id="ic-${t}">
      <rect width="${iconW}" height="${iconW}"/>
    </clipPath>${extraDefs}
  </defs>
  <style>${getCssAnimations(perimeter, iconW)}</style>
  <g clip-path="url(#cc-${t})">
    <rect width="${w}" height="${h}" fill="${tc.bg}"/>
    <rect width="${iconW}" height="${iconW}" fill="${tc.iconBg}"/>
    <g transform="scale(${sf})">
      ${iconBody}
    </g>
    ${animBody}
    <line x1="${iconW}" y1="${divY1}" x2="${iconW}" y2="${divY2}" stroke="${tc.divider}" stroke-width="1"/>
  </g>
  <text x="${textX}" y="${y1}"
        font-family="system-ui,-apple-system,'Segoe UI',sans-serif"
        font-size="${fs1}" font-weight="700" fill="${color}">${tierLabel}</text>
  <text x="${textX}" y="${y2}"
        font-family="system-ui,-apple-system,'Segoe UI',sans-serif"
        font-size="${fs2}">
    ${scoreLine}
  </text>
  <rect x="0.75" y="0.75" width="${w - 1.5}" height="${h - 1.5}" rx="6"
        fill="none" stroke="${color}" stroke-width="1.5"
        stroke-dasharray="${perimeter}" stroke-dashoffset="${perimeter}"
        class="anim-stroke"/>
</svg>`
}
