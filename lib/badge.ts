type BadgeInput = {
  github_id: string
  tier: string
  tier_rank: number | null
  score: number
}

const TIER_META: Record<string, { label: string; color: string }> = {
  challenger: { label: '챌린저', color: '#FF4655' },
  diamond:    { label: '다이아',  color: '#56C8D8' },
  platinum:   { label: '플래티넘', color: '#5AC9A6' },
  gold:       { label: '골드',    color: '#FFD700' },
  silver:     { label: '실버',    color: '#C0C0C0' },
  bronze:     { label: '브론즈',  color: '#CD7F32' },
}

export function generateBadgeSvg({ tier, tier_rank, score }: BadgeInput): string {
  const meta = TIER_META[tier] ?? TIER_META.bronze
  const tierLabel = tier_rank !== null ? `${meta.label} ${tier_rank}` : meta.label
  const scoreLabel = `${score.toLocaleString('ko-KR')}점`

  const leftText = 'DevTier'
  const midText = tierLabel
  const rightText = scoreLabel

  const leftW = 60
  const midW = 64
  const rightW = 56 + rightText.length * 5
  const totalW = leftW + midW + rightW
  const h = 20

  const leftCx = leftW / 2
  const midCx = leftW + midW / 2
  const rightCx = leftW + midW + rightW / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalW}" height="${h}" rx="3"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftW}" height="${h}" fill="#555"/>
    <rect x="${leftW}" width="${midW}" height="${h}" fill="${meta.color}"/>
    <rect x="${leftW + midW}" width="${rightW}" height="${h}" fill="#444"/>
    <rect width="${totalW}" height="${h}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${leftCx}" y="15" fill="#010101" fill-opacity=".3">${leftText}</text>
    <text x="${leftCx}" y="14">${leftText}</text>
    <text x="${midCx}" y="15" fill="#010101" fill-opacity=".3">${midText}</text>
    <text x="${midCx}" y="14">${midText}</text>
    <text x="${rightCx}" y="15" fill="#010101" fill-opacity=".3">${rightText}</text>
    <text x="${rightCx}" y="14">${rightText}</text>
  </g>
</svg>`
}
