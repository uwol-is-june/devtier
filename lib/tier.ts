export type TierInfo = {
  tier: string
  tier_rank: number | null
}

// 구간 내 사분위 계산 (1이 최고, 4가 최저)
function calcRank(percentile: number, low: number, high: number): number {
  const ratio = (percentile - low) / (high - low)
  return Math.min(4, Math.floor(ratio * 4) + 1)
}

export function getTierInfo(percentile: number | null, rank?: number): TierInfo {
  if (rank !== undefined && rank <= 100) {
    return { tier: 'challenger', tier_rank: null }
  }

  if (percentile === null) {
    return { tier: 'bronze', tier_rank: 4 }
  }

  if (percentile <= 1) {
    return { tier: 'diamond', tier_rank: 1 }
  }
  if (percentile <= 5) {
    return { tier: 'diamond', tier_rank: calcRank(percentile, 1, 5) }
  }
  if (percentile <= 15) {
    return { tier: 'platinum', tier_rank: calcRank(percentile, 5, 15) }
  }
  if (percentile <= 30) {
    return { tier: 'gold', tier_rank: calcRank(percentile, 15, 30) }
  }
  if (percentile <= 50) {
    return { tier: 'silver', tier_rank: calcRank(percentile, 30, 50) }
  }
  return { tier: 'bronze', tier_rank: calcRank(percentile, 50, 100) }
}
