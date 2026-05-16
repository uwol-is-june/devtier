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

function darken(hex: string, amount = 55): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (n >> 16) - amount)
  const g = Math.max(0, ((n >> 8) & 0xff) - amount)
  const b = Math.max(0, (n & 0xff) - amount)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
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

  // Icon shapes drawn in 56×56 coordinate space, scaled to iconW via parent <g>
  let iconDefs = ''
  let iconBody: string
  const dk = darken(color)
  const lk = darken(color, -50)
  if (icon === 'crown') {
    iconDefs = `
    <linearGradient id="badge-crown-${t}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFE566"/>
      <stop offset="40%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </linearGradient>`
    iconBody = `
    <polygon points="46,38 48,40 48,43 46,41" fill="#6B4800" opacity="0.55"/>
    <rect x="10" y="39.5" width="36" height="2" rx="0.5" fill="#5A3800" opacity="0.7"/>
    <path d="M10,38 L10,22 L16,30 L22,18 L28,26 L34,18 L40,30 L46,22 L46,38 Z"
          fill="url(#badge-crown-${t})" opacity="0.9"/>
    <rect x="10" y="36" width="36" height="5" rx="1" fill="url(#badge-crown-${t})"/>
    <circle cx="19" cy="38.5" r="2.5" fill="#fff" opacity="0.4"/>
    <circle cx="28" cy="38.5" r="2.5" fill="#fff" opacity="0.4"/>
    <circle cx="37" cy="38.5" r="2.5" fill="#fff" opacity="0.4"/>
    <rect x="10" y="36" width="36" height="2" rx="0.5" fill="#fff" opacity="0.25"/>`
  } else if (icon === 'gem') {
    iconDefs = `
    <linearGradient id="badge-dia-top-${t}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B8F4FF"/>
      <stop offset="100%" stop-color="${color}"/>
    </linearGradient>
    <linearGradient id="badge-dia-left-${t}" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="#0A7A8A"/>
    </linearGradient>
    <linearGradient id="badge-dia-right-${t}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7EE8F4"/>
      <stop offset="100%" stop-color="#1AA4B8"/>
    </linearGradient>
    <linearGradient id="badge-dia-bot-${t}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2BBCCC"/>
      <stop offset="100%" stop-color="#0A5A68"/>
    </linearGradient>`
    iconBody = `
    <polygon points="28,12 42,24 28,20 14,24" fill="url(#badge-dia-top-${t})"/>
    <polygon points="14,24 28,20 28,46" fill="url(#badge-dia-left-${t})"/>
    <polygon points="42,24 28,20 28,46" fill="url(#badge-dia-right-${t})"/>
    <polygon points="14,24 22,46 28,46" fill="url(#badge-dia-bot-${t})" opacity="0.6"/>
    <polygon points="42,24 34,46 28,46" fill="url(#badge-dia-bot-${t})" opacity="0.4"/>
    <polygon points="28,12 34,18 28,16 22,18" fill="white" opacity="0.4"/>
    <polygon points="28,15 29.5,19 28,23 26.5,19" fill="white" opacity="0.6"/>
    <line x1="42" y1="24" x2="28" y2="46" stroke="#073040" stroke-width="2.5" stroke-opacity="0.5" stroke-linecap="round"/>
    <line x1="14" y1="24" x2="28" y2="12" stroke="white" stroke-width="1" stroke-opacity="0.4" stroke-linecap="round"/>`
  } else {
    iconDefs = `
    <linearGradient id="badge-crystal-${t}" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%" stop-color="${lk}"/>
      <stop offset="50%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${dk}"/>
    </linearGradient>
    <linearGradient id="badge-crystal-rib-l-${t}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${lk}"/>
      <stop offset="100%" stop-color="${dk}"/>
    </linearGradient>
    <linearGradient id="badge-crystal-rib-r-${t}" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${dk}"/>
    </linearGradient>`
    iconBody = `
    <polygon points="20,8 26,8 28,22 20,28" fill="url(#badge-crystal-rib-l-${t})"/>
    <polygon points="36,8 30,8 28,22 36,28" fill="url(#badge-crystal-rib-r-${t})"/>
    <circle cx="28" cy="36" r="16" fill="url(#badge-crystal-${t})"/>
    <circle cx="28" cy="36" r="16" stroke="${dk}" stroke-width="1.5" fill="none"/>
    <circle cx="28" cy="36" r="12" stroke="${lk}" stroke-width="0.75" fill="none" stroke-opacity="0.5"/>
    <path d="M 20 30 A 10 10 0 0 1 36 30" stroke="white" stroke-width="1.5" fill="none" stroke-opacity="0.4" stroke-linecap="round"/>
    <path d="M 22 50 A 16 16 0 0 0 44 36" stroke="${dk}" stroke-width="2.5" fill="none" stroke-opacity="0.45" stroke-linecap="round"/>
    <path d="M 43 29 Q 48 36 43 43" stroke="${dk}" stroke-width="2" fill="none" stroke-opacity="0.3" stroke-linecap="round"/>
    <polygon points="28,29 29.5,33.5 34,33.5 30.5,36.5 32,41 28,38 24,41 25.5,36.5 22,33.5 26.5,33.5"
             fill="white" opacity="0.85"/>`
  }

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
