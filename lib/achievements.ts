export type AchievementStats = {
  total_contributions: number
  longest_streak: number
  contribution_density: number  // 0~1
  peak_intensity: number
  total_stars: number
  tier: string
  tier_rank: number | null
  rank: number  // 절대 순위 (1~)
  created_at: string  // ISO 8601
}

type ProgressResult = { current: number; target: number; display: string }

type AchievementRule = {
  id: string
  category: 'activity' | 'tier' | 'pattern' | 'social'
  condition: (s: AchievementStats) => boolean
  progress: ((s: AchievementStats) => ProgressResult) | null
}

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'challenger']

function tierAtLeast(s: AchievementStats, minTier: string): boolean {
  return TIER_ORDER.indexOf(s.tier) >= TIER_ORDER.indexOf(minTier)
}

const EARLY_ADOPTER_CUTOFF = new Date('2026-05-28T23:59:59Z')

export const ACHIEVEMENT_RULES: AchievementRule[] = [
  // ── 잔디 기반 ──
  {
    id: 'activity_100',
    category: 'activity',
    condition: (s) => s.total_contributions >= 100,
    progress: (s) => ({
      current: Math.min(s.total_contributions, 100),
      target: 100,
      display: `${s.total_contributions} / 100개`,
    }),
  },
  {
    id: 'activity_365',
    category: 'activity',
    condition: (s) => s.total_contributions >= 365,
    progress: (s) => ({
      current: Math.min(s.total_contributions, 365),
      target: 365,
      display: `${s.total_contributions} / 365개`,
    }),
  },
  {
    id: 'activity_1000',
    category: 'activity',
    condition: (s) => s.total_contributions >= 1000,
    progress: (s) => ({
      current: Math.min(s.total_contributions, 1000),
      target: 1000,
      display: `${s.total_contributions} / 1,000개`,
    }),
  },
  {
    id: 'activity_3000',
    category: 'activity',
    condition: (s) => s.total_contributions >= 3000,
    progress: (s) => ({
      current: Math.min(s.total_contributions, 3000),
      target: 3000,
      display: `${s.total_contributions} / 3,000개`,
    }),
  },
  {
    id: 'activity_5000',
    category: 'activity',
    condition: (s) => s.total_contributions >= 5000,
    progress: (s) => ({
      current: Math.min(s.total_contributions, 5000),
      target: 5000,
      display: `${s.total_contributions} / 5,000개`,
    }),
  },
  {
    id: 'streak_7',
    category: 'activity',
    condition: (s) => s.longest_streak >= 7,
    progress: (s) => ({
      current: Math.min(s.longest_streak, 7),
      target: 7,
      display: `${s.longest_streak} / 7일`,
    }),
  },
  {
    id: 'streak_30',
    category: 'activity',
    condition: (s) => s.longest_streak >= 30,
    progress: (s) => ({
      current: Math.min(s.longest_streak, 30),
      target: 30,
      display: `${s.longest_streak} / 30일`,
    }),
  },
  {
    id: 'streak_100',
    category: 'activity',
    condition: (s) => s.longest_streak >= 100,
    progress: (s) => ({
      current: Math.min(s.longest_streak, 100),
      target: 100,
      display: `${s.longest_streak} / 100일`,
    }),
  },
  {
    id: 'streak_365',
    category: 'activity',
    condition: (s) => s.longest_streak >= 365,
    progress: (s) => ({
      current: Math.min(s.longest_streak, 365),
      target: 365,
      display: `${s.longest_streak} / 365일`,
    }),
  },
  {
    id: 'density_80',
    category: 'activity',
    condition: (s) => s.contribution_density >= 0.8,
    progress: (s) => {
      const pct = Math.round(s.contribution_density * 100)
      return { current: Math.min(pct, 80), target: 80, display: `${pct}% / 80%` }
    },
  },
  {
    id: 'density_95',
    category: 'activity',
    condition: (s) => s.contribution_density >= 0.95,
    progress: (s) => {
      const pct = Math.round(s.contribution_density * 100)
      return { current: Math.min(pct, 95), target: 95, display: `${pct}% / 95%` }
    },
  },

  // ── 티어 기반 ──
  {
    id: 'tier_bronze',
    category: 'tier',
    condition: (s) => tierAtLeast(s, 'bronze'),
    progress: null,
  },
  {
    id: 'tier_silver',
    category: 'tier',
    condition: (s) => tierAtLeast(s, 'silver'),
    progress: null,
  },
  {
    id: 'tier_gold',
    category: 'tier',
    condition: (s) => tierAtLeast(s, 'gold'),
    progress: null,
  },
  {
    id: 'tier_platinum',
    category: 'tier',
    condition: (s) => tierAtLeast(s, 'platinum'),
    progress: null,
  },
  {
    id: 'tier_diamond',
    category: 'tier',
    condition: (s) => tierAtLeast(s, 'diamond'),
    progress: null,
  },
  {
    id: 'tier_challenger',
    category: 'tier',
    condition: (s) => s.tier === 'challenger',
    progress: null,
  },
  {
    id: 'rank_top10',
    category: 'tier',
    condition: (s) => s.rank <= 10,
    progress: (s) => ({
      current: Math.max(0, 100 - s.rank),
      target: 90,
      display: `현재 ${s.rank}위`,
    }),
  },

  // ── 특이 패턴 ──
  {
    id: 'peak_50',
    category: 'pattern',
    condition: (s) => s.peak_intensity >= 50,
    progress: (s) => ({
      current: Math.min(s.peak_intensity, 50),
      target: 50,
      display: `${s.peak_intensity} / 50개/일`,
    }),
  },
  {
    id: 'peak_100',
    category: 'pattern',
    condition: (s) => s.peak_intensity >= 100,
    progress: (s) => ({
      current: Math.min(s.peak_intensity, 100),
      target: 100,
      display: `${s.peak_intensity} / 100개/일`,
    }),
  },
  {
    id: 'star_100',
    category: 'pattern',
    condition: (s) => s.total_stars >= 100,
    progress: (s) => ({
      current: Math.min(s.total_stars, 100),
      target: 100,
      display: `${s.total_stars} / 100개`,
    }),
  },
  {
    id: 'star_1000',
    category: 'pattern',
    condition: (s) => s.total_stars >= 1000,
    progress: (s) => ({
      current: Math.min(s.total_stars, 1000),
      target: 1000,
      display: `${s.total_stars} / 1,000개`,
    }),
  },
  {
    id: 'star_10000',
    category: 'pattern',
    condition: (s) => s.total_stars >= 10000,
    progress: (s) => ({
      current: Math.min(s.total_stars, 10000),
      target: 10000,
      display: `${s.total_stars} / 10,000개`,
    }),
  },
  {
    id: 'sprint_style',
    category: 'pattern',
    condition: (s) => s.contribution_density < 0.3 && s.peak_intensity >= 30,
    progress: null,
  },
  {
    id: 'marathon_style',
    category: 'pattern',
    condition: (s) => s.contribution_density >= 0.8 && s.longest_streak >= 100,
    progress: null,
  },

  // ── 소셜 ──
  {
    id: 'first_scan',
    category: 'social',
    // evaluateAchievements의 isNewUser 옵션으로 처리
    condition: () => false,
    progress: null,
  },
  {
    id: 'early_adopter',
    category: 'social',
    condition: (s) => new Date(s.created_at) <= EARLY_ADOPTER_CUTOFF,
    progress: null,
  },
  {
    id: 'badge_live',
    category: 'social',
    // badge route에서 직접 처리
    condition: () => false,
    progress: null,
  },
]

export function evaluateAchievements(
  stats: AchievementStats,
  opts: { isNewUser: boolean }
): string[] {
  const unlocked: string[] = []
  for (const rule of ACHIEVEMENT_RULES) {
    if (rule.id === 'first_scan') {
      if (opts.isNewUser) unlocked.push('first_scan')
      continue
    }
    if (rule.id === 'badge_live') continue
    if (rule.condition(stats)) unlocked.push(rule.id)
  }
  return unlocked
}

export function getProgress(
  stats: AchievementStats,
  ruleId: string
): ProgressResult | null {
  const rule = ACHIEVEMENT_RULES.find((r) => r.id === ruleId)
  if (!rule || !rule.progress) return null
  return rule.progress(stats)
}
