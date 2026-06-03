import type { ScoreData } from './getScoreData'

export type AdviceType = 'streakStart' | 'streakExtend' | 'prPenalty' | 'prCount' | 'density'

export type AdviceItem = {
  type: AdviceType
  gain: number
  days?: number       // streakExtend
  needed?: number     // prPenalty, prCount
  multiplier?: string // prPenalty
  current?: number    // density
}

export function generateAdvice(data: ScoreData): AdviceItem[] {
  if (data.tier === 'challenger') return []

  const { details, score, bot_score } = data
  const items: AdviceItem[] = []

  // 1. 스트릭 (가중치 ×3 — 가장 즉각적인 액션)
  if (details.current_streak === 0) {
    items.push({ type: 'streakStart', gain: 90 })
  } else if (details.current_streak < 30) {
    const days = 30 - details.current_streak
    items.push({ type: 'streakExtend', gain: days * 3, days })
  }

  // 2. PR (가중치 ×3 + 봇 패널티 해제 가능)
  if (details.total_prs < 5) {
    const needed = 5 - details.total_prs
    const prGain = needed * 3
    if (bot_score < 0.99) {
      // raw score를 역산해 패널티 해제 시 예상 점수 증가량 계산
      const rawScore = Math.round(score / bot_score)
      const totalGain = (rawScore - score) + prGain
      items.push({
        type: 'prPenalty',
        gain: totalGain,
        needed,
        multiplier: bot_score.toFixed(2),
      })
    } else {
      items.push({ type: 'prCount', gain: prGain, needed })
    }
  }

  // 3. 잔디 밀도 (가중치 ×100 — 50% 미달 시 큰 점수 갭)
  if (details.contribution_density < 0.5) {
    const gain = Math.round((0.5 - details.contribution_density) * 100 * 100)
    items.push({
      type: 'density',
      gain,
      current: Math.round(details.contribution_density * 100),
    })
  }

  return items.sort((a, b) => b.gain - a.gain).slice(0, 3)
}
