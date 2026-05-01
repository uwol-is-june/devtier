import { supabase } from '@/lib/supabase'
import { fetchContributions } from '@/lib/github'
import { calcScore } from '@/lib/score'

const DB_CHUNK = 1000
const GITHUB_DELAY_MS = 750
const RATE_LIMIT_DELAY_MS = 60_000

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchAllUsers(): Promise<{ id: number; github_id: string }[]> {
  const all: { id: number; github_id: string }[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('users')
      .select('id, github_id')
      .order('id')
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
  const users = await fetchAllUsers()
  console.log(`총 ${users.length}명 점수 계산 시작`)

  const failed: string[] = []
  let processed = 0

  for (const user of users) {
    try {
      const stats = await fetchContributions(user.github_id)
      const score = calcScore(stats)

      const { error } = await supabase.from('users').upsert(
        {
          github_id: user.github_id,
          score,
          total_contributions: stats.total_contributions,
          current_streak: stats.current_streak,
          longest_streak: stats.longest_streak,
          contribution_density: stats.contribution_density,
          peak_intensity: stats.peak_intensity,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'github_id' },
      )
      if (error) throw new Error(error.message)

      processed++
      if (processed % 100 === 0) {
        console.log(`${processed}/${users.length} 완료 (실패: ${failed.length})`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.toLowerCase().includes('rate limit')) {
        console.warn(`  Rate limit 감지 → ${RATE_LIMIT_DELAY_MS / 1000}초 대기 후 재시도`)
        await delay(RATE_LIMIT_DELAY_MS)
        // 재시도 없이 스킵 (다음 실행에서 처리)
      }
      console.warn(`[SKIP] ${user.github_id}: ${msg}`)
      failed.push(user.github_id)
    }

    await delay(GITHUB_DELAY_MS)
  }

  console.log(`\n완료: ${processed}명 성공, ${failed.length}명 실패`)
  if (failed.length > 0) {
    console.log('실패 목록:', failed.join(', '))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
