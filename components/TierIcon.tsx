import Image from 'next/image'

type Props = { tier: string; size?: number; className?: string }

const TIER_ANIM: Record<string, string> = {
  challenger: 'animate-float',
  diamond:    'animate-rotate-shimmer',
  platinum:   'animate-glow-pulse',
  gold:       'animate-glow-pulse',
  silver:     'animate-glow-pulse',
  bronze:     'animate-glow-pulse',
}

export function TierIcon({ tier, size = 56, className = '' }: Props) {
  const anim = TIER_ANIM[tier] ?? 'animate-glow-pulse'
  const src = `/tier-icons/${tier}.png`
  return (
    <Image
      src={src}
      alt={`${tier} 아이콘`}
      width={size}
      height={size}
      className={`${anim} ${className}`}
    />
  )
}
