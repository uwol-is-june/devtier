import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data: rows, error } = await supabase
    .from('users')
    .select('github_id, score, tier, tier_rank')
    .order('score', { ascending: false })
    .limit(100)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const ranking = (rows ?? []).map((row, i) => ({
    rank: i + 1,
    github_id: row.github_id,
    score: row.score,
    tier: row.tier,
    tier_rank: row.tier_rank,
  }))

  return Response.json(ranking)
}
