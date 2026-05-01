import { supabase } from '@/lib/supabase'
import { getTierInfo } from '@/lib/tier'

const DB_CHUNK = 1000
const UPSERT_CHUNK = 500

async function fetchAllScores(): Promise<{ github_id: string; score: number }[]> {
  const all: { github_id: string; score: number }[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('users')
      .select('github_id, score')
      .order('score', { ascending: false })
      .range(from, from + DB_CHUNK - 1)
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < DB_CHUNK) break
    from += DB_CHUNK
  }
  return all
}

async function main() {
  const users = await fetchAllScores()
  const total = users.length
  console.log(`총 ${total}명 티어 재산출 시작`)

  const now = new Date().toISOString()
  const updates = users.map((user, i) => {
    const rank = i + 1
    const percentile = total > 1 ? ((rank - 1) / total) * 100 : 0
    const { tier, tier_rank } = getTierInfo(percentile, rank)
    return { github_id: user.github_id, percentile, tier, tier_rank, updated_at: now }
  })

  for (let i = 0; i < updates.length; i += UPSERT_CHUNK) {
    const chunk = updates.slice(i, i + UPSERT_CHUNK)
    const { error } = await supabase.from('users').upsert(chunk, { onConflict: 'github_id' })
    if (error) throw new Error(`upsert 실패 (${i}~${i + chunk.length}): ${error.message}`)
    console.log(`  ${Math.min(i + UPSERT_CHUNK, updates.length)}/${total} 완료`)
  }

  const tierCounts = updates.reduce(
    (acc, u) => {
      const key = u.tier_rank !== null ? `${u.tier} ${u.tier_rank}` : u.tier
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  console.log('\n티어 분포:')
  Object.entries(tierCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([tier, count]) => console.log(`  ${tier}: ${count}명`))
  console.log('\n완료')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
