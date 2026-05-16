import { fetchContributions } from './github'
import { calcScore } from './score'
import { getTierInfo } from './tier'
import { supabase } from './supabase'
import { evaluateAchievements, type AchievementStats } from './achievements'

export type ScoreData = {
  github_id: string
  score: number
  tier: string
  tier_rank: number | null
  percentile: number | null
  total_users: number | null
  next_tier_label: string | null
  next_tier_gap: number | null
  details: {
    total_contributions: number
    current_streak: number
    longest_streak: number
    contribution_density: number
    peak_intensity: number
    total_stars: number
    current_year_commits: number
    total_prs: number
    total_issues: number
    top_languages: { name: string; pct: number }[]
  }
}

async function getNextTierGap(tier: string, currentScore: number): Promise<{ next_tier_label: string | null; next_tier_gap: number | null }> {
  if (tier === 'challenger') return { next_tier_label: null, next_tier_gap: null }

  if (tier === 'diamond') {
    const { data: rank100 } = await supabase
      .from('users')
      .select('score')
      .order('score', { ascending: false })
      .range(99, 99)
      .single()
    const gap = rank100 ? rank100.score - currentScore : null
    return {
      next_tier_label: gap !== null && gap > 0 ? '챌린저' : null,
      next_tier_gap: gap !== null && gap > 0 ? gap : null,
    }
  }

  const targetMap: Record<string, { percentile: number; label: string }> = {
    platinum: { percentile: 5, label: '다이아' },
    gold:     { percentile: 15, label: '플래티넘' },
    silver:   { percentile: 30, label: '골드' },
    bronze:   { percentile: 50, label: '실버' },
  }

  const target = targetMap[tier]
  if (!target) return { next_tier_label: null, next_tier_gap: null }

  const { data: cutoff } = await supabase
    .from('users')
    .select('score')
    .lte('percentile', target.percentile)
    .order('percentile', { ascending: false })
    .limit(1)
    .single()

  const gap = cutoff ? cutoff.score - currentScore : null
  return {
    next_tier_label: gap !== null && gap > 0 ? target.label : null,
    next_tier_gap: gap !== null && gap > 0 ? gap : null,
  }
}

export async function getScoreData(username: string): Promise<ScoreData> {
  const stats = await fetchContributions(username)
  const score = calcScore(stats)

  const [{ count }, { count: totalUsers }, { data: existingUser }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).gt('score', score),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('github_id, created_at').eq('github_id', username).maybeSingle(),
  ])
  const isNewUser = !existingUser
  const rank = (count ?? 0) + 1
  const livePercentile = totalUsers ? (rank / totalUsers) * 100 : null

  const tierInfo = getTierInfo(livePercentile, rank)

  const now = new Date().toISOString()

  await supabase.from('users').upsert(
    {
      github_id: username,
      score,
      total_contributions: stats.total_contributions,
      current_streak: stats.current_streak,
      longest_streak: stats.longest_streak,
      contribution_density: stats.contribution_density,
      peak_intensity: stats.peak_intensity,
      total_stars: stats.total_stars,
      current_year_commits: stats.current_year_commits,
      total_prs: stats.total_prs,
      total_issues: stats.total_issues,
      top_languages: stats.top_languages,
      tier: tierInfo.tier,
      tier_rank: tierInfo.tier_rank,
      percentile: livePercentile,
      updated_at: now,
      // created_at 제외 — INSERT 시 DB DEFAULT, UPDATE 시 변경 없음
    },
    { onConflict: 'github_id' }
  )

  const achievementStats: AchievementStats = {
    total_contributions: stats.total_contributions,
    longest_streak: stats.longest_streak,
    contribution_density: stats.contribution_density,
    peak_intensity: stats.peak_intensity,
    total_stars: stats.total_stars,
    tier: tierInfo.tier,
    tier_rank: tierInfo.tier_rank,
    rank,
    created_at: existingUser?.created_at ?? now,
  }

  const unlockedIds = evaluateAchievements(achievementStats, { isNewUser })

  const [{ next_tier_label, next_tier_gap }] = await Promise.all([
    getNextTierGap(tierInfo.tier, score),
    unlockedIds.length > 0
      ? supabase.from('user_achievements').upsert(
          unlockedIds.map((id) => ({ github_id: username, achievement_id: id, unlocked_at: now })),
          { onConflict: 'github_id,achievement_id', ignoreDuplicates: true }
        )
      : Promise.resolve(null),
  ])

  return {
    github_id: username,
    score,
    tier: tierInfo.tier,
    tier_rank: tierInfo.tier_rank,
    percentile: livePercentile,
    total_users: totalUsers ?? null,
    next_tier_label,
    next_tier_gap,
    details: {
      total_contributions: stats.total_contributions,
      current_streak: stats.current_streak,
      longest_streak: stats.longest_streak,
      contribution_density: stats.contribution_density,
      peak_intensity: stats.peak_intensity,
      total_stars: stats.total_stars,
      current_year_commits: stats.current_year_commits,
      total_prs: stats.total_prs,
      total_issues: stats.total_issues,
      top_languages: stats.top_languages,
    },
  }
}

export type WeaknessPercentile = {
  key: string
  label: string
  pct: number
}

export async function getWeaknessPercentiles(username: string): Promise<WeaknessPercentile[]> {
  const [{ data: user }, { count: total }] = await Promise.all([
    supabase
      .from('users')
      .select('total_contributions, current_streak, longest_streak, contribution_density, peak_intensity, total_stars')
      .eq('github_id', username)
      .maybeSingle(),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  if (!user || !total) return []

  const metrics: { key: string; label: string; value: number }[] = [
    { key: 'total_contributions',  label: '잔디 수',    value: user.total_contributions  ?? 0 },
    { key: 'current_streak',       label: '현재 스트릭', value: user.current_streak       ?? 0 },
    { key: 'longest_streak',       label: '최대 스트릭', value: user.longest_streak       ?? 0 },
    { key: 'contribution_density', label: '밀도',       value: user.contribution_density ?? 0 },
    { key: 'peak_intensity',       label: '피크 강도',   value: user.peak_intensity       ?? 0 },
    { key: 'total_stars',          label: '레포 스타',   value: user.total_stars          ?? 0 },
  ]

  const counts = await Promise.all(
    metrics.map(({ key, value }) =>
      supabase.from('users').select('*', { count: 'exact', head: true }).lt(key, value)
    )
  )

  return metrics.map(({ key, label }, i) => ({
    key,
    label,
    pct: Math.round(((counts[i].count ?? 0) / total) * 100),
  }))
}
