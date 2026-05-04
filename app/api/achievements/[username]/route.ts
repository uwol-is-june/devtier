import { supabase } from '@/lib/supabase'
import { getProgress, ACHIEVEMENT_RULES, type AchievementStats } from '@/lib/achievements'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const [{ data: userRow }, { data: masterList }, { data: unlockedRows }] = await Promise.all([
    supabase
      .from('users')
      .select('score, total_contributions, longest_streak, contribution_density, peak_intensity, total_stars, tier, tier_rank, created_at')
      .eq('github_id', username)
      .single(),
    supabase.from('achievements').select('*').order('sort_order'),
    supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('github_id', username),
  ])

  if (!userRow) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  const { count: higherCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('score', userRow.score)
  const rank = (higherCount ?? 0) + 1

  const unlockedMap = new Map(
    (unlockedRows ?? []).map((r) => [r.achievement_id, r.unlocked_at])
  )

  const achievementStats: AchievementStats = {
    total_contributions: userRow.total_contributions ?? 0,
    longest_streak: userRow.longest_streak ?? 0,
    contribution_density: userRow.contribution_density ?? 0,
    peak_intensity: userRow.peak_intensity ?? 0,
    total_stars: userRow.total_stars ?? 0,
    tier: userRow.tier ?? 'bronze',
    tier_rank: userRow.tier_rank ?? null,
    rank,
    created_at: userRow.created_at ?? new Date().toISOString(),
  }

  const achievements = (masterList ?? []).map((a) => {
    const isUnlocked = unlockedMap.has(a.id)
    return {
      id: a.id,
      category: a.category,
      name_ko: a.name_ko,
      description: a.description,
      rarity: a.rarity,
      icon: a.icon,
      unlocked: isUnlocked,
      unlocked_at: unlockedMap.get(a.id) ?? null,
      progress: isUnlocked ? null : getProgress(achievementStats, a.id),
    }
  })

  // masterList에 없는 rule은 ACHIEVEMENT_RULES 기준 total 사용
  const total = ACHIEVEMENT_RULES.length

  return Response.json({
    github_id: username,
    achievements,
    summary: { total, unlocked: unlockedMap.size },
  })
}
