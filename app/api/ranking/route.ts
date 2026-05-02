export const runtime = 'edge'

import { supabase } from '@/lib/supabase'

export async function GET() {
  const [{ data: rows, error }, { count: total }] = await Promise.all([
    supabase
      .from('users')
      .select('github_id, score, tier, tier_rank, percentile')
      .order('score', { ascending: false })
      .limit(100),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const users = (rows ?? []).map((row, i) => ({
    rank: i + 1,
    github_id: row.github_id,
    score: row.score,
    tier: row.tier,
    tier_rank: row.tier_rank,
    percentile: row.percentile,
  }))

  return Response.json({ users, total: total ?? 0 })
}
