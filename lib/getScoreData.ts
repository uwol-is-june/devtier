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
  details: {
    total_contributions: number
    current_streak: number
    longest_streak: number
    contribution_density: number
    peak_intensity: number
    total_stars: number
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
  if (unlockedIds.length > 0) {
    await supabase.from('user_achievements').upsert(
      unlockedIds.map((id) => ({ github_id: username, achievement_id: id, unlocked_at: now })),
      { onConflict: 'github_id,achievement_id', ignoreDuplicates: true }
    )
  }

  return {
    github_id: username,
    score,
    tier: tierInfo.tier,
    tier_rank: tierInfo.tier_rank,
    percentile: livePercentile,
    total_users: totalUsers ?? null,
    details: {
      total_contributions: stats.total_contributions,
      current_streak: stats.current_streak,
      longest_streak: stats.longest_streak,
      contribution_density: stats.contribution_density,
      peak_intensity: stats.peak_intensity,
      total_stars: stats.total_stars,
    },
  }
}
