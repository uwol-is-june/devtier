import { fetchContributions } from './github'
import { calcScore } from './score'
import { getTierInfo } from './tier'
import { supabase } from './supabase'

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
  }
}

export async function getScoreData(username: string): Promise<ScoreData> {
  const stats = await fetchContributions(username)
  const score = calcScore(stats)

  const [{ count }, { count: totalUsers }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).gt('score', score),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])
  const rank = (count ?? 0) + 1
  const livePercentile = totalUsers ? (rank / totalUsers) * 100 : null

  const tierInfo = getTierInfo(livePercentile, rank)

  await supabase.from('users').upsert(
    {
      github_id: username,
      score,
      total_contributions: stats.total_contributions,
      current_streak: stats.current_streak,
      longest_streak: stats.longest_streak,
      contribution_density: stats.contribution_density,
      peak_intensity: stats.peak_intensity,
      tier: tierInfo.tier,
      tier_rank: tierInfo.tier_rank,
      percentile: livePercentile,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'github_id' }
  )

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
    },
  }
}
