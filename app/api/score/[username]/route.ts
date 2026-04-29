import { fetchContributions } from '@/lib/github'
import { calcScore } from '@/lib/score'
import { getTierInfo } from '@/lib/tier'
import { supabase } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  let stats
  try {
    stats = await fetchContributions(username)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = msg.includes('not found') ? 404 : 500
    return Response.json({ error: msg }, { status })
  }

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

  return Response.json({
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
  })
}
