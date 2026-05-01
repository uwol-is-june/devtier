type Props = { size?: number; className?: string }

// ── 챌린저: 왕관 + shimmer sweep ──────────────────────────────────────────
export function ChallengerIcon({ size = 56, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-float ${className}`}
      aria-label="챌린저 아이콘"
    >
      <defs>
        <radialGradient id="chal-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF4655" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF4655" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chal-crown" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="40%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="chal-gem-r" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8090" />
          <stop offset="100%" stopColor="#FF4655" />
        </linearGradient>
        <linearGradient id="chal-gem-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#90FF98" />
          <stop offset="100%" stopColor="#00C840" />
        </linearGradient>
        <linearGradient id="chal-gem-b" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#90D8FF" />
          <stop offset="100%" stopColor="#0090FF" />
        </linearGradient>
        <linearGradient id="chal-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-1 0;1 0;-1 0"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </linearGradient>
        <filter id="chal-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF4655" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Glow halo */}
      <circle cx="28" cy="28" r="26" fill="url(#chal-glow)" />

      {/* Crown body */}
      <g filter="url(#chal-shadow)">
        {/* Base band */}
        <rect x="12" y="34" width="32" height="8" rx="2" fill="url(#chal-crown)" />
        {/* Left point */}
        <polygon points="12,34 12,18 19,26" fill="url(#chal-crown)" />
        {/* Center point */}
        <polygon points="20,34 28,14 36,34" fill="url(#chal-crown)" />
        {/* Right point */}
        <polygon points="44,34 44,18 37,26" fill="url(#chal-crown)" />
        {/* 3D highlight on base */}
        <rect x="12" y="34" width="32" height="2" rx="1" fill="white" fillOpacity="0.25" />
      </g>

      {/* Gems on crown points */}
      <polygon points="12,20 15,16 18,20 15,24" fill="url(#chal-gem-r)" />
      <polygon points="25,16 28,12 31,16 28,20" fill="url(#chal-gem-g)" />
      <polygon points="38,20 41,16 44,20 41,24" fill="url(#chal-gem-b)" />

      {/* Shimmer overlay */}
      <rect x="12" y="14" width="32" height="28" rx="2" fill="url(#chal-shimmer)" />
    </svg>
  )
}

// ── 다이아: 젬 + rotate-shimmer ───────────────────────────────────────────
export function DiamondIcon({ size = 56, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-rotate-shimmer ${className}`}
      aria-label="다이아 아이콘"
    >
      <defs>
        <linearGradient id="dia-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8F4FF" />
          <stop offset="100%" stopColor="#56C8D8" />
        </linearGradient>
        <linearGradient id="dia-left" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#56C8D8" />
          <stop offset="100%" stopColor="#0A7A8A" />
        </linearGradient>
        <linearGradient id="dia-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7EE8F4" />
          <stop offset="100%" stopColor="#1AA4B8" />
        </linearGradient>
        <linearGradient id="dia-bottom" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#2BBCCC" />
          <stop offset="100%" stopColor="#0A5A68" />
        </linearGradient>
        <filter id="dia-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#56C8D8" floodOpacity="0.8" />
        </filter>
      </defs>

      <g filter="url(#dia-glow)">
        {/* Top facet */}
        <polygon points="28,10 42,24 28,20 14,24" fill="url(#dia-top)" />
        {/* Left facet */}
        <polygon points="14,24 28,20 28,46" fill="url(#dia-left)" />
        {/* Right facet */}
        <polygon points="42,24 28,20 28,46" fill="url(#dia-right)" />
        {/* Bottom point — subtle split */}
        <polygon points="14,24 22,46 28,46" fill="url(#dia-bottom)" opacity="0.6" />
        <polygon points="42,24 34,46 28,46" fill="url(#dia-bottom)" opacity="0.4" />
        {/* Top highlight */}
        <polygon points="28,10 34,18 28,16 22,18" fill="white" fillOpacity="0.4" />
        {/* Inner sparkle */}
        <polygon points="28,15 29.5,19 28,23 26.5,19" fill="white" fillOpacity="0.6" />
      </g>
    </svg>
  )
}

// ── 플래티넘: 크리스탈 메달 + glow-pulse ─────────────────────────────────
export function PlatinumIcon({ size = 56, className = '' }: Props) {
  return <MedalIcon size={size} className={className} color="#5AC9A6" label="플래티넘" glowId="plat" />
}

// ── 골드: 금 메달 + glow-pulse ────────────────────────────────────────────
export function GoldIcon({ size = 56, className = '' }: Props) {
  return <MedalIcon size={size} className={className} color="#FFD700" label="골드" glowId="gold" />
}

// ── 실버: 은 메달 + glow-pulse ────────────────────────────────────────────
export function SilverIcon({ size = 56, className = '' }: Props) {
  return <MedalIcon size={size} className={className} color="#C0C0C0" label="실버" glowId="silver" />
}

// ── 브론즈: 동 메달 + glow-pulse ─────────────────────────────────────────
export function BronzeIcon({ size = 56, className = '' }: Props) {
  return <MedalIcon size={size} className={className} color="#CD7F32" label="브론즈" glowId="bronze" />
}

// ── 내부 공유 메달 컴포넌트 ───────────────────────────────────────────────
function MedalIcon({
  size, className, color, label, glowId,
}: Props & { color: string; label: string; glowId: string }) {
  const darkColor = shadeColor(color, -40)
  const lightColor = shadeColor(color, 40)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-glow-pulse ${className}`}
      style={{ color }}
      aria-label={`${label} 아이콘`}
    >
      <defs>
        <linearGradient id={`${glowId}-face`} x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
        <linearGradient id={`${glowId}-ribbon-l`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
        <linearGradient id={`${glowId}-ribbon-r`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
        <filter id={`${glowId}-shadow`}>
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={color} floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Ribbon left */}
      <polygon points="20,8 26,8 28,22 20,28" fill={`url(#${glowId}-ribbon-l)`} />
      {/* Ribbon right */}
      <polygon points="36,8 30,8 28,22 36,28" fill={`url(#${glowId}-ribbon-r)`} />

      {/* Medal circle */}
      <circle cx="28" cy="36" r="16" fill={`url(#${glowId}-face)`} filter={`url(#${glowId}-shadow)`} />
      {/* 3D rim */}
      <circle cx="28" cy="36" r="16" stroke={darkColor} strokeWidth="1.5" fill="none" />
      {/* Inner ring */}
      <circle cx="28" cy="36" r="12" stroke={lightColor} strokeWidth="0.75" fill="none" strokeOpacity="0.5" />
      {/* Highlight arc */}
      <path d="M 20 30 A 10 10 0 0 1 36 30" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.4" strokeLinecap="round" />
      {/* Center star */}
      <polygon
        points="28,29 29.5,33.5 34,33.5 30.5,36.5 32,41 28,38 24,41 25.5,36.5 22,33.5 26.5,33.5"
        fill="white"
        fillOpacity="0.85"
      />
    </svg>
  )
}

function shadeColor(hex: string, pct: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + pct))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + pct))
  const b = Math.min(255, Math.max(0, (num & 0xff) + pct))
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

// ── 유틸: tier 문자열로 아이콘 선택 ──────────────────────────────────────
export function TierIcon({ tier, size = 56, className = '' }: { tier: string; size?: number; className?: string }) {
  switch (tier) {
    case 'challenger': return <ChallengerIcon size={size} className={className} />
    case 'diamond':    return <DiamondIcon    size={size} className={className} />
    case 'platinum':   return <PlatinumIcon   size={size} className={className} />
    case 'gold':       return <GoldIcon       size={size} className={className} />
    case 'silver':     return <SilverIcon     size={size} className={className} />
    default:           return <BronzeIcon     size={size} className={className} />
  }
}
