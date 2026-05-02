type BadgeInput = {
  github_id: string
  tier: string
  tier_rank: number | null
  score: number
  percentile: number | null
}

const TIER_META: Record<string, { label: string; color: string; icon: string; anim: string }> = {
  challenger: { label: '챌린저', color: '#FF4655', icon: 'crown',   anim: 'shimmer' },
  diamond:    { label: '다이아',  color: '#56C8D8', icon: 'gem',     anim: 'rotate-shimmer' },
  platinum:   { label: '플래티넘', color: '#5AC9A6', icon: 'crystal', anim: 'glow-pulse' },
  gold:       { label: '골드',    color: '#FFD700', icon: 'crystal', anim: 'glow-pulse' },
  silver:     { label: '실버',    color: '#C0C0C0', icon: 'crystal', anim: 'glow-pulse' },
  bronze:     { label: '브론즈',  color: '#CD7F32', icon: 'crystal', anim: 'glow-pulse' },
}

const CSS_ANIMATIONS = `
  .anim-shimmer { animation: shimmer 2.5s infinite; }
  .anim-rotate  { animation: badge-rotate 5s linear infinite; transform-origin: 28px 28px; }
  .anim-sparkle { animation: sparkle 2s infinite; }
  .anim-glow    { animation: glow 2s ease-in-out infinite; transform-origin: 28px 28px; }
  .anim-stroke  { animation: stroke-draw 1.5s ease forwards; }

  @keyframes shimmer      { 0% { transform: translateX(-56px); } 60%, 100% { transform: translateX(112px); } }
  @keyframes badge-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes sparkle      { 0%, 100% { opacity: 0; } 50% { opacity: 0.7; } }
  @keyframes glow         { 0%, 100% { stroke-opacity: 0.05; transform: scale(0.909); } 50% { stroke-opacity: 0.35; transform: scale(1.091); } }
  @keyframes stroke-draw  { from { stroke-dashoffset: 468; } to { stroke-dashoffset: 0; } }
`

export function generateBadgeSvg({ tier, tier_rank, score, percentile }: BadgeInput): string {
  const meta = TIER_META[tier] ?? TIER_META.bronze
  const tierLabel = tier_rank !== null ? `${meta.label} ${tier_rank}` : meta.label
  const scoreLabel = `${score.toLocaleString('ko-KR')}점`
  const { color, icon, anim } = meta
  const t = tier

  const scoreLine = (tier_rank === null || percentile === null)
    ? `<tspan fill="#e6edf3">${scoreLabel}</tspan>`
    : `<tspan fill="#e6edf3">${scoreLabel}</tspan><tspan fill="#8b949e"> · 상위 ${percentile.toFixed(1)}%</tspan>`

  // Icon SVG (56×56 area, center 28,28)
  let iconBody: string
  if (icon === 'crown') {
    iconBody = `
    <path d="M10,38 L10,22 L16,30 L22,18 L28,26 L34,18 L40,30 L46,22 L46,38 Z"
          fill="${color}" opacity="0.9"/>
    <rect x="10" y="36" width="36" height="5" rx="1" fill="${color}"/>
    <circle cx="19" cy="38.5" r="2.5" fill="#fff" opacity="0.4"/>
    <circle cx="28" cy="38.5" r="2.5" fill="#fff" opacity="0.4"/>
    <circle cx="37" cy="38.5" r="2.5" fill="#fff" opacity="0.4"/>`
  } else if (icon === 'gem') {
    iconBody = `
    <polygon points="28,12 42,22 42,34 28,44 14,34 14,22"
             fill="none" stroke="${color}" stroke-width="2"/>
    <polygon points="28,12 42,22 28,22 14,22" fill="${color}" opacity="0.25"/>
    <polygon points="28,22 42,34 28,44 14,34" fill="${color}" opacity="0.15"/>
    <line x1="28" y1="22" x2="28" y2="44" stroke="${color}" stroke-width="0.8" opacity="0.3"/>
    <line x1="28" y1="22" x2="14" y2="22" stroke="${color}" stroke-width="0.8" opacity="0.3"/>
    <line x1="28" y1="22" x2="42" y2="22" stroke="${color}" stroke-width="0.8" opacity="0.3"/>
    <circle cx="28" cy="12" r="2" fill="${color}" opacity="0.8"/>`
  } else {
    iconBody = `
    <polygon points="28,12 40,18 44,28 40,38 28,44 16,38 12,28 16,18"
             fill="none" stroke="${color}" stroke-width="2"/>
    <polygon points="28,12 40,18 28,21 16,18" fill="${color}" opacity="0.2"/>
    <circle cx="28" cy="28" r="7" fill="${color}" opacity="0.35"/>
    <circle cx="28" cy="28" r="4" fill="${color}" opacity="0.5"/>`
  }

  // Animation body (CSS class 방식, SMIL 없음)
  let extraDefs = ''
  let animBody: string
  if (anim === 'shimmer') {
    extraDefs = `
    <linearGradient id="sg-${t}" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%"   stop-color="#fff" stop-opacity="0"/>
      <stop offset="45%"  stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="55%"  stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>`
    animBody = `
    <rect width="56" height="56" fill="url(#sg-${t})" clip-path="url(#ic-${t})" class="anim-shimmer"/>`
  } else if (anim === 'rotate-shimmer') {
    extraDefs = `
    <linearGradient id="rg-${t}" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%"   stop-color="#fff" stop-opacity="0"/>
      <stop offset="45%"  stop-color="#fff" stop-opacity="0.3"/>
      <stop offset="55%"  stop-color="#fff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>`
    animBody = `
    <g clip-path="url(#ic-${t})">
      <rect x="-28" y="0" width="56" height="56" fill="url(#rg-${t})" class="anim-rotate"/>
    </g>
    <circle cx="40" cy="16" r="2" fill="#fff" class="anim-sparkle"/>`
  } else {
    animBody = `
    <circle cx="28" cy="28" r="22" fill="none" stroke="${color}" stroke-width="1.5" class="anim-glow"/>`
  }

  const perimeter = 468

  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="56">
  <defs>
    <clipPath id="cc-${t}">
      <rect width="180" height="56" rx="6"/>
    </clipPath>
    <clipPath id="ic-${t}">
      <rect width="56" height="56"/>
    </clipPath>${extraDefs}
  </defs>
  <style>${CSS_ANIMATIONS}</style>
  <g clip-path="url(#cc-${t})">
    <rect width="180" height="56" fill="#161b22"/>
    <rect width="56" height="56" fill="#1c2128"/>
    ${iconBody}
    ${animBody}
    <line x1="56" y1="10" x2="56" y2="46" stroke="#30363d" stroke-width="1"/>
  </g>
  <text x="64" y="22"
        font-family="system-ui,-apple-system,'Segoe UI',sans-serif"
        font-size="13" font-weight="700" fill="${color}">${tierLabel}</text>
  <text x="64" y="39"
        font-family="system-ui,-apple-system,'Segoe UI',sans-serif"
        font-size="10">
    ${scoreLine}
  </text>
  <rect x="0.75" y="0.75" width="178.5" height="54.5" rx="6"
        fill="none" stroke="${color}" stroke-width="1.5"
        stroke-dasharray="${perimeter}" stroke-dashoffset="${perimeter}"
        class="anim-stroke"/>
</svg>`
}
