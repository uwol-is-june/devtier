export const runtime = 'edge'

import { supabase } from '@/lib/supabase'

export async function GET() {
  const [{ data: rows }, { count: totalUsers }] = await Promise.all([
    supabase.from('user_achievements').select('achievement_id'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  const countMap: Record<string, number> = {}
  for (const row of rows ?? []) {
    countMap[row.achievement_id] = (countMap[row.achievement_id] ?? 0) + 1
  }

  const stats = Object.entries(countMap).map(([achievement_id, holder_count]) => ({
    achievement_id,
    holder_count,
    percentage: totalUsers ? (holder_count / totalUsers) * 100 : 0,
  }))

  return Response.json(
    { stats, total_users: totalUsers ?? 0 },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  )
}
