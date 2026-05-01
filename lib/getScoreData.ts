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

  await supabase.from('users').upsert(
    {
      github_id: username,
      score,
      total_contributions: stats.total_contributions,
      current_streak: stats.current_streak,
      longest_streak: stats.longest_streak,
      contribution_density: stats.contribution_density,
      peak_intensity: stats.peak_intensity,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'github_id' }
  )

  const { data: row } = await supabase
    .from('users')
    .select('percentile, tier, tier_rank')
    .eq('github_id', username)
    .single()

  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('score', score)
  const rank = (count ?? 0) + 1

  const tierInfo = getTierInfo(row?.percentile ?? null, rank)

  await supabase
    .from('users')
    .update({ tier: tierInfo.tier, tier_rank: tierInfo.tier_rank })
    .eq('github_id', username)

  return {
    github_id: username,
    score,
    tier: tierInfo.tier,
    tier_rank: tierInfo.tier_rank,
    percentile: row?.percentile ?? null,
    details: {
      total_contributions: stats.total_contributions,
      current_streak: stats.current_streak,
      longest_streak: stats.longest_streak,
      contribution_density: stats.contribution_density,
      peak_intensity: stats.peak_intensity,
    },
  }
}
